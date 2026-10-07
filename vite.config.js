import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Sandbox-only override: the Base44 preview reaches the dev server through a
// proxy whose Host header is `<port>-<sandbox id>.<BASE44_SANDBOX_HOST_DOMAIN>`.
// Vite rejects unknown hosts, so while BASE44_PREVIEW_MODE is exactly "1" we
// allow the sandbox wildcard. With the flag unset, Vite's defaults apply.
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;
const allowedHosts = previewMode && sandboxHostDomain ? [`.${sandboxHostDomain}`] : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
    // Vite 6 only reflects CORS headers for localhost origins by default, so the
    // preview host gets none. Module scripts and fetch() are CORS-mode requests,
    // and the preview browser refuses them without those headers. Scoped to the
    // preview only; with the flag unset Vite's own default applies.
    cors: previewMode ? { origin: true, credentials: true } : undefined,
    // Bind mounts often miss inotify events; poll so hot reload always fires.
    watch: { usePolling: true, interval: 300 },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
