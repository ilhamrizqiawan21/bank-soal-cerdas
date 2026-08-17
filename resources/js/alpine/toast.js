import Alpine from 'alpinejs';

Alpine.store('toast', {
    messages: [],
    
    show(message, type = 'success') {
        const id = Date.now();
        this.messages.push({ id, message, type });
        
        // Auto dismiss setelah 5 detik
        setTimeout(() => {
            this.remove(id);
        }, 5000);
    },
    
    remove(id) {
        this.messages = this.messages.filter(m => m.id !== id);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'danger');
    },
    
    warning(message) {
        this.show(message, 'warning');
    },
    
    info(message) {
        this.show(message, 'info');
    }
});