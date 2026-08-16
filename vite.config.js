import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

// Gunakan import.meta.dirname (lebih modern)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
            '~@fortawesome': path.resolve(__dirname, 'node_modules/@fortawesome'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        https: false,
    },
});