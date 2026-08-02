using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IAuthService
{
    Task<RegisterResult> RegisterAsync(RegisterRequest request, string? baseUrl);
    Task<VerifyResult> VerifyEmailAsync(string token);
    Task<LoginResult> LoginAsync(LoginRequest request);
    Task<LoginResult> LoginWithGoogleAsync(string accessToken);
    Task<LoginResult> LoginWithMicrosoftAsync(string accessToken);
}