# Offline Push Notification System

A production-ready .NET Core 8.0 MVC application with real-time WebSocket notifications using SignalR, MySQL database with stored procedures, and ADO.NET data access.

**Created by:** [Anil Prajapati](mailto:anil.personal.me@gmail.com)  
**Open Source Project** - Free for everyone to use and contribute!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20Development-orange?style=flat-square&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/anilprajapati)

## 🚀 Features

- **Real-time WebSocket Notifications** via SignalR
- **MySQL Database** with stored procedures (no inline queries)
- **ADO.NET Data Access Layer** for optimal performance
- **On-premises Ready** - works without internet connection
- **User Management** with connection tracking
- **Broadcast & Targeted Notifications**
- **Responsive Dashboard** with Bootstrap 5
- **Production Logging** with Serilog

## 🛠 Technology Stack

- **.NET Core 8.0 MVC**
- **SignalR** for WebSocket communication
- **MySQL 8.0+** database
- **ADO.NET** with stored procedures
- **Bootstrap 5** for UI
- **Serilog** for logging
- **Font Awesome** for icons

## 📋 Prerequisites

1. **.NET 8.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **MySQL Server 8.0+** - [Download here](https://dev.mysql.com/downloads/mysql/)
3. **Visual Studio 2022** or **VS Code** (optional)

## 🔧 Setup Instructions

### 1. Database Setup

1. Install and start MySQL Server
2. Create the database and tables:

```sql
-- Run the setup script
mysql -u root -p < Database/setup.sql
```

Or manually execute the SQL commands in `Database/setup.sql`

### 2. Configuration

1. Update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=NotificationDB;Uid=root;Pwd=YOUR_PASSWORD;SslMode=none;"
  }
}
```

Replace `YOUR_PASSWORD` with your MySQL root password.

### 3. Build and Run

```bash
# Restore packages
dotnet restore

# Build the project
dotnet build

# Run the application
dotnet run
```

The application will start on `https://localhost:5001` or `http://localhost:5000`

## 🎯 Usage

### 1. Connect as User
- Enter username and email
- Click "Connect" to join the SignalR hub
- Your connection status will show as "Connected"

### 2. Send Notifications
- Fill in the notification form
- Choose notification type (Info, Success, Warning, Error)
- Select specific user or broadcast to all
- Click "Send Notification"

### 3. Real-time Features
- Notifications appear instantly on connected clients
- Online users list updates automatically
- Connection status monitoring
- Browser notifications (if permission granted)

## 📁 Project Structure

```
OfflinePushNotification/
├── Controllers/
│   └── HomeController.cs          # MVC Controller
├── Data/
│   └── DatabaseHelper.cs          # ADO.NET helper
├── Database/
│   └── setup.sql                  # MySQL setup script
├── Hubs/
│   └── NotificationHub.cs         # SignalR Hub
├── Models/
│   ├── Notification.cs            # Notification model
│   └── User.cs                    # User model
├── Services/
│   ├── INotificationService.cs    # Service interface
│   ├── NotificationService.cs     # Notification service
│   ├── IUserService.cs           # User service interface
│   └── UserService.cs            # User service
├── Views/
│   ├── Home/Index.cshtml         # Dashboard view
│   └── Shared/_Layout.cshtml     # Layout template
├── wwwroot/
│   ├── css/site.css              # Custom styles
│   └── js/notifications.js       # SignalR client
└── Program.cs                     # Application startup
```

## 🔒 Database Schema

### Tables
- **Users** - User management and connection tracking
- **Notifications** - Notification storage and delivery status

### Stored Procedures
- `sp_CreateOrUpdateUser` - User management
- `sp_UpdateUserConnectionStatus` - Connection tracking
- `sp_CreateNotification` - Create notifications
- `sp_GetUserNotifications` - Retrieve user notifications
- `sp_MarkNotificationAsRead` - Mark as read
- `sp_MarkNotificationAsDelivered` - Mark as delivered
- `sp_GetOnlineUsers` - Get online users
- `sp_GetAllUsers` - Get all users

## 🌐 API Endpoints

- `POST /Home/SendNotification` - Send notification
- `GET /Home/GetNotifications` - Get user notifications
- `POST /Home/MarkAsRead` - Mark notification as read
- `GET /Home/GetUsers` - Get all users
- `WS /notificationHub` - SignalR WebSocket endpoint

## 🔧 Configuration Options

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=NotificationDB;Uid=root;Pwd=password;SslMode=none;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## 📊 Monitoring & Logging

- **Serilog** structured logging to console and files
- Logs stored in `logs/` directory with daily rotation
- Connection and notification events tracked
- Error handling with detailed logging

## 🚀 Production Deployment

### Docker (Optional)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OfflinePushNotification.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OfflinePushNotification.dll"]
```

### IIS Deployment
1. Publish the application: `dotnet publish -c Release`
2. Copy published files to IIS wwwroot
3. Configure IIS with ASP.NET Core Module
4. Update connection string for production database

## 🔍 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check MySQL server is running
   - Verify connection string credentials
   - Ensure database exists

2. **SignalR Not Working**
   - Check browser console for errors
   - Verify WebSocket support
   - Check firewall settings

3. **Notifications Not Appearing**
   - Check browser notification permissions
   - Verify SignalR connection status
   - Check server logs for errors

### Debug Mode
Set `"LogLevel": "Debug"` in appsettings.json for detailed logging.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! This project is open source and free for everyone.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## ☕ Support the Project

If this project helped you, consider supporting its development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20Development-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/anilprajapati)

Your support helps maintain and improve this project for the community!

## 👨‍💻 Author

**Anil Prajapati**
- Email: [anil.personal.me@gmail.com](mailto:anil.personal.me@gmail.com)
- GitHub: [@anilprajapati](https://github.com/anilprajapati)

## 📞 Support & Issues

For issues and questions:
- Check the troubleshooting section above
- Review server logs in `logs/` directory
- Open an issue on GitHub
- Contact: [anil.personal.me@gmail.com](mailto:anil.personal.me@gmail.com)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!
