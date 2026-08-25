// Login page Alpine component (moved out of auth/login.blade.php).
document.addEventListener('alpine:init', () => {
    Alpine.data('loginPage', () => ({
        dark: false,
        init() {
            const saved = localStorage.getItem('theme');
            this.dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme();
        },
        toggleDark() {
            this.dark = !this.dark;
            localStorage.setItem('theme', this.dark ? 'dark' : 'light');
            this.applyTheme();
        },
        applyTheme() {
            const root = document.documentElement;
            root.setAttribute('data-bs-theme', this.dark ? 'dark' : 'light');
            root.classList.toggle('dark', this.dark);
        }
    }));
});
