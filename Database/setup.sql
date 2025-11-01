-- Create Database
CREATE DATABASE IF NOT EXISTS NotificationDB;
USE NotificationDB;

-- Create Users Table
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    ConnectionId VARCHAR(255) NULL,
    IsOnline BOOLEAN DEFAULT FALSE,
    LastSeen DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    Type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    UserId INT NULL,
    UserGroup VARCHAR(100) NULL,
    ImageUrl VARCHAR(500) NULL,
    ActionText VARCHAR(100) NULL,
    ActionUrl VARCHAR(500) NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReadAt DATETIME NULL,
    IsDelivered BOOLEAN DEFAULT FALSE,
    DeliveredAt DATETIME NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Stored Procedures

-- 1. Create or Update User
DELIMITER //
CREATE PROCEDURE sp_CreateOrUpdateUser(
    IN p_Username VARCHAR(100),
    IN p_Email VARCHAR(255),
    IN p_ConnectionId VARCHAR(255)
)
BEGIN
    INSERT INTO Users (Username, Email, ConnectionId, IsOnline, LastSeen)
    VALUES (p_Username, p_Email, p_ConnectionId, TRUE, NOW())
    ON DUPLICATE KEY UPDATE
        ConnectionId = p_ConnectionId,
        IsOnline = TRUE,
        LastSeen = NOW();
    
    SELECT LAST_INSERT_ID() as UserId;
END //
DELIMITER ;

-- 2. Update User Connection Status
DELIMITER //
CREATE PROCEDURE sp_UpdateUserConnectionStatus(
    IN p_ConnectionId VARCHAR(255),
    IN p_IsOnline BOOLEAN
)
BEGIN
    UPDATE Users 
    SET IsOnline = p_IsOnline, LastSeen = NOW()
    WHERE ConnectionId = p_ConnectionId;
END //
DELIMITER ;

-- 3. Create Notification
DELIMITER //
CREATE PROCEDURE sp_CreateNotification(
    IN p_Title VARCHAR(255),
    IN p_Message TEXT,
    IN p_Type VARCHAR(20),
    IN p_UserId INT,
    IN p_UserGroup VARCHAR(100),
    IN p_ImageUrl VARCHAR(500),
    IN p_ActionText VARCHAR(100),
    IN p_ActionUrl VARCHAR(500)
)
BEGIN
    INSERT INTO Notifications (Title, Message, Type, UserId, UserGroup, ImageUrl, ActionText, ActionUrl, CreatedAt)
    VALUES (p_Title, p_Message, p_Type, p_UserId, p_UserGroup, p_ImageUrl, p_ActionText, p_ActionUrl, NOW());
    
    SELECT LAST_INSERT_ID() as NotificationId;
END //
DELIMITER ;

-- 4. Get User Notifications
DELIMITER //
CREATE PROCEDURE sp_GetUserNotifications(
    IN p_UserId INT,
    IN p_Limit INT
)
BEGIN
    SELECT Id, Title, Message, Type, UserId, UserGroup, ImageUrl, ActionText, ActionUrl, IsRead, CreatedAt, ReadAt, IsDelivered, DeliveredAt
    FROM Notifications
    WHERE UserId = p_UserId OR UserId IS NULL
    ORDER BY CreatedAt DESC
    LIMIT p_Limit;
END //
DELIMITER ;

-- 5. Mark Notification as Read
DELIMITER //
CREATE PROCEDURE sp_MarkNotificationAsRead(
    IN p_NotificationId INT,
    IN p_UserId INT
)
BEGIN
    UPDATE Notifications 
    SET IsRead = TRUE, ReadAt = NOW()
    WHERE Id = p_NotificationId AND (UserId = p_UserId OR UserId IS NULL);
END //
DELIMITER ;

-- 6. Mark Notification as Delivered
DELIMITER //
CREATE PROCEDURE sp_MarkNotificationAsDelivered(
    IN p_NotificationId INT
)
BEGIN
    UPDATE Notifications 
    SET IsDelivered = TRUE, DeliveredAt = NOW()
    WHERE Id = p_NotificationId;
END //
DELIMITER ;

-- 7. Get Online Users
DELIMITER //
CREATE PROCEDURE sp_GetOnlineUsers()
BEGIN
    SELECT Id, Username, Email, ConnectionId, IsOnline, LastSeen
    FROM Users
    WHERE IsOnline = TRUE;
END //
DELIMITER ;

-- 8. Get All Users
DELIMITER //
CREATE PROCEDURE sp_GetAllUsers()
BEGIN
    SELECT Id, Username, Email, ConnectionId, IsOnline, LastSeen, CreatedAt
    FROM Users
    ORDER BY CreatedAt DESC;
END //
DELIMITER ;

-- Insert sample data
INSERT INTO Users (Username, Email) VALUES 
('admin', 'admin@company.com'),
('user1', 'user1@company.com'),
('user2', 'user2@company.com');
