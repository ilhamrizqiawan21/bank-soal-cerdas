import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            // app.scss is the canonical stylesheet entry and already loads
            // the shared design-system, component, page, theme, and
            // responsive layers. Keeping only the canonical entry prevents
            // duplicate CSS bundles and conflicting cascade order.
            input: [
                'resources/sass/app.scss',
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
