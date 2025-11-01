// Global variables
let connection = null;
let isConnected = false;
let currentUserId = null;

// Configuration
const notificationConfig = {
    autoHideDelay: 5000, // 5 seconds - change this to adjust auto-hide timing
    showImages: true,
    showActions: true
};

// Initialize SignalR connection
function initializeSignalR() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/notificationHub")
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .build();

    // Connection events
    connection.start().then(function () {
        updateConnectionStatus(true);
        console.log("SignalR Connected");
    }).catch(function (err) {
        updateConnectionStatus(false);
        console.error("SignalR Connection Error: ", err);
    });

    // Reconnection events
    connection.onreconnecting(() => {
        updateConnectionStatus(false, "Reconnecting...");
    });

    connection.onreconnected(() => {
        updateConnectionStatus(true);
        if (currentUserId) {
            // Rejoin user after reconnection
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            connection.invoke("JoinUser", username, email);
        }
    });

    connection.onclose(() => {
        updateConnectionStatus(false, "Disconnected");
    });

    // Listen for notifications
    connection.on("ReceiveNotification", function (notification) {
        console.log("Received notification:", notification);
        displayNotification(notification);
        showBrowserNotification(notification);
    });

    // Listen for user connection updates
    connection.on("UserConnected", function (user) {
        console.log("User connected:", user);
        loadUsers();
    });

    connection.on("UserDisconnected", function (connectionId) {
        console.log("User disconnected:", connectionId);
        loadUsers();
    });

    // Listen for read status updates
    connection.on("NotificationMarkedAsRead", function (notificationId) {
        markNotificationAsReadInUI(notificationId);
    });
}

// Update connection status in UI
function updateConnectionStatus(connected, customText = null) {
    isConnected = connected;
    const statusIcon = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');
    
    if (connected) {
        statusIcon.className = 'fas fa-circle text-success';
        statusText.textContent = customText || 'Connected';
    } else {
        statusIcon.className = 'fas fa-circle text-danger';
        statusText.textContent = customText || 'Disconnected';
    }
}

// Display notification in UI
function displayNotification(notification) {
    console.log("Displaying notification:", notification);
    const container = document.getElementById('notifications');
    
    if (!container) {
        console.error("Notifications container not found!");
        return;
    }
    
    // Remove "no notifications" message if it exists (only the centered one)
    const noNotificationsMsg = container.querySelector('.text-muted.text-center');
    if (noNotificationsMsg && noNotificationsMsg.parentElement === container) {
        console.log("Removing 'no notifications' message");
        noNotificationsMsg.remove();
    }
    
    // Keep notifications for testing - don't auto-clear

    const notificationElement = document.createElement('div');
    const notificationType = notification.Type || notification.type || 'info';
    const notificationTitle = notification.Title || notification.title || 'Notification';
    const notificationMessage = notification.Message || notification.message || 'No message';
    const notificationId = notification.Id || notification.id || 0;
    const notificationCreatedAt = notification.CreatedAt || notification.createdAt || new Date();
    const notificationImageUrl = notification.ImageUrl || notification.imageUrl;
    const notificationActionText = notification.ActionText || notification.actionText;
    const notificationActionUrl = notification.ActionUrl || notification.actionUrl;
    
    notificationElement.className = `notification-item notification-${notificationType}`;
    notificationElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                ${notificationImageUrl ? `<img src="${escapeHtml(notificationImageUrl)}" alt="Notification Image" class="notification-image mb-2" style="max-width: 100%; height: auto; border-radius: 5px;">` : ''}
                <h6 class="mb-1">${escapeHtml(notificationTitle)}</h6>
                <p class="mb-1">${escapeHtml(notificationMessage)}</p>
                ${notificationActionText && notificationActionUrl ? `<div class="mb-2">
                    <a href="${escapeHtml(notificationActionUrl)}" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-external-link-alt"></i> ${escapeHtml(notificationActionText)}
                    </a>
                </div>` : ''}
                <small class="text-muted">
                    <i class="fas fa-clock"></i> ${formatDateTime(notificationCreatedAt)}
                </small>
            </div>
            <div class="ms-2">
                <span class="badge bg-${getBadgeColor(notificationType)}">${notificationType.toUpperCase()}</span>
                ${currentUserId ? `<button class="btn btn-sm btn-outline-secondary ms-1" onclick="markAsRead(${notificationId})">
                    <i class="fas fa-check"></i>
                </button>` : ''}
            </div>
        </div>
    `;

    // Add to top of container
    container.insertBefore(notificationElement, container.firstChild);
    
    // Auto-scroll to top
    container.scrollTop = 0;
}

// Show browser notification (if permission granted)
function showBrowserNotification(notification) {
    if (Notification.permission === "granted") {
        const title = notification.Title || notification.title || 'Notification';
        const message = notification.Message || notification.message || 'New notification received';
        const id = notification.Id || notification.id || Date.now();
        const imageUrl = notification.ImageUrl || notification.imageUrl;
        const actionText = notification.ActionText || notification.actionText;
        const actionUrl = notification.ActionUrl || notification.actionUrl;
        
        console.log("Showing browser notification:", { title, message, id, imageUrl, actionText, actionUrl });
        
        // Build notification options
        const options = {
            body: message,
            icon: '/favicon.ico',
            tag: `notification-${id}`,
            requireInteraction: false, // Allow auto-hide
            silent: false
        };
        
        // Add image if provided
        if (imageUrl) {
            options.image = imageUrl;
        }
        
        // Add action info to notification body (more reliable than action buttons)
        if (actionText && actionUrl) {
            options.body += `\n\n👆 Click to: ${actionText}`;
            options.data = { actionUrl: actionUrl }; // Store URL for click handling
        }
        
        const browserNotification = new Notification(title, options);
        
        // Auto-hide notification after configured delay (if enabled)
        const autoHideDelay = notificationConfig.autoHideDelay;
        if (autoHideDelay > 0) {
            setTimeout(() => {
                try {
                    browserNotification.close();
                    console.log(`Notification auto-closed after ${autoHideDelay/1000} seconds`);
                } catch (error) {
                    // Notification might already be closed by user
                    console.log('Notification already closed or error closing:', error.message);
                }
            }, autoHideDelay);
        } else {
            console.log('Auto-hide disabled - notification will stay until manually closed');
        }
        
        // Handle notification click (fallback for all browsers)
        browserNotification.onclick = function(event) {
            event.preventDefault();
            console.log('Notification clicked');
            if (actionUrl) {
                console.log('Opening action URL:', actionUrl);
                window.open(actionUrl, '_blank');
            }
            browserNotification.close();
        };
        
        // Note: Action button clicks are handled by Service Worker
        // because the Notification API's action events don't work reliably in all browsers
        
    } else {
        console.log("Browser notifications not permitted");
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then(function(permission) {
            console.log('Notification permission:', permission);
            if (permission === 'granted') {
                console.log('Browser notification features supported:');
                console.log('- Actions:', 'actions' in Notification.prototype);
                console.log('- Image:', 'image' in Notification.prototype);
                console.log('- Data:', 'data' in Notification.prototype);
            }
        });
    }
}

// Debug function to test notification features
function testNotificationFeatures() {
    if (Notification.permission !== 'granted') {
        console.log('Please grant notification permission first');
        return;
    }
    
    console.log('Testing notification with action button...');
    
    const testNotification = new Notification('Test Rich Notification', {
        body: 'This is a test notification with clickable action\n\n👆 Click to: Visit Example Site',
        icon: '/favicon.ico',
        image: 'https://via.placeholder.com/300x150/007bff/ffffff?text=Test+Image',
        data: { actionUrl: 'https://example.com' },
        tag: 'test-notification'
    });
    
    testNotification.onclick = function() {
        console.log('Test notification clicked');
        window.open('https://example.com', '_blank');
        testNotification.close();
    };
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        try {
            testNotification.close();
        } catch (e) {
            console.log('Test notification already closed');
        }
    }, 10000);
}

// Form handlers
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    
    if (isConnected && username && email) {
        connection.invoke("JoinUser", username, email).then(() => {
            // Store current user info
            currentUserId = 1; // This should be returned from the server
            document.getElementById('connectBtn').innerHTML = '<i class="fas fa-check"></i> Connected';
            document.getElementById('connectBtn').disabled = true;
            
            // Load user notifications
            loadUserNotifications(currentUserId);
            
            console.log("Joined as user:", username);
        }).catch(err => {
            console.error("Error joining user:", err);
            alert("Error connecting as user: " + err);
        });
    } else {
        alert("Please ensure connection is established and fill all fields");
    }
});

document.getElementById('notificationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const message = document.getElementById('message').value;
    const type = document.getElementById('type').value;
    const userId = document.getElementById('userId').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const actionText = document.getElementById('actionText').value;
    const actionUrl = document.getElementById('actionUrl').value;
    
    if (!isConnected) {
        alert("Not connected to server");
        return;
    }

    // Send via AJAX to controller
    fetch('/Home/SendNotification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            title: title,
            message: message,
            type: type,
            userId: userId || '',
            imageUrl: imageUrl || '',
            actionText: actionText || '',
            actionUrl: actionUrl || ''
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Don't clear form - keep values for testing
            showToast("Notification sent successfully!", "success");
        } else {
            showToast("Error: " + data.message, "error");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast("Error sending notification", "error");
    });
});

// Load users for dropdown
function loadUsers() {
    fetch('/Home/GetUsers')
        .then(response => response.json())
        .then(users => {
            const select = document.getElementById('userId');
            // Keep the "All Users" option
            select.innerHTML = '<option value="">All Users (Broadcast)</option>';
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.Id;
                option.textContent = `${user.Username} (${user.Email})`;
                select.appendChild(option);
            });

            // Update online users display
            updateOnlineUsersDisplay(users.filter(u => u.IsOnline));
        })
        .catch(error => console.error('Error loading users:', error));
}

// Update online users display
function updateOnlineUsersDisplay(onlineUsers) {
    const container = document.getElementById('onlineUsers');
    
    if (onlineUsers.length === 0) {
        container.innerHTML = '<span class="badge bg-secondary">No users online</span>';
    } else {
        container.innerHTML = onlineUsers.map(user => 
            `<span class="badge bg-success user-badge">
                <i class="fas fa-user"></i> ${user.Username}
            </span>`
        ).join('');
    }
}

// Load user notifications
function loadUserNotifications(userId) {
    fetch(`/Home/GetNotifications?userId=${userId}&limit=20`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(notifications => {
            const container = document.getElementById('notifications');
            container.innerHTML = '';
            
            // Check if notifications is an array
            if (!Array.isArray(notifications)) {
                console.error('Invalid notifications data:', notifications);
                container.innerHTML = `
                    <div class="text-muted text-center p-4">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <p class="mt-2">Error loading notifications</p>
                    </div>
                `;
                return;
            }
            
            if (notifications.length === 0) {
                container.innerHTML = `
                    <div class="text-muted text-center p-4">
                        <i class="fas fa-bell-slash fa-2x"></i>
                        <p class="mt-2">No notifications found</p>
                    </div>
                `;
            } else {
                notifications.forEach(notification => {
                    try {
                        displayNotification(notification);
                    } catch (error) {
                        console.error('Error displaying notification:', notification, error);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
            const container = document.getElementById('notifications');
            container.innerHTML = `
                <div class="text-muted text-center p-4">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p class="mt-2">Failed to load notifications</p>
                    <small>Check console for details</small>
                </div>
            `;
        });
}

// Mark notification as read
function markAsRead(notificationId) {
    if (!currentUserId) return;
    
    fetch('/Home/MarkAsRead', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            notificationId: notificationId,
            userId: currentUserId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            markNotificationAsReadInUI(notificationId);
        }
    })
    .catch(error => console.error('Error marking as read:', error));
}

// Mark notification as read in UI
function markNotificationAsReadInUI(notificationId) {
    // Find and update the notification in UI
    const notifications = document.querySelectorAll('.notification-item');
    notifications.forEach(notification => {
        const button = notification.querySelector(`button[onclick="markAsRead(${notificationId})"]`);
        if (button) {
            button.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
            button.disabled = true;
            notification.style.opacity = '0.7';
        }
    });
}

// Clear all notifications
function clearNotifications() {
    console.log("Clearing all notifications");
    const container = document.getElementById('notifications');
    
    // Remove only notification items, keep the container structure
    const notificationItems = container.querySelectorAll('.notification-item');
    notificationItems.forEach(item => item.remove());
    
    // Add "no notifications" message if container is empty
    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="text-muted text-center p-4">
                <i class="fas fa-bell-slash fa-2x"></i>
                <p class="mt-2">No notifications yet. Send a notification to see it here!</p>
            </div>
        `;
    }
}

// Update notification configuration
function updateNotificationConfig() {
    const autoHideSelect = document.getElementById('autoHideDelay');
    if (autoHideSelect) {
        notificationConfig.autoHideDelay = parseInt(autoHideSelect.value);
        console.log(`Auto-hide delay updated to: ${notificationConfig.autoHideDelay > 0 ? notificationConfig.autoHideDelay/1000 + ' seconds' : 'disabled'}`);
        
        // Save to localStorage for persistence
        localStorage.setItem('notificationConfig', JSON.stringify(notificationConfig));
    }
}

// Load saved configuration on page load
function loadNotificationConfig() {
    try {
        const saved = localStorage.getItem('notificationConfig');
        if (saved) {
            const savedConfig = JSON.parse(saved);
            Object.assign(notificationConfig, savedConfig);
            
            // Update UI to reflect saved settings
            const autoHideSelect = document.getElementById('autoHideDelay');
            if (autoHideSelect) {
                autoHideSelect.value = notificationConfig.autoHideDelay.toString();
            }
        }
    } catch (error) {
        console.log('Error loading notification config:', error);
    }
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function formatDateTime(dateString) {
    if (!dateString) return 'Unknown time';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
    } catch (error) {
        return 'Invalid date';
    }
}

function getBadgeColor(type) {
    const colors = {
        'info': 'info',
        'success': 'success',
        'warning': 'warning',
        'error': 'danger'
    };
    return colors[type] || 'secondary';
}

function showToast(message, type) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadNotificationConfig(); // Load saved settings first
    initializeSignalR();
    requestNotificationPermission();
    loadUsers();
    
    // Refresh users every 30 seconds
    setInterval(loadUsers, 30000);
});
