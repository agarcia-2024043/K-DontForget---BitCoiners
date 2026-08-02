using AuthService.Domain.Entities;

namespace AuthService.Application.Interfaces;

public interface IReminderService
{
    Task<IEnumerable<Reminder>> GetPendingRemindersAsync();
    Task<Reminder> CreateReminderAsync(Reminder reminder);
    Task<Reminder?> ConfirmAttendanceAsync(int id);
}