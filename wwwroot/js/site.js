// Basic site functionality

// Service Worker registration for offline capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(err) {
                console.warn('ServiceWorker registration failed (this is normal in development): ', err.message);
            });
    });
}

// Basic utility functions
window.utils = {
    // Format date for display
    formatDate: function(date) {
        return new Date(date).toLocaleString();
    },
    
    // Show loading spinner
    showLoading: function(element) {
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        element.disabled = true;
    },
    
    // Hide loading spinner
    hideLoading: function(element, originalText) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
};
