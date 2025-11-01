using OfflinePushNotification.Models;

namespace OfflinePushNotification.Services
{
    public interface IUserService
    {
        Task<int> CreateOrUpdateUserAsync(string username, string email, string connectionId);
        Task UpdateConnectionStatusAsync(string connectionId, bool isOnline);
        Task<List<User>> GetOnlineUsersAsync();
        Task<List<User>> GetAllUsersAsync();
    }
}
