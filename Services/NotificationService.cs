using MySql.Data.MySqlClient;
using OfflinePushNotification.Data;
using OfflinePushNotification.Models;

namespace OfflinePushNotification.Services
{
    public class NotificationService : INotificationService
    {
        private readonly DatabaseHelper _dbHelper;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(DatabaseHelper dbHelper, ILogger<NotificationService> logger)
        {
            _dbHelper = dbHelper;
            _logger = logger;
        }

        public async Task<int> CreateNotificationAsync(string title, string message, string type = "info", int? userId = null, string? userGroup = null)
        {
            var parameters = new[]
            {
                new MySqlParameter("@p_Title", title),
                new MySqlParameter("@p_Message", message),
                new MySqlParameter("@p_Type", type),
                new MySqlParameter("@p_UserId", userId.HasValue ? userId.Value : DBNull.Value),
                new MySqlParameter("@p_UserGroup", userGroup ?? (object)DBNull.Value)
            };

            var notificationId = await _dbHelper.ExecuteScalarAsync<int>("sp_CreateNotification", parameters);
            _logger.LogInformation("Created notification with ID: {NotificationId}", notificationId);
            
            return notificationId;
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(int userId, int limit = 50)
        {
            var parameters = new[]
            {
                new MySqlParameter("@p_UserId", userId),
                new MySqlParameter("@p_Limit", limit)
            };

            return await _dbHelper.ExecuteReaderAsync("sp_GetUserNotifications", MapNotification, parameters);
        }

        public async Task MarkAsReadAsync(int notificationId, int userId)
        {
            var parameters = new[]
            {
                new MySqlParameter("@p_NotificationId", notificationId),
                new MySqlParameter("@p_UserId", userId)
            };

            await _dbHelper.ExecuteNonQueryAsync("sp_MarkNotificationAsRead", parameters);
            _logger.LogInformation("Marked notification {NotificationId} as read for user {UserId}", notificationId, userId);
        }

        public async Task MarkAsDeliveredAsync(int notificationId)
        {
            var parameters = new[]
            {
                new MySqlParameter("@p_NotificationId", notificationId)
            };

            await _dbHelper.ExecuteNonQueryAsync("sp_MarkNotificationAsDelivered", parameters);
            _logger.LogInformation("Marked notification {NotificationId} as delivered", notificationId);
        }

        private static Notification MapNotification(MySqlDataReader reader)
        {
            return new Notification
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Message = reader.GetString(reader.GetOrdinal("Message")),
                Type = reader.GetString(reader.GetOrdinal("Type")),
                UserId = reader.IsDBNull(reader.GetOrdinal("UserId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("UserId")),
                UserGroup = reader.IsDBNull(reader.GetOrdinal("UserGroup")) ? (string?)null : reader.GetString(reader.GetOrdinal("UserGroup")),
                IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                ReadAt = reader.IsDBNull(reader.GetOrdinal("ReadAt")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ReadAt")),
                IsDelivered = reader.GetBoolean(reader.GetOrdinal("IsDelivered")),
                DeliveredAt = reader.IsDBNull(reader.GetOrdinal("DeliveredAt")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("DeliveredAt"))
            };
        }
    }
}
