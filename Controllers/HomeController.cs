using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OfflinePushNotification.Hubs;
using OfflinePushNotification.Models;
using OfflinePushNotification.Services;
using System.Diagnostics;

namespace OfflinePushNotification.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly INotificationService _notificationService;
        private readonly IUserService _userService;

        public HomeController(
            ILogger<HomeController> logger, 
            IHubContext<NotificationHub> hubContext,
            INotificationService notificationService,
            IUserService userService)
        {
            _logger = logger;
            _hubContext = hubContext;
            _notificationService = notificationService;
            _userService = userService;
        }

        public async Task<IActionResult> Index()
        {
            var users = await _userService.GetAllUsersAsync();
            ViewBag.Users = users;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendNotification(string title, string message, string type, int? userId)
        {
            try
            {
                if (userId.HasValue)
                {
                    // Send to specific user
                    var notificationId = await _notificationService.CreateNotificationAsync(title, message, type, userId);
                    
                    await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", new
                    {
                        Id = notificationId,
                        Title = title,
                        Message = message,
                        Type = type,
                        CreatedAt = DateTime.Now
                    });

                    await _notificationService.MarkAsDeliveredAsync(notificationId);
                }
                else
                {
                    // Broadcast to all users
                    var notificationId = await _notificationService.CreateNotificationAsync(title, message, type);
                    
                    await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
                    {
                        Id = notificationId,
                        Title = title,
                        Message = message,
                        Type = type,
                        CreatedAt = DateTime.Now
                    });

                    await _notificationService.MarkAsDeliveredAsync(notificationId);
                }

                return Json(new { success = true, message = "Notification sent successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification");
                return Json(new { success = false, message = "Error sending notification: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications(int userId, int limit = 20)
        {
            try
            {
                var notifications = await _notificationService.GetUserNotificationsAsync(userId, limit);
                return Json(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications for user {UserId}", userId);
                return Json(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> MarkAsRead(int notificationId, int userId)
        {
            try
            {
                await _notificationService.MarkAsReadAsync(notificationId, userId);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Json(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return Json(new { error = ex.Message });
            }
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    public class ErrorViewModel
    {
        public string? RequestId { get; set; }
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
