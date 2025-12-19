import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// Custom plugin to fix malformed eSewa URLs (double question marks)
const malformedUrlFix = () => ({
    name: 'malformed-url-fix',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            // Fix double question marks in eSewa callbacks (e.g. ?txnId=...?data=...)
            if (req.url && req.url.includes('?txnId=') && req.url.includes('?data=')) {
                // Replace the second ? (before data=) with &
                const originalUrl = req.url;
                req.url = req.url.replace('?data=', '&data=');
                console.log(`🔧 Fixed malformed eSewa URL: ${originalUrl} -> ${req.url}`);
            }
            next();
        });
    }
});

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        malformedUrlFix(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'build',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['lucide-react', 'react-toastify', 'recharts'],
                },
            },
        },
    },
    server: {
        open: true,
        port: 3000,
        proxy: {
            // Proxy all backend API endpoints to avoid CORS issues during development
            '/busStop': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/auth': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/register': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/booking': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/bus': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/tickets': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            // Use regex to only match paths strictly starting with /payment/
            // This prevents /payments (plural) from being proxied
            '^/payment/': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/payment/, '/payment'),
            },
            '/image': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/secret': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/mock': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.js',
        css: true,
    },
});
