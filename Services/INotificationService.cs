using OfflinePushNotification.Models;

namespace OfflinePushNotification.Services
{
    public interface INotificationService
    {
        Task<int> CreateNotificationAsync(string title, string message, string type = "info", int? userId = null, string? userGroup = null, string? imageUrl = null, string? actionText = null, string? actionUrl = null);
        Task<List<Notification>> GetUserNotificationsAsync(int userId, int limit = 50);
        Task MarkAsReadAsync(int notificationId, int userId);
        Task MarkAsDeliveredAsync(int notificationId);
    }
}
