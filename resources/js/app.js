import './bootstrap';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;
import './alpine';
import '../sass/theme-responsive.scss';
import '../sass/secondary-table-theme.scss';
import '../sass/design-system.scss';
import '../sass/frontend-ux.scss';

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
    let pendingTrigger = null;

    if (!confirmModal || !confirmModalText || !confirmModalAction || !confirmModalTitle) {
        return;
    }

    const modal = window.bootstrap?.Modal.getOrCreateInstance(confirmModal, { backdrop: 'static' });

    const closeConfirm = () => {
        pendingConfirmAction = null;
        pendingTrigger = null;
        modal?.hide();
    };

    const showConfirm = ({ title, message, confirmText, onConfirm, trigger }) => {
        confirmModalTitle.textContent = title || 'Konfirmasi';
        confirmModalText.textContent = message || 'Apakah Anda yakin ingin melanjutkan?';
        confirmModalAction.textContent = confirmText || 'Ya, lanjutkan';
        confirmModalAction.disabled = false;
        pendingConfirmAction = typeof onConfirm === 'function' ? onConfirm : null;
        pendingTrigger = trigger || null;
        modal?.show();
    };

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-confirm]');
        if (!trigger) return;
        if (trigger.disabled || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        event.preventDefault();

        showConfirm({
            title: trigger.dataset.confirmTitle,
            message: trigger.dataset.confirm,
            confirmText: trigger.dataset.confirmText,
            trigger,
            onConfirm: () => {
                const formId = trigger.dataset.confirmForm;
                const href = trigger.dataset.confirmHref || trigger.getAttribute('href');

                if (formId) {
                    const form = document.getElementById(formId);
                    if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
                    return;
                }

                if (href) {
                    window.location.assign(href);
                    return;
                }

                const form = trigger.closest('form');
                if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
            }
        });
    });

    confirmModalAction.addEventListener('click', () => {
        const action = pendingConfirmAction;
        const trigger = pendingTrigger;
        if (!action) {
            closeConfirm();
            return;
        }

        confirmModalAction.disabled = true;
        pendingConfirmAction = null;
        pendingTrigger = null;

        try {
            action();
        } catch (error) {
            confirmModalAction.disabled = false;
            pendingConfirmAction = action;
            pendingTrigger = trigger;
            throw error;
        }

        modal?.hide();
    });

    confirmModal.addEventListener('hidden.bs.modal', () => {
        pendingConfirmAction = null;
        pendingTrigger = null;
        confirmModalAction.disabled = false;
    });

    window.confirmDialog = (options = {}) => {
        showConfirm({
            title: options.title || 'Konfirmasi',
            message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
            confirmText: options.confirmText || 'Ya, lanjutkan',
            onConfirm: options.onConfirm,
        });
    };
});

// ===== GLOBAL SUBMIT LOADING =====
document.addEventListener('DOMContentLoaded', () => {
    const activateSubmitLoading = (button) => {
        if (!button || button.dataset.loadingBound === 'true') return;
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
            if (button.form) button.form.dataset.loadingTriggered = 'true';
        });

        button.form?.addEventListener('submit', () => {
            if (button.form.dataset.loadingTriggered === 'true') setLoadingState(true);
        }, { once: true });
    };

    document.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(activateSubmitLoading);
});

// ===== GLOBAL TOAST FUNCTION =====
window.toast = function(message, type = 'success') {
    window.Alpine.store('toast').show(message, type);
};

window.toastSuccess = function(message) { window.toast(message, 'success'); };
window.toastError = function(message) { window.toast(message, 'danger'); };
window.toastWarning = function(message) { window.toast(message, 'warning'); };
window.toastInfo = function(message) { window.toast(message, 'info'); };
