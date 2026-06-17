# 22 — Troubleshooting Guide

[← Back to Index](./index.md)

Common problems, their likely causes, and fixes. Most issues trace back to the backend connection,
the token, or the theme system.

---

## Setup & build

### `npm install` fails or versions mismatch
- Ensure **Node 18+** (`node -v`). Vite 5 requires it.
- Delete `node_modules` and reinstall with the lockfile: `rm -rf node_modules && npm ci`.

### Dev server isn't on the port I expect
- It runs on **`http://localhost:45002`** (set in `vite.config.js`), **not** 5173. The README's 5173
  reference is stale.

### `npm run build` fails
- Run `npm run lint` first to catch syntax issues.
- Check for an unterminated JSX/className change you just made.

---

## Authentication

### I'm always redirected to `/login`
- No valid token in `localStorage`, or it's expired. Log in again.
- Check `localStorage['token']` in DevTools → Application → Local Storage.
- If the token exists but you're still bounced: it may be **expired** (`isTokenExpired` logs you out on
  load) or **malformed** (decode fails). Inspect it at jwt.io or via `parseJwt` in the console.

### Login "works" but the name/email show as defaults ("User", "user@example.com")
- The UI derives identity from **JWT claims** (`sub`/`email`, `name`/`preferred_username`/`nickname`).
  If the backend token lacks those claims, you get fallbacks. Fix is on the **backend** (include the
  claims). See [Chapter 08](./08-authentication.md#deriving-the-user-from-the-token).

### I get logged out unexpectedly mid-session
- An Axios request returned **401** → the response interceptor cleared the token and logged you out
  (`api/client.js`). The token likely expired. Re-login.

### Auth requests fail with a network/CORS error
- Backend not running, wrong `API_BASE_URL` in `src/config.js`, or the backend's **CORS** doesn't
  allow your origin. Verify the backend is up at the configured URL and that CORS permits
  `http://localhost:45002`.

---

## Chat & streaming

### Messages never stream / "Error: Failed to generate response."
- The streaming `fetch` to `/chat/run_pipeline/stream` failed. Open the Network tab and inspect the
  request:
  - **401** → token invalid/expired. (Note: the stream path does **not** auto-logout — re-login
    manually. See [Chapter 16](./16-error-handling.md).)
  - **CORS / connection refused** → backend down or wrong `API_BASE_URL`.
  - **Non-200** → check backend logs.

### The reply appears but stays blank / cursor never stops
- The stream may not be sending `content` frames in the expected `data: {json}\n\n` shape. Confirm the
  backend's SSE format matches what `ChatPage` parses (`type: content|metadata|error`). Parse errors
  per frame are logged to the console (`Error parsing SSE data`).

### Stop button doesn't stop generation
- `handleStop` aborts the `AbortController`. If the backend keeps computing server-side, the client
  still stops reading. Confirm `abortControllerRef.current` is set (it's created at send time).

### Regenerate produces a duplicate exchange instead of replacing
- This is current behavior: `handleRegenerate` re-sends the previous user prompt as a **new** turn. It
  doesn't delete the old assistant message. See [Chapter 12](./12-features.md#regenerate).

### A new chat doesn't get a URL / disappears on refresh
- The new `conversation_id` arrives in a `metadata` SSE frame; the URL is updated only when the stream
  **ends**. If the stream errored before `metadata`, no id was captured. Check the stream completed.

### Sidebar doesn't show my new chat
- The list refreshes via `fetchConversations()` at stream end. If that GET failed (console error), the
  list won't update. Check `/chat/conversations` in the Network tab.

---

## Theming

### Theme doesn't change / colors look wrong
- Inspect `<html>` in DevTools — it should carry exactly **one** theme class. If a stale class lingers,
  the new theme was likely added to the CSS/picker but **not** to the `remove(...)` list in
  `ThemeContext.jsx`. See [Chapter 13](./13-theming-styling.md).

### A new theme has unreadable chat text
- Add the `<theme>:prose-*` contrast overrides in `ChatMessage.jsx` and/or a
  `.<theme> .ai-bubble` rule in `index.css`.

### Theme resets after reload
- Persistence uses `localStorage['vite-ui-theme']`. If it's reset, something is clearing localStorage,
  or the `storageKey` prop in `App.jsx` was changed.

---

## UI quirks

### A footer link on the auth page looks unstyled
- Known issue: one link uses `class` instead of `className` (`AuthPage.jsx:313`). React ignores it.
  Fix by renaming to `className`.

### Console warning about effects running twice in dev
- Expected — `React.StrictMode` double-invokes effects in development only. It won't happen in
  production. See [Chapter 20](./20-workflow-standards.md).

### Copy/download chat shows an alert "Failed to..."
- The underlying GET of the conversation failed (network/token), or `navigator.clipboard` is blocked
  (clipboard requires a secure context — **HTTPS** or `localhost`). On plain HTTP non-localhost,
  clipboard writes are denied by the browser.

---

## Quick diagnostic checklist

1. Is the **backend running** at `API_BASE_URL` (`src/config.js`)?
2. Does `localStorage['token']` exist and is it **unexpired**?
3. Any **CORS** errors in the console?
4. Does the failing call appear in the **Network** tab with a useful status?
5. Is `<html>` carrying the right **theme class**?
6. Does `npm run lint` pass?

## Related chapters

- [Chapter 16 — Error Handling](./16-error-handling.md)
- [Chapter 08 — Authentication](./08-authentication.md)
- [Chapter 10 — API Integration](./10-api-integration.md)
