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
    // Vite 6 only emits CORS headers for localhost origins by default, so the
    // preview host gets none. Module scripts and fetch() are CORS-mode requests
    // and the preview browser refuses them without an allow-origin header, so
    // emit a static wildcard that no longer depends on the request's Origin
    // header. Scoped to the preview; with the flag unset Vite's default applies.
    cors: previewMode ? { origin: '*' } : undefined,
    // Bind mounts often miss inotify events; poll so hot reload always fires.
    watch: { usePolling: true, interval: 300 },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
