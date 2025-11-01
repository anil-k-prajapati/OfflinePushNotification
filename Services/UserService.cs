using MySql.Data.MySqlClient;
using OfflinePushNotification.Data;
using OfflinePushNotification.Models;

namespace OfflinePushNotification.Services
{
    public class UserService : IUserService
    {
        private readonly DatabaseHelper _dbHelper;
        private readonly ILogger<UserService> _logger;

        public UserService(DatabaseHelper dbHelper, ILogger<UserService> logger)
        {
            _dbHelper = dbHelper;
            _logger = logger;
        }

        public async Task<int> CreateOrUpdateUserAsync(string username, string email, string connectionId)
        {
            var parameters = new[]
            {
                new MySqlParameter("@p_Username", username),
                new MySqlParameter("@p_Email", email),
                new MySqlParameter("@p_ConnectionId", connectionId)
            };

            var userId = await _dbHelper.ExecuteScalarAsync<int>("sp_CreateOrUpdateUser", parameters);
            _logger.LogInformation("Created/Updated user: {Username} with connection: {ConnectionId}", username, connectionId);
            
            return userId;
        }

        public async Task UpdateConnectionStatusAsync(string connectionId, bool isOnline)
        {
            var parameters = new[]
            {
                new MySqlParameter("@p_ConnectionId", connectionId),
                new MySqlParameter("@p_IsOnline", isOnline)
            };

            await _dbHelper.ExecuteNonQueryAsync("sp_UpdateUserConnectionStatus", parameters);
            _logger.LogInformation("Updated connection status for {ConnectionId}: {IsOnline}", connectionId, isOnline);
        }

        public async Task<List<User>> GetOnlineUsersAsync()
        {
            return await _dbHelper.ExecuteReaderAsync("sp_GetOnlineUsers", MapUser);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _dbHelper.ExecuteReaderAsync("sp_GetAllUsers", MapUser);
        }

        private static User MapUser(MySqlDataReader reader)
        {
            return new User
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                ConnectionId = reader.IsDBNull(reader.GetOrdinal("ConnectionId")) ? string.Empty : reader.GetString(reader.GetOrdinal("ConnectionId")),
                IsOnline = reader.GetBoolean(reader.GetOrdinal("IsOnline")),
                LastSeen = reader.GetDateTime(reader.GetOrdinal("LastSeen")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            };
        }
    }
}
