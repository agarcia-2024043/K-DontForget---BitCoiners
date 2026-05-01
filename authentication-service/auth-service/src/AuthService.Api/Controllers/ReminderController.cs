using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Api.Data;
using AuthService.Api.Models;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RemindersController : ControllerBase
{
    private readonly AuthDbContext _context;

    public RemindersController(AuthDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetReminders()
    {
        var reminders = await _context.Reminders
            .Where(r => r.Status == "Pending")
            .ToListAsync();

        return Ok(reminders);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReminder(Reminder reminder)
    {
        reminder.Status = "Pending";
        reminder.Confirmed = false;

        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();

        return Ok(reminder);
    }

    [HttpPost("confirm/{id}")]
    public async Task<IActionResult> ConfirmAttendance(int id)
    {
        var reminder = await _context.Reminders.FindAsync(id);

        if (reminder == null)
            return NotFound();

        reminder.Confirmed = true;
        reminder.Status = "Confirmed";

        await _context.SaveChangesAsync();

        return Ok(reminder);
    }
}