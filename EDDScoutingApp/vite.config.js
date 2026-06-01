import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'ThunderScout App Builder',
                short_name: 'ThunderScout2',
                display: 'standalone',
                background_color: '#121212',
                theme_color: '#0f766e',
                orientation: 'landscape',
                icons: [
                    {
                        src: '/logo1511.png',
                        sizes: '192x192',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    server: {
        allowedHosts: true
    }
});
//# sourceMappingURL=vite.config.js.map