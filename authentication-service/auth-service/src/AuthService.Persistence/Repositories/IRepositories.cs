using AuthService.Domain.Entities;

namespace AuthService.Persistence.Repositories;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByVerificationTokenAsync(string token);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
}

public interface IReminderRepository
{
    Task<IEnumerable<Reminder>> GetPendingAsync();
    Task<Reminder?> GetByIdAsync(int id);
    Task<Reminder> AddAsync(Reminder reminder);
    Task UpdateAsync(Reminder reminder);
}