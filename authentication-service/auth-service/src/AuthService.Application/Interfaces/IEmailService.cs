namespace AuthService.Application.Interfaces;

public interface IEmailService
{
    Task SendVerificationEmail(string toEmail, string token);
    Task SendVerificationEmailWithStudentData(string toEmail, string token, string studentName, string studentCarnet, string studentSection);
}