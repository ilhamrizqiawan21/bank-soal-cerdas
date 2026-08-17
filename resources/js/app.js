import './bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './alpine';

// ===== TOAST EVENT LISTENER =====
document.addEventListener('alpine:init', () => {
    document.addEventListener('toast', (event) => {
        const { message, type } = event.detail;
        window.Alpine.store('toast').show(message, type);
    });
});

// ===== GLOBAL TOAST FUNCTION =====
window.toast = function(message, type = 'success') {
    window.Alpine.store('toast').show(message, type);
};

window.toastSuccess = function(message) {
    window.toast(message, 'success');
};

window.toastError = function(message) {
    window.toast(message, 'danger');
};

window.toastWarning = function(message) {
    window.toast(message, 'warning');
};

window.toastInfo = function(message) {
    window.toast(message, 'info');
};