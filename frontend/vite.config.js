import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
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
        viteCompression(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Ticket Katum',
                short_name: 'TicketKatum',
                description: 'Event ticketing and booking platform',
                theme_color: '#7c3aed',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'unsplash-images-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
                            }
                        }
                    },
                    {
                        urlPattern: /\/api\/bff\/v1\/events/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 5 * 60 // 5 minutes
                            },
                            networkTimeoutSeconds: 3
                        }
                    }
                ]
            }
        }),
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
                pure_funcs: ['console.log', 'console.info'],
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React libraries
                    'react-vendor': ['react', 'react-dom'],
                    // Routing
                    'react-router': ['react-router-dom'],
                    // UI Components
                    'ui-icons': ['lucide-react'],
                    'ui-toast': ['react-toastify', 'react-hot-toast'],
                    'ui-charts': ['recharts'],
                    // Lazy load utilities
                    'lazy-load': ['react-lazy-load-image-component'],
                    // QR Code (used in booking confirmation)
                    'qr-code': ['qrcode.react'],
                    // Form libraries
                    'forms': ['formik', 'yup'],
                    // Performance
                    'web-vitals': ['web-vitals'],
                },
                // Optimize chunk file names
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        // Optimize chunk size
        chunkSizeWarningLimit: 600,
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
