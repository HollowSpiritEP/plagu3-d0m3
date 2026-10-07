# AGENTS.md — working notes for this repository

## What this app is

Frontend-only React + Vite app (`The PlAGU3 D0M3`, a Hunger Games simulator). The
simulation runs entirely in the browser, so there is **no backend, no database, and
no external credentials**. `.base44/environment.json` intentionally has an empty
`secrets` list — do not add `env_file: /run/base44/app.env` to the compose file
unless a real external secret appears.

## Running it in the Base44 sandbox

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Serves port 3000. `node_modules` lives in the `web_node_modules` named volume and is
synced from `package-lock.json` on container start, guarded by a hash stamp at
`node_modules/.base44-install-stamp`, so restarts are fast but a lockfile change
triggers `npm ci`. The repo root is bind-mounted at `/app`, so source edits hot-reload.

## Non-obvious findings

- **`package-lock.json` is committed and the startup script requires it.** Adding a
  dependency means regenerating the lockfile (`docker run --rm -v "$PWD":/app -w /app
  node:22 npm install --package-lock-only`) — otherwise `npm ci` fails at container start.

- **Shell variables inside the compose `command:` must be written `$$var`.**
  Compose interpolates a bare `$var` and silently substitutes an empty string, which
  turned the install guard into nonsense. `docker compose config` re-escapes `$$` in
  its output, so seeing `$$` there is expected and correct.

- **Two sandbox-only overrides in `vite.config.js`, both gated on
  `BASE44_PREVIEW_MODE === '1'`; with the flag unset Vite's own defaults apply.**
  1. `server.allowedHosts` gets the `.<BASE44_SANDBOX_HOST_DOMAIN>` wildcard — the
     preview proxy sends `Host: <port>-<sandbox id>.<domain>`, and Vite answers 403
     for unknown hosts. Verified working: the sandbox host gets 200, a bogus host 403.
  2. `server.cors` emits `Access-Control-Allow-Origin: *`, because Vite 6 only emits
     CORS headers for localhost origins by default. This is a safety net, **not a
     confirmed fix** — see the open issue below.

## Open issue: preview iframe cannot load the app's scripts (unresolved)

Observed in a Safari preview session: the app boots and serves correct content over
HTTP (verified end-to-end through the preview proxy with `curl`, including headers),
but inside the preview iframe `#root` stays empty with
`Failed to load module @vite/client` / `src/main.jsx` in the console and no Vite error
overlay.

What was measured from inside the iframe (`preview_execute_code`):

| Request from the iframe | Result |
| --- | --- |
| document navigation to `/` | loads |
| classic `<script src>` to the app (no-cors) | loads, and Vite-transformed files execute |
| `fetch()` to the app (any path, incl. `/`) | `TypeError: Load failed` |
| classic `<script crossorigin>` to the app (CORS mode) | error |
| `<script type="module">` to the app | error |
| `fetch(..., { mode: 'no-cors' })` to the app | succeeds (opaque) |
| `fetch`/module/classic to `cdn.jsdelivr.net` | all succeed |

So **every CORS-mode request to the app fails while no-cors requests to the same URLs
succeed** — and cross-origin requests from the same page work fine. Ruled out along
the way: `allowedHosts` (the document loads, same Host), CORS header value
(`Access-Control-Allow-Origin: *` is present on every request path through the proxy
and the failure is unchanged), chunked encoding (the document and classic scripts are
chunked too), a document `<base>`, a service worker, and CSP violations (none
reported). Re-running from the platform's own `navigate()` helper reloads the page and
reproduces it.

Conclusion: this looks like an environment/browser condition on the preview path, not
app code — no Vite/app configuration change can prevent a browser from refusing
CORS-mode requests. **Do not "fix" it by switching to a classic-script bundle:**
same-origin classic scripts do not reliably execute there either, so it would not help.
Next step for a human is to try the preview in a different browser and/or disable
content blockers and privacy extensions for the preview domain.

- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` (`.e2b.app`) is supplied by the platform and
  passed through bare in compose; `server.watch.usePolling` is on because bind mounts
  miss inotify events.

## Verifying the app actually works

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/          # 200
curl -s http://localhost:3000/src/main.jsx | head -3                     # live source, not a bundle
curl -s -H "Origin: https://3000-$BASE44_PUBLIC_HOST_SUFFIX" -D - -o /dev/null \
  http://localhost:3000/src/main.jsx | grep -i access-control-allow-origin
```

The second check matters: if port 3000 serves a hashed production bundle instead of
`/@vite/client` + `/src/main.jsx`, the edit loop is broken.

`npm run build` inside the container passes and is a quick syntax/import check.

There is no automated test suite; the app is a self-contained simulation. The
simulation logic in `src/game/` is pure and deterministic — the same seed always
produces the same Games, which makes it straightforward to check by hand.

## Manual smoke test in the preview

1. Page loads with the roster showing 24 tributes and "Run the Games".
2. Click **Run the Games** → phases stream into the feed, tribute cards turn red as
   they die, and the stats bar counts down from 24.
3. **Skip to end** → a victor banner appears and exactly one card stays standing.
