# 06 — Configuration & Environment

[← Back to Index](./index.md)

All build- and runtime-configuration lives in a small set of files. This chapter documents each.

## Application config — `src/config.js`

This is the **single source of truth** for the backend target and the API surface the UI talks to.

```javascript
export const config = {
    API_BASE_URL: "http://0.0.0.0:45001",

    services: {
        available: ["chat", "web_search", "thinking", "image_search", "news_search"],
        default: "chat"
    },

    endpoints: {
        auth: {
            login:          "/auth/login-json",
            signup:         "/auth/signup",
            forgotPassword: "/auth/forget-password",
            resetPassword:  "/auth/verify-otp-reset-password",
            changePassword: "/auth/reset-password",
            deleteAccount:  "/auth/delete-user",
        },
        chat: {
            base:          "/chat",
            stream:        "/chat/run_pipeline/stream",
            conversations: "/chat/conversations",
            conversation:            (id) => `/chat/conversations/${id}`,
            rename_conversation:     (id) => `/chat/conversations/${id}/rename`,
            delete_conversation:     (id) => `/chat/conversations/${id}/delete`,
            delete_all_conversations: "/chat/conversations",
        }
    }
};
```

| Key | Meaning |
|-----|---------|
| `API_BASE_URL` | Root URL of the backend. Used by both the Axios client (`src/api/client.js:5`) and the raw `fetch` stream call (`src/pages/ChatPage.jsx:156`). |
| `services.available` | The five AI service identifiers the UI can request. Drives the input menu and the `service_name` sent to the backend. |
| `services.default` | The service used when no toggle is active (`"chat"`). |
| `endpoints.auth.*` | Paths for each auth operation. |
| `endpoints.chat.*` | Paths for chat operations; some are **functions** that build dynamic per-conversation routes. |

> **Implementation notes**
> - `endpoints.chat.delete_conversation(id)` (→ `/chat/conversations/{id}/delete`) is **declared but not
>   used**; deletion is actually performed with `conversation(id)` via HTTP `DELETE`
>   (`src/pages/ChatPage.jsx:101`). Keep this in mind to avoid confusion.
> - `endpoints.chat.base` is also currently unused directly.

### Changing the backend target

Edit `API_BASE_URL`. For environment-specific values, see the migration tip below.

### Recommended improvement: move to env vars

The base URL is currently hard-coded, which means switching environments requires a code edit. Vite
supports env files natively. A non-breaking improvement:

```javascript
// src/config.js
API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://0.0.0.0:45001",
```

Then provide `.env.development`, `.env.production`, etc. (Vite only exposes variables prefixed with
`VITE_`). Note `.env*` files are already git-ignored (`.gitignore`).

## Vite — `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 45002,
        host: '0.0.0.0',
    },
})
```

- **`@vitejs/plugin-react`** enables JSX + React Fast Refresh.
- **`server.port: 45002`** — the dev server port (overrides Vite's default 5173).
- **`server.host: '0.0.0.0'`** — binds all interfaces, so the dev server is reachable from other
  devices/containers on the network.

No custom build options are set, so `npm run build` uses Vite defaults (output to `dist/`).

## PostCSS — `postcss.config.js`

```javascript
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
}
```

Runs Tailwind (which compiles the utility classes and the `@layer` blocks in `index.css`) followed by
Autoprefixer (vendor prefixes).

## Tailwind — `tailwind.config.js`

Key settings (full detail in [Chapter 13 — Theming & Styling](./13-theming-styling.md)):

- **`content`** — scans `index.html` and `src/**/*.{js,ts,jsx,tsx}` for class names.
- **`darkMode: "class"`** — dark mode is driven by a class on `<html>`, not the OS media query directly.
- **`theme.extend.colors`** — maps semantic names (`background`, `primary`, `muted`, …) to
  `hsl(var(--token))`, so colors come from CSS variables.
- **`plugins`** — the Typography plugin, plus a custom plugin that registers a **Tailwind variant for
  every named theme** (`blue`, `midnight-green`, `carbon-black`, …) so you can write classes like
  `blue:prose-p:text-[...]`.

## HTML shell — `index.html`

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

- Sets the page title to **"AI Chat App"**, favicon to `/logo.png`, and an Apple touch icon.
- Loads the app as an ES module — there is no inline app logic here.

## Environment files

- **None are committed.** All `.env*` variants are git-ignored.
- Today, configuration is in source (`config.js`), not env files. See the migration tip above if you
  want per-environment configuration.

## Configuration summary

| Concern | File | Notes |
|---------|------|-------|
| Backend URL & API paths | `src/config.js` | Edit here to retarget the backend |
| Dev server host/port | `vite.config.js` | `0.0.0.0:45002` |
| CSS pipeline | `postcss.config.js` | Tailwind + Autoprefixer |
| Design tokens & themes | `tailwind.config.js` + `src/index.css` | CSS-variable themes |
| HTML entry | `index.html` | Mount point + asset links |

## Related chapters

- [Chapter 10 — API Integration](./10-api-integration.md) shows how these endpoints are consumed.
- [Chapter 17 — Security](./17-security.md) discusses the implications of an HTTP base URL.
