using AuthService.Domain.Entities;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Data;

public static class DataSeeder
{
    private static readonly List<(string Email, string Password)> CoordinatorUsers = new()
    {
        ("agarcia-2024043@kinal.edu.gt", "Admin123!"),
        ("lcastro@kinal.edu.gt", "Admin123!"),
    };

    public static async Task SeedCoordinatorsAsync(AuthDbContext db)
    {
        foreach (var (email, password) in CoordinatorUsers)
        {
            var exists = await db.Users.AnyAsync(u => u.Email == email);
            if (!exists)
            {
                var coordinator = new User
                {
                    Id                = Guid.NewGuid(),
                    Email             = email,
                    PasswordHash      = BCrypt.Net.BCrypt.HashPassword(password, 12),
                    Role              = "Coordinador",
                    IsVerified        = true,
                    VerificationToken = null,
                    NombreEncargado   = "Coordinador",
                    ApellidoEncargado = "Kinal",
                    NombreEstudiante  = "N/A",
                    CarnetEstudiante  = "N/A",
                    SeccionTecnica    = "N/A"
                };

                db.Users.Add(coordinator);
            }
        }

        await db.SaveChangesAsync();
    }
}