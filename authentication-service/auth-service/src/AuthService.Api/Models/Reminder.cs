using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Api.Models;

public class Reminder
{
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }  

    [Required]
    public DateTime EventDate { get; set; }

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public bool Confirmed { get; set; } = false;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}