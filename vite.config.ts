import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'src/main.tsx',
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        proxy: {
            // Same-origin session auth during SPA development on :3000.
            '/api': 'http://localhost:8000',
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react')) return 'react';
                    if (id.includes('node_modules/chart.js')) return 'charts';
                    if (id.includes('node_modules/lucide-react')) return 'icons';
                    if (id.includes('node_modules/motion')) return 'motion';
                    if (id.includes('node_modules/read-excel-file') || id.includes('node_modules/write-excel-file')) {
                        return 'spreadsheets';
                    }

                    return undefined;
                },
            },
        },
    },
});
