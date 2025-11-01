# UI Libraries Setup

## Current Setup

The application is configured to work both **online** and **offline**:

### Online Mode (Recommended)
- Uses CDN links for Bootstrap, jQuery, FontAwesome, and SignalR
- Faster loading and always up-to-date
- Requires internet connection

### Offline Mode (Fallback)
- Uses local placeholder files when CDN fails
- Basic functionality maintained
- Works completely offline

## Files Created

### `/wwwroot/lib/` folder structure:
```
lib/
├── bootstrap/
│   └── dist/
│       ├── css/bootstrap.min.css (basic styles)
│       └── js/bootstrap.bundle.min.js (minimal functionality)
└── jquery/
    └── dist/
        └── jquery.min.js (minimal jQuery implementation)
```

### `/wwwroot/css/` additional files:
- `fontawesome-fallback.css` - Unicode icon replacements

## For Full Offline Support

To get complete offline functionality, replace the placeholder files with actual libraries:

### 1. Download Bootstrap 5.3.0
```bash
# Download from https://getbootstrap.com/
# Replace: /wwwroot/lib/bootstrap/dist/css/bootstrap.min.css
# Replace: /wwwroot/lib/bootstrap/dist/js/bootstrap.bundle.min.js
```

### 2. Download jQuery 3.7.1
```bash
# Download from https://jquery.com/download/
# Replace: /wwwroot/lib/jquery/dist/jquery.min.js
```

### 3. Download FontAwesome 6.0.0
```bash
# Download from https://fontawesome.com/
# Add: /wwwroot/lib/fontawesome/ folder with CSS and fonts
```

### 4. Download SignalR Client
```bash
# Download from https://www.npmjs.com/package/@microsoft/signalr
# Add: /wwwroot/lib/signalr/signalr.min.js
```

## Current Fallback Features

### Bootstrap Placeholder
- Basic grid system (container, row, col)
- Button styles (btn, btn-primary, etc.)
- Card components
- Form controls
- Alert styles
- Badge styles
- Utility classes

### jQuery Placeholder
- Document ready: `$(function() {})`
- Basic selectors: `$('#id'), $('.class')`
- Event handling: `.on('click', handler)`
- Value manipulation: `.val(), .html()`
- Class manipulation: `.addClass(), .removeClass()`
- Basic AJAX: `$.ajax()`

### FontAwesome Placeholder
- Unicode emoji replacements for common icons
- Spinning animation for loading states
- Color utility classes

## Testing Offline Mode

1. Disconnect from internet
2. Run the application
3. Check browser console for fallback messages
4. Verify basic functionality works

The application will automatically fall back to local files when CDN resources are unavailable.
