using Microsoft.AspNetCore.SignalR;
using OfflinePushNotification.Services;

namespace OfflinePushNotification.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(IUserService userService, INotificationService notificationService, ILogger<NotificationHub> logger)
        {
            _userService = userService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task JoinUser(string username, string email)
        {
            try
            {
                var userId = await _userService.CreateOrUpdateUserAsync(username, email, Context.ConnectionId);
                
                // Add to user-specific group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
                
                // Notify all clients about user connection
                await Clients.All.SendAsync("UserConnected", new { Username = username, ConnectionId = Context.ConnectionId });
                
                _logger.LogInformation("User {Username} joined with connection {ConnectionId}", username, Context.ConnectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in JoinUser for {Username}", username);
            }
        }

        public async Task SendNotificationToUser(int userId, string title, string message, string type = "info")
        {
            try
            {
                // Save notification to database
                var notificationId = await _notificationService.CreateNotificationAsync(title, message, type, userId);
                
                // Send to specific user group
                await Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", new
                {
                    Id = notificationId,
                    Title = title,
                    Message = message,
                    Type = type,
                    CreatedAt = DateTime.Now
                });

                // Mark as delivered
                await _notificationService.MarkAsDeliveredAsync(notificationId);
                
                _logger.LogInformation("Sent notification {NotificationId} to user {UserId}", notificationId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
            }
        }

        public async Task SendBroadcastNotification(string title, string message, string type = "info")
        {
            try
            {
                // Save notification to database (no specific user)
                var notificationId = await _notificationService.CreateNotificationAsync(title, message, type);
                
                // Broadcast to all connected clients
                await Clients.All.SendAsync("ReceiveNotification", new
                {
                    Id = notificationId,
                    Title = title,
                    Message = message,
                    Type = type,
                    CreatedAt = DateTime.Now
                });

                // Mark as delivered
                await _notificationService.MarkAsDeliveredAsync(notificationId);
                
                _logger.LogInformation("Sent broadcast notification {NotificationId}", notificationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending broadcast notification");
            }
        }

        public async Task MarkNotificationAsRead(int notificationId, int userId)
        {
            try
            {
                await _notificationService.MarkAsReadAsync(notificationId, userId);
                
                // Notify the user that notification was marked as read
                await Clients.Group($"User_{userId}").SendAsync("NotificationMarkedAsRead", notificationId);
                
                _logger.LogInformation("Marked notification {NotificationId} as read for user {UserId}", notificationId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
            }
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                // Update user status to offline
                await _userService.UpdateConnectionStatusAsync(Context.ConnectionId, false);
                
                // Notify all clients about user disconnection
                await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId);
                
                _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnDisconnectedAsync for {ConnectionId}", Context.ConnectionId);
            }
            
            await base.OnDisconnectedAsync(exception);
        }
    }
}
