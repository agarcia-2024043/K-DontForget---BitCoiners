using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Api.DTOs;
using AuthService.Api.Services;
using AuthService.Api.Data;
using AuthService.Api.Models;

namespace AuthService.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    public AuthController(AuthDbContext context, IEmailService emailService, IConfiguration config)
    {
        _context = context;
        _emailService = emailService;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errores = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToArray();
            return BadRequest(new { message = "Datos inválidos.", detalles = errores });
        }

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { message = "El usuario ya existe." });

        // ── Coordinador: valida código secreto y se verifica automáticamente ──
        bool isCoordinator = request.Role == "Coordinador";
        if (isCoordinator)
        {
            var secret = _config["Security:CoordinatorSecret"];
            if (string.IsNullOrWhiteSpace(request.SecretCode) || request.SecretCode != secret)
                return BadRequest(new { message = "Código secreto de coordinador inválido." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            // Coordinador: verificado de inmediato. Padre: necesita verificar por correo.
            IsVerified = isCoordinator,
            VerificationToken = isCoordinator ? null : Guid.NewGuid().ToString()
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // ── Coordinador: respuesta inmediata, sin correo ──
        if (isCoordinator)
        {
            return Ok(new { message = "Coordinador registrado y verificado correctamente. Ya puedes iniciar sesión." });
        }

        // ── Padre: enviar correo de verificación ──
        var baseUrl = _config["ApplicationUrl"] ?? "http://localhost:5065";
        var link = $"{baseUrl.TrimEnd('/')}/api/auth/verify?token={user.VerificationToken}";

        try
        {
            await _emailService.SendVerificationEmail(user.Email, user.VerificationToken!);
            return Ok(new { message = "Registro exitoso. Revisa tu correo para verificar tu cuenta." });
        }
        catch (Exception ex)
        {
            return Ok(new { message = "Registro ok, pero falló el correo.", verificationLink = link, error = ex.Message });
        }
    }

    [HttpGet("verify")]
    public async Task<IActionResult> Verify(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return BadRequest("Token requerido.");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.VerificationToken == token.Trim());

        if (user == null) return BadRequest("Token inválido.");

        user.IsVerified = true;
        user.VerificationToken = null;
        await _context.SaveChangesAsync();

        return Ok("Cuenta verificada correctamente");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Credenciales incorrectas." });

        if (!user.IsVerified)
            return Unauthorized(new { message = "Cuenta no verificada. Revisa tu correo." });

        try
        {
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
                Audience = _config["Jwt:Audience"] ?? "ScheduleK_Clients",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new {
                message = "Login exitoso",
                token = tokenString,
                user = new { user.Email, user.Role }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al generar el token", details = ex.Message });
        }
    }
}