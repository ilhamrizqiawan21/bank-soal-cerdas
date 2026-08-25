// Global layout state: theme + sidebar (moved out of layouts/app.blade.php).
// Dark mode source of truth: [data-bs-theme] attribute; html.dark is kept in
// sync for Tailwind-based views during the Blade -> React transition.
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        dark: false,
        sidebarOpen: window.innerWidth > 768,
        sidebarCollapsed: false,
        init() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.dark = savedTheme === 'dark';
            } else {
                this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            this.applyTheme();
            const savedCollapsed = localStorage.getItem('sidebar-collapsed');
            if (savedCollapsed !== null) {
                this.sidebarCollapsed = savedCollapsed === 'true';
            }
            const syncSidebarState = () => {
                if (window.innerWidth > 768) {
                    this.sidebarOpen = true;
                } else {
                    this.sidebarOpen = false;
                    this.sidebarCollapsed = false;
                }
            };
            syncSidebarState();
            window.addEventListener('resize', syncSidebarState);
        },
        applyTheme() {
            const root = document.documentElement;
            root.setAttribute('data-bs-theme', this.dark ? 'dark' : 'light');
            root.classList.toggle('dark', this.dark);
            localStorage.setItem('theme', this.dark ? 'dark' : 'light');
        },
        toggleDark() {
            this.dark = !this.dark;
            this.applyTheme();
        },
        toggleSidebar() {
            if (window.innerWidth <= 768) {
                this.toggleMobileSidebar();
                return;
            }
            this.sidebarCollapsed = !this.sidebarCollapsed;
            this.sidebarOpen = true;
            localStorage.setItem('sidebar-collapsed', String(this.sidebarCollapsed));
        },
        toggleMobileSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
            if (this.sidebarOpen) {
                this.sidebarCollapsed = false;
            }
        }
    }));
});
