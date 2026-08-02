using AuthService.Domain.Entities;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Repositories;

public class ReminderRepository : IReminderRepository
{
    private readonly AuthDbContext _context;

    public ReminderRepository(AuthDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Reminder>> GetPendingAsync()
        => await _context.Reminders.Where(r => r.Status == "Pending").ToListAsync();

    public async Task<Reminder?> GetByIdAsync(int id)
        => await _context.Reminders.FindAsync(id);

    public async Task<Reminder> AddAsync(Reminder reminder)
    {
        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();
        return reminder;
    }

    public async Task UpdateAsync(Reminder reminder)
    {
        _context.Reminders.Update(reminder);
        await _context.SaveChangesAsync();
    }
}