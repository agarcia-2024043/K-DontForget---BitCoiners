using Microsoft.EntityFrameworkCore;
using AuthService.Api.Models;

namespace AuthService.Api.Data;

public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Reminder> Reminders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.VerificationToken)
                .HasMaxLength(500)
                .IsRequired(false);

            entity.HasIndex(e => e.Email)
                .IsUnique();
        });

        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.EventDate)
                .IsRequired();

            entity.Property(e => e.Confirmed)
                .HasDefaultValue(false);

            entity.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}