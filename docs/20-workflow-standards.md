# 20 — Development Workflow & Coding Standards

[← Back to Index](./index.md)

## Day-to-day workflow

```bash
git clone <repo> && cd AIChatApp-UI
npm install
# point src/config.js at your backend (see Chapter 06)
npm run dev          # http://localhost:45002, HMR on
# ... edit code, the browser hot-reloads ...
npm run lint         # before committing
npm run build        # verify a production build succeeds
```

- **Hot Module Replacement (HMR):** Vite + `@vitejs/plugin-react` gives instant updates and React
  Fast Refresh (component state preserved across edits where possible).
- **StrictMode:** `main.jsx` wraps the app in `React.StrictMode`, which **double-invokes** effects and
  renders in development to surface side-effect bugs. Expect effects to run twice in dev — this does
  not happen in production builds.

## Linting

ESLint is the enforced quality tool. Run:

```bash
npm run lint    # eslint .
```

Configured plugins (from `devDependencies`):
- `eslint-plugin-react` — React best practices.
- `eslint-plugin-react-hooks` — Rules of Hooks + exhaustive-deps.
- `eslint-plugin-react-refresh` — warns about exports that break Fast Refresh.

There is **no Prettier config** committed; formatting is currently by convention (see below). Consider
adding Prettier + an ESLint integration for consistency.

## Coding standards & conventions (observed)

These reflect how the existing code is written — follow them for consistency.

### Files & naming
- **Components:** `PascalCase.jsx`, one component per file, `export default`.
- **Hooks/context:** `useThing` for hooks; providers named `XProvider`.
- **Utilities:** `camelCase` functions in `src/lib/*.js`.
- **Config/constants:** centralized in `src/config.js`.

### React style
- **Function components + hooks** exclusively (no class components).
- **Local state** with `useState`; **side effects** with `useEffect`; **stable callbacks** with
  `useCallback` (used in `ChatPage` for `fetchConversations`/`loadChat`); **imperative handles** with
  `useRef` (e.g. abort controller, textarea, menu refs).
- **Props passed explicitly**; callbacks named `onX` (`onSend`, `onSelectChat`, …).
- **Conditional rendering** via `&&` and ternaries; early `if (!isOpen) return null;` in modals.

### Styling
- **Tailwind utility classes** inline; compose conditionals with the **`cn()`** helper
  (`clsx` + `tailwind-merge`) rather than string concatenation.
- Use **semantic color utilities** (`bg-background`, `text-primary`, `bg-muted`) so themes apply —
  avoid hard-coded colors except intentional per-theme overrides. See
  [Chapter 13](./13-theming-styling.md).
- Indentation: **4 spaces** (matches the codebase).

### Imports
- React first, then third-party, then local (`context`, `api`, `config`, `components`, `lib`).
- No barrel files — import directly from the source file.

### API access
- Use the shared Axios **`client`** for REST; never hard-code endpoint strings — reference
  `config.endpoints.*`.
- The streaming endpoint is the **only** intentional `fetch` usage.

## Git workflow (recommended)

The repo currently commits to `main`. A healthy flow:

1. Branch from `main`: `git checkout -b feat/<short-name>`.
2. Keep commits focused; use conventional-commit style prefixes seen in history
   (`feat:`, `docs:`, `feat(theme):`, `docs(readme):`).
3. `npm run lint` (and tests once they exist) before pushing.
4. Open a PR; ensure `npm run build` passes.

Recent history examples:
```
feat: add language labels and refine code block design
feat(theme): add multiple custom color themes and refine theme system
docs(readme): sync documentation with current implementation
```

## Adding common things

- **A new endpoint:** add it to `src/config.js`, then call via the Axios `client`.
- **A new theme:** follow the checklist in [Chapter 13](./13-theming-styling.md#adding-a-new-theme--checklist).
- **A new AI service:** add the id to `config.services.available`, add a menu item + badge in
  `ChatInput`, add a toggle in `ChatPage`, and map it in `handleSend`.
- **A new modal:** create `XModal.jsx` (follow the existing modal pattern), mount it in `Sidebar`
  (or the relevant parent), and drive it with an `isOpen`/`onClose` pair.

## Definition of done (suggested)

- [ ] Lint passes.
- [ ] Production build succeeds.
- [ ] New strings use theme-aware utilities (no broken contrast in any theme).
- [ ] No new `console.error`-only failure paths for user-facing actions (surface them).
- [ ] Endpoints referenced via `config.js`, not inline.

## Related chapters

- [Chapter 15 — Design Patterns](./15-design-patterns.md)
- [Chapter 18 — Testing](./18-testing.md)
