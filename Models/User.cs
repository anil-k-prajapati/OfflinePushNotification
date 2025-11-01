namespace OfflinePushNotification.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
        public bool IsOnline { get; set; } = false;
        public DateTime LastSeen { get; set; } = DateTime.Now;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
