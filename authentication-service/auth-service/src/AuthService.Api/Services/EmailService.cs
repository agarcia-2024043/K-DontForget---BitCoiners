using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Utils;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuthService.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendVerificationEmail(string toEmail, string token)
    {
        var senderEmail = _config["EmailSettings:Email"] ?? throw new InvalidOperationException("Email not configured");
        var password = _config["EmailSettings:Password"] ?? throw new InvalidOperationException("Email password not configured");
        var host = _config["EmailSettings:Host"] ?? "smtp.gmail.com";
        var port = _config.GetValue<int>("EmailSettings:Port", 587);

        var baseUrl = _config["ApplicationUrl"] ?? "http://localhost:5065";
        var link = $"{baseUrl.TrimEnd('/')}/api/auth/verify?token={token}";

        // Ruta del logo — pon tu archivo logo.jpg en la misma carpeta que EmailService.cs
        // Esto busca el archivo en la carpeta raíz donde corre el .exe
var logoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "authentication-service/auth-service/src/AuthService.Api/Services/logo.jpg");

// LOG DE DEPURACIÓN: Agrega esto para ver exactamente dónde está buscando el programa
_logger.LogInformation("Buscando logo en: {Path}", logoPath);

var hasLogo = File.Exists(logoPath);
if (!hasLogo) 
{
    _logger.LogWarning("¡Atención! El archivo de logo no se encontró en la ruta especificada.");
}

        var builder = new BodyBuilder();

        string logoTag = "";
        if (hasLogo)
        {
            var image = builder.LinkedResources.Add(logoPath);
            image.ContentId = MimeUtils.GenerateMessageId();
            logoTag = $"<img src='cid:{image.ContentId}' alt='K-DontForget' style='height:60px;margin-bottom:10px;'><br>";
        }

        builder.HtmlBody = $@"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    </head>
    <body style='margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,sans-serif;'>

    <table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f6f9;padding:40px 0;'>
        <tr>
        <td align='center'>

            <table width='560' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>

            <!-- Header dorado -->
            <tr>
                <td style='background:linear-gradient(135deg,#C9A84C,#a0722a);padding:36px 40px;text-align:center;'>
                {logoTag}
                <h1 style='margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;'>K-DontForget</h1>
                <p style='margin:6px 0 0;color:#f5e6c0;font-size:13px;'>Sistema de Gestión de Citas · Fundación Kinal</p>
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td style='padding:40px 40px 20px;'>
                <h2 style='margin:0 0 12px;color:#1a1a2e;font-size:20px;'>¡Bienvenido a K-DontForget!</h2>
                <p style='margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;'>
                    Gracias por registrarte. Para activar tu cuenta y comenzar a gestionar tus citas,
                    haz clic en el botón de abajo.
                </p>

                <!-- Botón dorado -->
                <table cellpadding='0' cellspacing='0' style='margin:28px 0;'>
                    <tr>
                    <td style='background:linear-gradient(135deg,#C9A84C,#a0722a);border-radius:8px;'>
                        <a href='{link}'
                        style='display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;
                                font-weight:bold;text-decoration:none;letter-spacing:0.5px;'>
                        Verificar mi cuenta
                        </a>
                    </td>
                    </tr>
                </table>

                <p style='margin:0 0 8px;color:#777;font-size:13px;'>
                    Si el botón no funciona, copia y pega este enlace en tu navegador:
                </p>
                <p style='margin:0;word-break:break-all;'>
                    <a href='{link}' style='color:#C9A84C;font-size:12px;'>{link}</a>
                </p>
                </td>
            </tr>

            <!-- Divider -->
            <tr>
                <td style='padding:0 40px;'>
                <hr style='border:none;border-top:1px solid #e8eaf0;margin:0;'>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style='padding:20px 40px 36px;text-align:center;'>
                <p style='margin:0 0 6px;color:#999;font-size:12px;'>
                    Si no solicitaste este registro, puedes ignorar este correo.
                </p>
                <p style='margin:0;color:#bbb;font-size:11px;'>
                    © 2025 K-DontForget · Fundación Kinal · Guatemala
                </p>
                </td>
            </tr>

            </table>
        </td>
        </tr>
    </table>

</body>
</html>";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("K-DontForget", senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Verifica tu cuenta - K-DontForget";
        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;
            client.Timeout = 30000;

            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Correo enviado exitosamente a {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error crítico enviando correo a {Email}", toEmail);
            Console.WriteLine($"\n[AVISO] Falló el correo. Link de verificación: {link}\n");
            throw;
        }
    }
}