// Session flash messages -> Bootstrap toast (replaces inline scripts in layouts/app.blade.php).
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const success = body.dataset.flashSuccess;
    const error = body.dataset.flashError;

    // Let Alpine finish booting its stores before showing toasts.
    setTimeout(() => {
        if (success) window.dispatchEvent(new CustomEvent('toast', { detail: { message: success, type: 'success' } }));
        if (error) window.dispatchEvent(new CustomEvent('toast', { detail: { message: error, type: 'danger' } }));
    }, 100);
});
