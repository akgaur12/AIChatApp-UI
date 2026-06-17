# 04 — Directory & File Structure

[← Back to Index](./index.md)

This chapter maps the repository so you always know where to look.

## Top-level layout

```text
AIChatApp-UI/
├── index.html              # SPA HTML shell; mounts #root and loads src/main.jsx
├── package.json            # Scripts, dependencies, metadata
├── package-lock.json       # Pinned dependency tree (committed)
├── vite.config.js          # Vite config: React plugin, dev server port 45002
├── postcss.config.js       # PostCSS: tailwindcss + autoprefixer
├── tailwind.config.js      # Tailwind theme tokens, dark mode, custom theme variants
├── LICENSE                 # MIT license
├── README.md               # Quick-start and feature summary
├── .gitignore
├── .vscode/                # Editor color customizations (Peacock)
├── public/                 # Static assets served at site root
│   ├── logo.png, logo2.png, logo__.png
│   ├── favicon.png, apple-touch-icon.png
│   ├── auth_banner.png     # Auth screen hero background
│   └── img01..img04.png    # README screenshots
├── dist/                   # Build output (generated; git-ignored)
├── docs/                   # ← This documentation book
└── src/                    # Application source
```

## `src/` in detail

```text
src/
├── main.jsx                # Entry point: ReactDOM.createRoot + StrictMode
├── App.jsx                 # Providers + Router + Route table
├── config.js               # API base URL, service list, endpoint map
├── index.css               # Tailwind layers + ALL theme CSS variables + utilities
│
├── api/
│   └── client.js           # Axios instance, request/response interceptors, logout hook
│
├── context/
│   ├── AuthContext.jsx      # AuthProvider + useAuth: login, logout, signup, deleteAccount, user
│   └── ThemeContext.jsx     # ThemeProvider + useTheme: theme switching + persistence
│
├── lib/
│   ├── utils.js            # cn() — clsx + tailwind-merge class combiner
│   └── jwt.js              # parseJwt(), isTokenExpired()
│
├── pages/
│   ├── AuthPage.jsx         # One page driving login/signup/forgot/reset by route
│   └── ChatPage.jsx         # The chat screen; owns conversation + message state
│
└── components/
    ├── ProtectedRoute.jsx       # Auth guard wrapper
    ├── Sidebar.jsx              # Conversation list, profile menu, theme menu, modal host
    ├── ChatArea.jsx            # Scrollable message list + auto-scroll
    ├── ChatMessage.jsx         # Single message: markdown, code blocks, copy/regenerate
    ├── ChatInput.jsx           # Composer: textarea, service menu, send/stop
    ├── ProfileModal.jsx        # Profile, logout, delete-all-chats, delete-account
    ├── ChangePasswordModal.jsx # Change password form
    ├── AboutModal.jsx          # About/version info
    └── ShareModal.jsx          # Copy / download a conversation
```

## File-by-file responsibilities

| File | Lines (approx.) | Responsibility |
|------|------|----------------|
| `src/main.jsx` | 10 | Bootstrap React into `#root` under `StrictMode`; import global CSS |
| `src/App.jsx` | 38 | Wrap app in `ThemeProvider` → `AuthProvider` → `Router`; declare routes |
| `src/config.js` | 30 | Single source for `API_BASE_URL`, available services, and endpoint paths/helpers |
| `src/index.css` | 1000 | Tailwind directives, every theme's CSS variables, per-theme chat-bubble styles, custom scrollbars |
| `src/api/client.js` | 46 | Axios client; attaches bearer token; on 401 clears token and calls logout handler |
| `src/context/AuthContext.jsx` | 98 | Auth state + actions; derives `user` from JWT claims |
| `src/context/ThemeContext.jsx` | 58 | Theme state; toggles class on `<html>`; persists to `localStorage` |
| `src/lib/utils.js` | 7 | `cn()` class merge helper |
| `src/lib/jwt.js` | 24 | Decode JWT payload and check expiry, client-side |
| `src/pages/AuthPage.jsx` | 338 | All four auth flows in one route-aware component |
| `src/pages/ChatPage.jsx` | 387 | Chat orchestration: load/list/send/stream/stop/regenerate/rename/delete/share |
| `src/components/Sidebar.jsx` | 634 | Largest component: history list, action menus, profile menu, full theme picker, modal mounting |
| `src/components/ChatMessage.jsx` | 195 | Markdown rendering, custom `CodeBlock`, table/link renderers, theme-aware prose |
| `src/components/ChatInput.jsx` | 229 | Auto-growing textarea, service toggles + badges, send/stop button |
| `src/components/ProfileModal.jsx` | 252 | Multi-step destructive confirmations for account/history deletion |
| `src/components/ChangePasswordModal.jsx` | 161 | Old/new/confirm password form against `/auth/reset-password` |
| `src/components/ShareModal.jsx` | 122 | Copy-to-clipboard / download-as-txt actions (rendered via portal) |
| `src/components/AboutModal.jsx` | 100 | Static about/version/links panel |
| `src/components/ChatArea.jsx` | 36 | Renders message list, auto-scrolls to bottom, shows loading spinner |
| `src/components/ProtectedRoute.jsx` | 22 | Redirects unauthenticated users to `/login` |

## Conventions you'll notice

- **One component per file**, named in `PascalCase.jsx`; default export per file.
- **Co-located concerns**: `api/`, `context/`, `lib/`, `pages/`, `components/` separate by role.
- **No barrel files** (`index.js` re-exports) — imports reference files directly.
- **`config.js` is imported wherever endpoints are needed** rather than hard-coding strings.
- **Modals are mounted by `Sidebar`**, not by individual pages, centralizing their open/close state.

## What is generated vs. authored

- **Authored:** everything under `src/`, `public/`, and the config files.
- **Generated / ignored:** `node_modules/`, `dist/`, `.vite/`, coverage, env files (see `.gitignore`).
- **`.qoder/`** — tooling metadata directory (present in the working tree, not application code).

## Related chapters

- [Chapter 11 — Core Components](./11-components.md) goes inside each component.
- [Chapter 06 — Configuration](./06-configuration.md) covers the config files in depth.
