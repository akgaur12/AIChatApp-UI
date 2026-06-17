# 05 — Getting Started

[← Back to Index](./index.md)

This chapter takes you from a fresh clone to a running dev server and a production build.

## Prerequisites

- **Node.js v18 or higher** (required by Vite 5).
- **npm** (a `package-lock.json` is committed; use npm for reproducible installs).
- A running instance of the **backend API** ([`akgaur12/AIChatApp`](https://github.com/akgaur12/AIChatApp)).
  Without it, the UI renders but auth and chat calls will fail.

## 1. Clone and install

```bash
git clone <repository-url>
cd AIChatApp-UI
npm install
```

`npm install` reads `package-lock.json` and installs the exact pinned dependency tree.

## 2. Point the UI at your backend

There is **no `.env` file** in this project. The backend target is configured in code, in
`src/config.js`:

```javascript
// src/config.js
export const config = {
    API_BASE_URL: "http://0.0.0.0:45001",   // ← change to your backend host:port
    // ...
};
```

Update `API_BASE_URL` to wherever your backend listens (e.g. `http://localhost:45001` for local dev,
or `https://api.example.com` in production). See [Chapter 06 — Configuration](./06-configuration.md)
for the full breakdown and a recommendation on migrating this to environment variables.

## 3. Run the dev server

```bash
npm run dev
```

This starts Vite. Per `vite.config.js`, the dev server binds to:

- **Host:** `0.0.0.0` (reachable from other devices on your network)
- **Port:** `45002`

So the app is available at **`http://localhost:45002`**.

> The README mentions `http://localhost:5173` (Vite's default). The committed `vite.config.js`
> overrides this to **45002** — trust the config. If you want the default, remove the `server` block.

## 4. Build for production

```bash
npm run build
```

Vite bundles and optimizes the app into the **`dist/`** directory (static HTML, JS, CSS, and copied
`public/` assets). `dist/` is git-ignored.

## 5. Preview the production build

```bash
npm run preview
```

Serves the contents of `dist/` locally so you can sanity-check the optimized build before deploying.

## All npm scripts

From `package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start the dev server with HMR on `0.0.0.0:45002` |
| `build` | `vite build` | Produce an optimized production bundle in `dist/` |
| `lint` | `eslint .` | Lint the whole project |
| `preview` | `vite preview` | Serve the built `dist/` locally |

## First-run smoke test

1. Start the backend.
2. `npm run dev`, open `http://localhost:45002`.
3. You should be redirected to `/login` (because no token exists — see
   [Chapter 07 — Routing](./07-routing.md)).
4. Sign up, then log in. On success you land on `/chat`.
5. Send a message and watch it stream in.

If any step fails, see [Chapter 22 — Troubleshooting](./22-troubleshooting.md).

## Editor setup (optional)

- `.vscode/settings.json` ships **Peacock** color customizations for the window chrome — purely
  cosmetic, safe to ignore.
- ESLint is configured via the project's standard config; install the ESLint extension for inline
  feedback.

## Related chapters

- [Chapter 06 — Configuration & Environment](./06-configuration.md)
- [Chapter 19 — Build, Deployment & CI/CD](./19-build-deployment.md)
