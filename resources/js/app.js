import './bootstrap';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;
import './alpine';

// ===== TOAST EVENT LISTENER =====
document.addEventListener('alpine:init', () => {
    document.addEventListener('toast', (event) => {
        const { message, type } = event.detail;
        window.Alpine.store('toast').show(message, type);
    });
});

// ===== GLOBAL CONFIRM MODAL =====
document.addEventListener('DOMContentLoaded', () => {
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalText = document.getElementById('confirmModalText');
    const confirmModalAction = document.getElementById('confirmModalAction');
    const confirmModalTitle = document.getElementById('confirmModalTitle');

    let pendingConfirmAction = null;

    if (confirmModal && confirmModalText && confirmModalAction && confirmModalTitle) {
        const showConfirm = ({ title, message, confirmText, onConfirm }) => {
            confirmModalTitle.textContent = title;
            confirmModalText.textContent = message;
            confirmModalAction.textContent = confirmText;
            pendingConfirmAction = onConfirm;
            const modal = window.bootstrap?.Modal.getOrCreateInstance(confirmModal);
            modal.show();
        };

        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-confirm]');
            if (!trigger) {
                return;
            }

            event.preventDefault();

            const title = trigger.dataset.confirmTitle || 'Konfirmasi';
            const message = trigger.dataset.confirm || 'Apakah Anda yakin ingin melanjutkan?';
            const confirmText = trigger.dataset.confirmText || 'Ya, lanjutkan';

            showConfirm({
                title,
                message,
                confirmText,
                onConfirm: () => {
                    const formId = trigger.dataset.confirmForm;
                    const href = trigger.dataset.confirmHref || trigger.getAttribute('href');

                    if (formId) {
                        const form = document.getElementById(formId);
                        if (form) form.submit();
                        return;
                    }

                    if (href) {
                        window.location.href = href;
                        return;
                    }

                    const form = trigger.closest('form');
                    if (form) {
                        form.submit();
                    }
                }
            });
        });

        confirmModalAction.addEventListener('click', () => {
            if (typeof pendingConfirmAction === 'function') {
                pendingConfirmAction();
            }

            const modal = window.bootstrap?.Modal.getInstance(confirmModal);
            if (modal) {
                modal.hide();
            }
        });

        // API programatik untuk dialog konfirmasi (pengganti confirm() native)
        window.confirmDialog = (options = {}) => {
            showConfirm({
                title: options.title || 'Konfirmasi',
                message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
                confirmText: options.confirmText || 'Ya, lanjutkan',
                onConfirm: options.onConfirm,
            });
        };
    }
});

// ===== GLOBAL SUBMIT LOADING =====
document.addEventListener('DOMContentLoaded', () => {
    const activateSubmitLoading = (button) => {
        if (!button || button.dataset.loadingBound === 'true') {
            return;
        }

        button.dataset.loadingBound = 'true';

        const setLoadingState = (isLoading) => {
            const label = button.dataset.loadingLabel || button.textContent.trim() || 'Submit';

            if (isLoading) {
                button.disabled = true;
                button.dataset.originalText = label;
                button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + label;
                button.classList.add('is-loading');
                return;
            }

            button.disabled = false;
            button.innerHTML = button.dataset.originalText || label;
            button.classList.remove('is-loading');
        };

        button.addEventListener('click', () => {
            if (!button.form) {
                return;
            }

            // Hanya tandai bahwa tombol ini yang memicu submit.
            // JANGAN disable tombol di sini: button.disabled = true pada handler
            // click membatalkan default action submit form di browser,
            // sehingga form tidak pernah terkirim dan tombol spinner muter terus.
            button.form.dataset.loadingTriggered = 'true';
        });

        button.form?.addEventListener('submit', () => {
            // Submit sudah benar-benar berjalan, jadi aman untuk men-disable tombol.
            if (button.form.dataset.loadingTriggered === 'true') {
                setLoadingState(true);
            }
        }, { once: true });
    };

    document.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(activateSubmitLoading);
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