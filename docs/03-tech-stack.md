# 03 — Technology Stack & Dependencies

[← Back to Index](./index.md)

This chapter enumerates every dependency declared in `package.json`, explains why it is present, and
points to where it is used.

## Runtime dependencies

| Package | Version (semver) | Role | Used in |
|---------|------------------|------|---------|
| `react` | `^18.2.0` | UI library | everywhere |
| `react-dom` | `^18.2.0` | React renderer for the DOM, `createPortal` | `src/main.jsx`, `Sidebar`, `ShareModal` |
| `react-router-dom` | `^7.12.0` | Client-side routing (`BrowserRouter`, `Routes`, `useParams`, `useNavigate`, `Link`) | `src/App.jsx`, pages, `ProtectedRoute` |
| `axios` | `^1.13.2` | HTTP client with interceptors for REST calls | `src/api/client.js` and all components doing CRUD |
| `framer-motion` | `^12.27.0` | Animation library | imported in `src/pages/AuthPage.jsx` (`motion`, `AnimatePresence`) |
| `lucide-react` | `^0.309.0` | Icon set (SVG React components) | nearly every component |
| `react-markdown` | `^9.0.1` | Render Markdown → React | `src/components/ChatMessage.jsx` |
| `remark-gfm` | `^4.0.1` | GitHub-Flavored Markdown (tables, strikethrough, autolinks) plugin for react-markdown | `src/components/ChatMessage.jsx` |
| `rehype-raw` | `^7.0.0` | Allow raw HTML inside Markdown to be parsed | `src/components/ChatMessage.jsx` |
| `clsx` | `^2.1.1` | Conditional className construction | `src/lib/utils.js` |
| `tailwind-merge` | `^2.6.0` | Resolve conflicting Tailwind classes | `src/lib/utils.js` |
| `@tailwindcss/typography` | `^0.5.19` | `prose` classes for rich text/markdown styling | `tailwind.config.js`, `ChatMessage` |
| `date-fns` | `^4.1.0` | Date utilities | declared; not currently imported in `src/` (candidate for cleanup or future use) |

> **Note on `date-fns`:** it is listed as a dependency but no `import` of it currently exists in
> `src/`. Treat it as either reserved for upcoming work or a removable dependency.

## Development dependencies

| Package | Version | Role |
|---------|---------|------|
| `vite` | `^5.0.8` | Dev server + production bundler |
| `@vitejs/plugin-react` | `^4.2.1` | React Fast Refresh + JSX transform for Vite |
| `tailwindcss` | `^3.4.0` | Utility-first CSS framework |
| `postcss` | `^8.4.32` | CSS transformation pipeline (runs Tailwind + Autoprefixer) |
| `autoprefixer` | `^10.4.16` | Adds vendor prefixes to CSS |
| `eslint` | `^8.55.0` | Linter |
| `eslint-plugin-react` | `^7.33.2` | React-specific lint rules |
| `eslint-plugin-react-hooks` | `^4.6.0` | Rules-of-Hooks enforcement |
| `eslint-plugin-react-refresh` | `^0.4.5` | Warns on patterns that break Fast Refresh |
| `@types/react`, `@types/react-dom` | `^18.2.43` / `^18.2.17` | TypeScript type stubs (for editor IntelliSense; the project is JS, not TS) |

## Why these choices

- **React 18 + Vite** — fast HMR, minimal config, modern ESM build. The app uses
  `React.StrictMode` (`src/main.jsx:7`) which double-invokes effects in development to surface bugs.
- **React Router v7** — declarative routing with nested/optional params (`/chat/:id?`).
- **Tailwind CSS + CSS variables** — enables the large runtime theme catalog without writing bespoke
  component CSS. See [Chapter 13](./13-theming-styling.md).
- **`clsx` + `tailwind-merge` (the `cn` helper)** — the de-facto shadcn/ui pattern for safely
  composing conditional Tailwind classes; see `src/lib/utils.js`.
- **react-markdown + remark-gfm + rehype-raw** — to render the model's Markdown output richly
  (tables, code fences) while allowing limited raw HTML.
- **lucide-react** — consistent, lightweight icon set used throughout the UI.
- **framer-motion** — available for animation; primarily imported on the auth screen.

## Versioning & lockfile

- Dependencies use **caret (`^`) ranges**, so `npm install` resolves to the latest compatible minor/patch.
- `package-lock.json` is committed (≈260 KB) and pins the exact resolved tree — **the lockfile is the
  source of truth for reproducible installs**. Do not delete it.
- `.gitignore` contains commented-out lock-file ignore lines, confirming the intent to keep
  `package-lock.json` tracked.

## Node / tooling requirements

- **Node.js v18+** (per README prerequisites). Vite 5 requires Node 18+.
- Package manager: **npm** (a `package-lock.json` is present; no yarn/pnpm lockfile).

## Related chapters

- [Chapter 06 — Configuration & Environment](./06-configuration.md) for Vite/PostCSS/Tailwind config.
- [Chapter 19 — Build, Deployment & CI/CD](./19-build-deployment.md) for how these tools produce the build.
