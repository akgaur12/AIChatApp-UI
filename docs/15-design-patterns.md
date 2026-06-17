# 15 — Design Patterns & Architectural Decisions

[← Back to Index](./index.md)

This chapter records the recurring patterns in the codebase and the reasoning behind the key
architectural decisions — the "why", so future changes stay consistent with intent.

## Patterns in use

### 1. Provider / Context for cross-cutting state
Auth and Theme are exposed via React Context with custom hooks (`useAuth`, `useTheme`). Components
consume them anywhere without prop drilling. `useTheme` throws if used outside its provider, surfacing
misuse early (`ThemeContext.jsx:54`).

### 2. Smart container / presentational children
`ChatPage` is the single "smart" component holding chat state and side effects; `Sidebar`, `ChatArea`,
`ChatMessage`, and `ChatInput` are largely presentational and communicate via callbacks. This keeps
data flow predictable (down via props, up via callbacks).

### 3. Centralized configuration
All endpoints and the base URL live in `src/config.js`. Dynamic routes are **functions**
(`conversation(id)`, `rename_conversation(id)`), keeping URL construction in one place rather than
scattered template strings.

### 4. Interceptor-based cross-cutting HTTP concerns
The Axios request interceptor injects the bearer token; the response interceptor centralizes 401 →
logout. Components never manually attach tokens for Axios calls.

### 5. Decoupling a non-React module from React state (callback registration)
`api/client.js` cannot import the Auth context, but it must trigger logout on 401. The solution is a
**registered handler**:

```javascript
// client.js
let onLogout = null;
export const setLogoutHandler = (h) => { onLogout = h; };
// AuthContext.jsx (on mount)
setLogoutHandler(logout);
```

This is a small dependency-inversion / observer pattern that avoids a circular import.

### 6. Optimistic UI
On send, the user message and an empty assistant placeholder are rendered immediately; the placeholder
is filled as tokens stream. Perceived latency drops to near-zero. (`ChatPage.handleSend`.)

### 7. Imperative resource handle via `useRef`
The `AbortController` for the active stream is kept in `abortControllerRef` so it survives re-renders
and can be aborted imperatively without causing renders.

### 8. Portals for overlays
Action menus and some modals render through `createPortal(node, document.body)` so they escape the
sidebar's `overflow-hidden` and stack above all content with computed positions.

### 9. Multi-step confirmation for destructive actions
`ProfileModal` requires two explicit confirmations before deleting an account or all history — a
deliberate guard against accidental data loss.

### 10. CSS-variable theming with class toggling
Themes are pure data (CSS variables) selected by a class on `<html>`. No per-component theme branching
is needed; Tailwind utilities resolve the variables. (See [Chapter 13](./13-theming-styling.md).)

### 11. Route-as-state
The open conversation is encoded in the URL (`/chat/:id?`), making chats deep-linkable and the
back/forward buttons meaningful.

## Key decisions & trade-offs

| Decision | Rationale | Trade-off / cost |
|----------|-----------|------------------|
| **Two HTTP transports** (Axios + `fetch`) | Browser Axios can't expose an incremental SSE byte stream; `fetch` + `ReadableStream` can | The streaming path bypasses Axios interceptors (manual token, no auto-logout on 401) |
| **No global store** (Context + local state) | Small app; avoids Redux/Zustand boilerplate and deps | Prop drilling through `ChatPage`; no built-in caching |
| **No server-state caching** (no React Query) | Simplicity | Refetches on every chat open; manual list refresh after mutations |
| **JWT in `localStorage`** | Simple, survives reloads, easy to read claims | XSS-readable; not auto-expiring (see [Chapter 17](./17-security.md)) |
| **Client-side JWT decode for user info** | Avoids a `/me` round trip | Display data depends on token claims; no signature verification client-side (acceptable — backend verifies) |
| **Hard-coded `API_BASE_URL`** | Zero-config local start | Requires code edit per environment (env-var migration suggested in [Chapter 06](./06-configuration.md)) |
| **One `AuthPage` for 4 routes** | Shared layout, less duplication | A single larger component with mode branching |
| **Theme class list duplicated in 3 places** | Explicit and dependency-free | Easy to forget one when adding a theme (documented checklist in [Chapter 13](./13-theming-styling.md)) |
| **JavaScript, not TypeScript** | Lower ceremony | No compile-time type safety (type stubs present for editor hints only) |

## Anti-patterns / debt to be aware of

These are documented honestly so maintainers can plan improvements (not blockers):

- **Direct mutation of a message object during streaming** (`lastMsg.content = aiContent`) — works
  because a new array is returned, but mutating state objects is fragile.
- **`class` instead of `className`** on one auth link (`AuthPage.jsx:313`).
- **Unused code:** `endpoints.chat.delete_conversation`, `endpoints.chat.base`, the `UserIcon()`
  function in `Sidebar.jsx`, and the `date-fns` dependency.
- **No visible surfacing of stream `error` events** — they're only `console.error`'d.

## Recommended evolution path

1. Add env-var configuration for `API_BASE_URL`.
2. Introduce a thin streaming wrapper that also handles 401 (parity with Axios).
3. Surface stream errors and network failures to the user (toasts).
4. Consider React Query for server state if features grow (caching, retries, invalidation).
5. Add tests (see [Chapter 18](./18-testing.md)).

## Related chapters

- [Chapter 02 — Architecture](./02-architecture.md)
- [Chapter 09 — State Management](./09-state-management.md)
- [Chapter 17 — Security](./17-security.md)
