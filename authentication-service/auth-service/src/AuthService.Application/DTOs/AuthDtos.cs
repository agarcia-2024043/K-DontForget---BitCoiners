using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    public string Role { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del encargado es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres.")]
    public string NombreEncargado { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido del encargado es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El apellido no puede exceder 100 caracteres.")]
    public string ApellidoEncargado { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "El nombre del estudiante no puede exceder 100 caracteres.")]
    public string? NombreEstudiante { get; set; }

    [RegularExpression(@"^\d{7}$", ErrorMessage = "El carnet debe tener exactamente 7 dígitos. Ejemplo: 2024043")]
    public string? CarnetEstudiante { get; set; }

    [RegularExpression(@"^[A-Z]{2}\d[A-Z]{2}$", ErrorMessage = "La sección debe tener el formato correcto. Ejemplo: IN6AM")]
    public string? SeccionTecnica { get; set; }

    public string? SecretCode { get; set; }

    [Required(ErrorMessage = "El número de teléfono es obligatorio.")]
    [Phone(ErrorMessage = "El número de teléfono no tiene un formato válido.")]
    [MaxLength(20, ErrorMessage = "El número de teléfono no puede exceder 20 caracteres.")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public record RegisterResult(bool Success, string Message, string? VerificationLink = null, string? Error = null, string? VerificationToken = null);
public record VerifyResult(bool Success, string Message);
public record LoginResult(bool Success, string Message, string? Token = null, string? Email = null, string? Role = null, string? PhoneNumber = null);


public class ExternalLoginRequest
{
    [Required(ErrorMessage = "El token es obligatorio.")]
    public string Token { get; set; } = string.Empty;
}