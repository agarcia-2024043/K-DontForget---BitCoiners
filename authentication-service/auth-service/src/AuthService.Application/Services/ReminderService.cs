using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Persistence.Repositories;

namespace AuthService.Application.Services;

public class ReminderService : IReminderService
{
    private readonly IReminderRepository _reminderRepository;

    public ReminderService(IReminderRepository reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    public async Task<IEnumerable<Reminder>> GetPendingRemindersAsync()
        => await _reminderRepository.GetPendingAsync();

    public async Task<Reminder> CreateReminderAsync(Reminder reminder)
    {
        reminder.Status = "Pending";
        reminder.Confirmed = false;
        return await _reminderRepository.AddAsync(reminder);
    }

    public async Task<Reminder?> ConfirmAttendanceAsync(int id)
    {
        var reminder = await _reminderRepository.GetByIdAsync(id);
        if (reminder == null) return null;

        reminder.Confirmed = true;
        reminder.Status = "Confirmed";
        await _reminderRepository.UpdateAsync(reminder);
        return reminder;
    }
}