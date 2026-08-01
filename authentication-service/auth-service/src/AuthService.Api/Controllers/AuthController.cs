using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Persistence.Repositories;
using Microsoft.AspNetCore.Mvc;

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
    private readonly IAuthService _authService;
    private readonly IConfiguration _config;
    private readonly IUserRepository _userRepository;

    public AuthController(IAuthService authService, IConfiguration config, IUserRepository userRepository)
    {
        _authService = authService;
        _config = config;
        _userRepository = userRepository;
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
    /// <response code="200">Registro exitoso.</response>
    /// <response code="400">Datos inválidos, usuario ya existente o código secreto incorrecto.</response>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var baseUrl = _config["ApplicationUrl"];
        var result = await _authService.RegisterAsync(request, baseUrl);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        if (result.VerificationLink != null)
            return Ok(new { message = result.Message, verificationLink = result.VerificationLink, error = result.Error, verificationToken = result.VerificationToken });

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Verificar la cuenta de un Padre mediante el token enviado por correo.
    /// </summary>
    /// <param name="token">Token de verificación enviado al correo del usuario.</param>
    /// <returns>Confirmación de verificación o error.</returns>
    /// <response code="200">Cuenta verificada correctamente.</response>
    /// <response code="400">Token inválido, vacío o ya utilizado.</response>
    [HttpGet("verify")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Verify(string token)
    {
        var result = await _authService.VerifyEmailAsync(token);

        if (!result.Success)
            return BadRequest(result.Message);

        return Ok(result.Message);
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
    /// </remarks>
    /// <param name="request">Credenciales del usuario.</param>
    /// <returns>Token JWT y datos del usuario autenticado.</returns>
    /// <response code="200">Login exitoso. Retorna token JWT.</response>
    /// <response code="401">Credenciales incorrectas o cuenta no verificada.</response>
    /// <response code="500">Error interno al generar el token.</response>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);

            if (!result.Success)
                return Unauthorized(new { message = result.Message });

            return Ok(new
            {
                message = result.Message,
                token = result.Token,
                user = new { nombre = result.Email, role = result.Role, phoneNumber = result.PhoneNumber }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al generar el token", details = ex.Message });
        }
    }

    /// <summary>
    /// Iniciar sesión o registrarse con Google.
    /// </summary>
    [HttpPost("google")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GoogleLogin([FromBody] ExternalLoginRequest request)
    {
        var result = await _authService.LoginWithGoogleAsync(request.Token);
        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new
        {
            message = result.Message,
            token = result.Token,
            user = new { nombre = result.Email, role = result.Role }
        });
    }

    /// <summary>
    /// Iniciar sesión o registrarse con Microsoft.
    /// </summary>
    [HttpPost("microsoft")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MicrosoftLogin([FromBody] ExternalLoginRequest request)
    {
        var result = await _authService.LoginWithMicrosoftAsync(request.Token);
        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new
        {
            message = result.Message,
            token = result.Token,
            user = new { nombre = result.Email, role = result.Role }
        });
    }
    /// <summary>
    /// Obtener datos del usuario autenticado (incluyendo teléfono).
    /// </summary>
    /// <returns>Datos del usuario autenticado.</returns>
    /// <response code="200">Datos del usuario retornados correctamente.</response>
    /// <response code="404">Usuario no encontrado.</response>
    [HttpGet("me/{email}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMe(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado." });

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            role = user.Role,
            phoneNumber = user.PhoneNumber,
            nombreEncargado = user.NombreEncargado,
            apellidoEncargado = user.ApellidoEncargado
        });
    }
}