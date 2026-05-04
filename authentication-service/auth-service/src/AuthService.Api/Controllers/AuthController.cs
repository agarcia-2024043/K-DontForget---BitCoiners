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

/// <summary>
/// Controlador de autenticación para Schedule K (Fundación Kinal).
/// Gestiona el registro, verificación y login de usuarios (Padres y Coordinadores).
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Produces("application/json")]
[Tags("Auth")]
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

    /// <summary>
    /// Registrar un nuevo usuario en el sistema.
    /// </summary>
    /// <remarks>
    /// Registra un Padre o Coordinador en el sistema.
    ///
    /// - **Padre**: Recibe un correo de verificación antes de poder iniciar sesión.
    /// - **Coordinador**: Requiere un código secreto y queda verificado inmediatamente.
    ///
    /// Ejemplo de request para Padre:
    /// <code>
    /// {
    ///   "email": "padre@kinal.edu.gt",
    ///   "password": "MiClave123",
    ///   "role": "Padre"
    /// }
    /// </code>
    ///
    /// Ejemplo de request para Coordinador:
    /// <code>
    /// {
    ///   "email": "coord@kinal.edu.gt",
    ///   "password": "MiClave123",
    ///   "role": "Coordinador",
    ///   "secretCode": "CODIGO_SECRETO"
    /// }
    /// </code>
    /// </remarks>
    /// <param name="request">Datos de registro del usuario.</param>
    /// <returns>Confirmación de registro o error.</returns>
    /// <response code="200">Registro exitoso. Padre: se envía correo de verificación. Coordinador: verificado inmediatamente.</response>
    /// <response code="400">Datos inválidos, usuario ya existente o código secreto incorrecto.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorDetailResponse), StatusCodes.Status400BadRequest)]
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
            IsVerified = isCoordinator,
            VerificationToken = isCoordinator ? null : Guid.NewGuid().ToString()
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if (isCoordinator)
            return Ok(new { message = "Coordinador registrado y verificado correctamente. Ya puedes iniciar sesión." });

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

    /// <summary>
    /// Verificar la cuenta de un Padre mediante el token enviado por correo.
    /// </summary>
    /// <remarks>
    /// Este endpoint es el enlace que recibe el Padre en su correo de verificación.
    ///
    /// Ejemplo:
    /// ```
    /// GET /api/auth/verify?token=abc123def456
    /// ```
    /// </remarks>
    /// <param name="token">Token de verificación enviado al correo del usuario.</param>
    /// <returns>Confirmación de verificación o error.</returns>
    /// <response code="200">Cuenta verificada correctamente.</response>
    /// <response code="400">Token inválido, vacío o ya utilizado.</response>
    [HttpGet("verify")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
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

    /// <summary>
    /// Iniciar sesión en el sistema.
    /// </summary>
    /// <remarks>
    /// Autentica al usuario con email y contraseña. Retorna un token JWT válido por 8 horas.
    ///
    /// Ejemplo de request:
    /// <code>
    /// {
    ///   "email": "padre@kinal.edu.gt",
    ///   "password": "MiClave123"
    /// }
    /// </code>
    ///
    /// Ejemplo de respuesta exitosa:
    /// <code>
    /// {
    ///   "message": "Login exitoso",
    ///   "token": "eyJhbGciOiJIUzI1NiIs...",
    ///   "user": {
    ///     "email": "padre@kinal.edu.gt",
    ///     "role": "Padre"
    ///   }
    /// }
    /// </code>
    /// </remarks>
    /// <param name="request">Credenciales del usuario.</param>
    /// <returns>Token JWT y datos del usuario autenticado.</returns>
    /// <response code="200">Login exitoso. Retorna token JWT.</response>
    /// <response code="401">Credenciales incorrectas o cuenta no verificada.</response>
    /// <response code="500">Error interno al generar el token.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status500InternalServerError)]
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

// ── Response models ──────────────────────────────────────────────────────────

/// <summary>Respuesta con mensaje simple.</summary>
public record MessageResponse(
    /// <summary>Mensaje descriptivo del resultado.</summary>
    string Message
);

/// <summary>Respuesta de error con detalle de validación.</summary>
public record ErrorDetailResponse(
    /// <summary>Mensaje de error.</summary>
    string Message,
    /// <summary>Lista de errores de validación.</summary>
    string[] Detalles
);

/// <summary>Respuesta exitosa de login.</summary>
public record LoginResponse(
    /// <summary>Mensaje de confirmación.</summary>
    string Message,
    /// <summary>Token JWT generado (válido 8 horas).</summary>
    string Token,
    /// <summary>Datos básicos del usuario autenticado.</summary>
    UserInfo User
);

/// <summary>Datos básicos del usuario autenticado.</summary>
public record UserInfo(
    /// <summary>Email del usuario.</summary>
    string Email,
    /// <summary>Rol del usuario (Padre o Coordinador).</summary>
    string Role
);