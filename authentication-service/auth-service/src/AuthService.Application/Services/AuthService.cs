using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Persistence.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepository, IEmailService emailService, IConfiguration config)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _config = config;
    }

    public async Task<RegisterResult> RegisterAsync(RegisterRequest request, string? baseUrl)
    {
        // Validar dominio de Kinal
        if (!IsValidKinalDomain(request.Email))
            return new RegisterResult(false, "El correo debe pertenecer al dominio de Kinal (@kinal.edu.gt o @kinal.org.gt).");

        if (await _userRepository.ExistsByEmailAsync(request.Email))
            return new RegisterResult(false, "El usuario ya existe.");

        // Validar que los campos de estudiante sean obligatorios solo para padres
        if (request.Role == "Padre")
        {
            if (string.IsNullOrWhiteSpace(request.NombreEstudiante))
                return new RegisterResult(false, "El nombre del estudiante es obligatorio para padres.");
            if (string.IsNullOrWhiteSpace(request.CarnetEstudiante))
                return new RegisterResult(false, "El carnet del estudiante es obligatorio para padres.");
            if (string.IsNullOrWhiteSpace(request.SeccionTecnica))
                return new RegisterResult(false, "La sección técnica es obligatoria para padres.");
        }

        var user = new User
        {
            Id                = Guid.NewGuid(),
            Email             = request.Email,
            PasswordHash      = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role              = request.Role,
            IsVerified        = false,
            VerificationToken = Guid.NewGuid().ToString(),
            NombreEncargado   = request.NombreEncargado,
            ApellidoEncargado = request.ApellidoEncargado,
            NombreEstudiante  = request.NombreEstudiante ?? string.Empty,
            CarnetEstudiante  = request.CarnetEstudiante ?? string.Empty,
            SeccionTecnica    = request.SeccionTecnica ?? string.Empty,
            PhoneNumber       = request.PhoneNumber ?? string.Empty
        };

        await _userRepository.AddAsync(user);

        var appUrl = baseUrl ?? _config["ApplicationUrl"] ?? "http://localhost:5065";
        var link = $"{appUrl.TrimEnd('/')}/api/auth/verify?token={user.VerificationToken}";

        // For development, return verification token directly for both parents and coordinators
        if (request.Role == "Padre")
        {
            try
            {
                await _emailService.SendVerificationEmailWithStudentData(
                    user.Email,
                    user.VerificationToken!,
                    request.NombreEstudiante ?? string.Empty,
                    request.CarnetEstudiante ?? string.Empty,
                    request.SeccionTecnica ?? string.Empty
                );
                return new RegisterResult(true, "Registro exitoso. Usa este token para verificar tu cuenta.", link, null, user.VerificationToken);
            }
            catch (Exception ex)
            {
                return new RegisterResult(true, "Registro ok, pero falló el correo.", link, ex.Message, user.VerificationToken);
            }
        }

        // For coordinators, also return the token for development/testing
        try
        {
            await _emailService.SendVerificationEmail(user.Email, user.VerificationToken!);
            return new RegisterResult(true, "Registro exitoso. Usa este token para verificar tu cuenta.", link, null, user.VerificationToken);
        }
        catch (Exception ex)
        {
            return new RegisterResult(true, "Registro ok, pero falló el correo.", link, ex.Message, user.VerificationToken);
        }
    }

    public async Task<VerifyResult> VerifyEmailAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return new VerifyResult(false, "Token requerido.");

        var user = await _userRepository.GetByVerificationTokenAsync(token.Trim());
        if (user == null)
            return new VerifyResult(false, "Token inválido.");

        user.IsVerified = true;
        user.VerificationToken = null;
        await _userRepository.UpdateAsync(user);

        return new VerifyResult(true, "Cuenta verificada correctamente");
    }

    public async Task<LoginResult> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return new LoginResult(false, "Credenciales incorrectas.");

        if (!user.IsVerified)
            return new LoginResult(false, "Cuenta no verificada. Revisa tu correo.");

        var tokenHandler = new JwtSecurityTokenHandler();
        var keyString = _config["Jwt:Key"] ?? "Qu3_R3gr353_3I_Mauu_La_Un0_m0n3da";
        var key = Encoding.UTF8.GetBytes(keyString);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim("role", user.Role),
                new Claim("phoneNumber", user.PhoneNumber ?? string.Empty)
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            Issuer = _config["Jwt:Issuer"] ?? "AuthService",
            Audience = _config["Jwt:Audience"] ?? "K-DONTFORGET_Clients",
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return new LoginResult(true, "Login exitoso", tokenString, user.Email, user.Role, user.PhoneNumber);
    }

    public async Task<LoginResult> LoginWithGoogleAsync(string accessToken)
    {
        using var httpClient = new HttpClient();
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
            if (!response.IsSuccessStatusCode)
            {
                return new LoginResult(false, "Token de Google inválido, expirado o sin permisos.");
            }

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            if (!root.TryGetProperty("email", out var emailProp))
            {
                return new LoginResult(false, "El perfil de Google no contiene un correo electrónico.");
            }

            var email = emailProp.GetString()!;
            var name = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : email.Split('@')[0];
            var givenName = root.TryGetProperty("given_name", out var gnProp) ? gnProp.GetString() : name;
            var familyName = root.TryGetProperty("family_name", out var fnProp) ? fnProp.GetString() : string.Empty;

            return await ProcessExternalUserAsync(email, givenName ?? "", familyName ?? "", "Google");
        }
        catch (Exception ex)
        {
            return new LoginResult(false, $"Error al verificar con Google: {ex.Message}");
        }
    }

    public async Task<LoginResult> LoginWithMicrosoftAsync(string accessToken)
    {
        using var httpClient = new HttpClient();
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var response = await httpClient.GetAsync("https://graph.microsoft.com/v1.0/me");
            if (!response.IsSuccessStatusCode)
            {
                return new LoginResult(false, "Token de Microsoft inválido, expirado o sin permisos.");
            }

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            string? email = null;
            if (root.TryGetProperty("mail", out var mailProp) && mailProp.ValueKind != JsonValueKind.Null)
            {
                email = mailProp.GetString();
            }
            if (string.IsNullOrEmpty(email) && root.TryGetProperty("userPrincipalName", out var upnProp))
            {
                email = upnProp.GetString();
            }

            if (string.IsNullOrEmpty(email))
            {
                return new LoginResult(false, "El token de Microsoft no contiene un correo electrónico válido.");
            }

            var displayName = root.TryGetProperty("displayName", out var dnProp) ? dnProp.GetString() : email.Split('@')[0];
            var givenName = root.TryGetProperty("givenName", out var gnProp) ? gnProp.GetString() : displayName;
            var surname = root.TryGetProperty("surname", out var snProp) ? snProp.GetString() : string.Empty;

            return await ProcessExternalUserAsync(email, givenName ?? "", surname ?? "", "Microsoft");
        }
        catch (Exception ex)
        {
            return new LoginResult(false, $"Error al verificar con Microsoft: {ex.Message}");
        }
    }

    private async Task<LoginResult> ProcessExternalUserAsync(string email, string givenName, string familyName, string provider)
    {
        // Avoid touching PostgreSQL database per user's request.
        // We create an in-memory user representation for token generation.
        var user = new User
        {
            Id                = Guid.NewGuid(),
            Email             = email,
            Role              = "Padre", // Default role
            NombreEncargado   = givenName,
            ApellidoEncargado = string.IsNullOrEmpty(familyName) ? "OAuth" : familyName
        };

        // Send verification email directly to the authenticated email address
        var verificationToken = Guid.NewGuid().ToString();
        try
        {
            await _emailService.SendVerificationEmail(email, verificationToken);
        }
        catch (Exception ex)
        {
            // Log or ignore SMTP connection/config exceptions so the login still succeeds
        }

        // Generate JWT token
        var tokenHandler = new JwtSecurityTokenHandler();
        var keyString = _config["Jwt:Key"] ?? "Qu3_R3gr353_3I_Mauu_La_Un0_m0n3da";
        var key = Encoding.UTF8.GetBytes(keyString);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim("role", user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            Issuer = _config["Jwt:Issuer"] ?? "AuthService",
            Audience = _config["Jwt:Audience"] ?? "K-DONTFORGET_Clients",
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        var message = $"Inicio de sesión con {provider} exitoso. Se ha enviado un correo de verificación a {email}.";
        return new LoginResult(true, message, tokenString, user.Email, user.Role);
    }

    private bool IsValidKinalDomain(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var domain = email.Split('@').LastOrDefault()?.ToLower();
        return domain == "kinal.edu.gt" || domain == "kinal.org.gt";
    }
}