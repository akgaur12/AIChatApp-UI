# 16 — Error Handling & Logging

[← Back to Index](./index.md)

This chapter catalogs how errors are detected, where they're caught, what the user sees, and the
logging conventions — based strictly on the current implementation.

## Logging conventions

The app uses **`console.*` only** (no logging library, no remote log sink):

- `console.error("<context>", err)` — for caught failures (the dominant pattern).
- `console.log(...)` — a couple of informational messages (e.g. "Fetch aborted", "Chat copied").

There is **no structured logging, log level control, or telemetry**. In production these console calls
remain (Vite does not strip them by default).

## Error handling by layer

### HTTP layer (Axios) — `src/api/client.js`
- A **response interceptor** intercepts `401` globally: clears the token and triggers logout, then
  re-rejects so the caller's `catch` still runs. This is the single global error policy.
- All other statuses propagate to the caller as a rejected promise.

### Auth context — `src/context/AuthContext.jsx`
- `login` and `deleteAccount` log and **re-throw** so the calling UI can show a message.
- `signup` is a pass-through (errors bubble to `AuthPage`).

### Auth UI — `src/pages/AuthPage.jsx`
- `handleSubmit` wraps each flow in try/catch and sets a user-visible `error` string:
  ```javascript
  setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
  ```
- **Client-side validation** runs before the request: password length ≥ 6, password/confirm match.
  Failures set `error` and abort early.
- Errors render in a red banner; successes in a green banner.

### Modals
- **`ChangePasswordModal`**: validates, then on failure shows `err.response?.data?.detail` or a generic
  message in a red banner.
- **`ProfileModal`**: destructive actions catch errors, show an inline error, and reset the
  confirmation step so the user can retry.
- **`ShareModal`**: copy/download wrapped in try/catch with `console.error`; the modal closes in the
  `finally` regardless.

### Chat page — `src/pages/ChatPage.jsx`
This is where the most nuanced handling lives:

| Operation | On error |
|-----------|----------|
| `fetchConversations` | `console.error` only (silent in UI; sidebar just stays as-is) |
| `loadChat` | `console.error`, then `navigate('/chat')` (fall back to a new chat) |
| `handleSend` (stream) | See below |
| `handleStop` | n/a (just aborts) |
| `handleDeleteChat` / `handleRenameChat` | `console.error` only |
| `handleDeleteAllConversations` | `console.error` and **re-throw** (so `ProfileModal` can show it) |
| `handleCopyChat` | `console.error` + `alert("Failed to copy chat to clipboard.")` |
| `handleDownloadChat` | `console.error` + `alert("Failed to download chat.")` |

### Streaming error handling (`handleSend`)

```javascript
try {
  const response = await fetch(streamUrl, { ... });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  // ... read stream, parse 'data:' frames ...
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Fetch aborted');                  // user pressed Stop — expected, silent
  } else {
    console.error("Send message failed", error);
    setMessages(prev => [...prev, {                // visible fallback bubble
      id: Date.now(), role: 'assistant',
      content: "Error: Failed to generate response."
    }]);
  }
} finally {
  setIsLoading(false); setIsStreaming(false);
  // mark the streaming placeholder done
  abortControllerRef.current = null;
}
```

Notes and caveats:
- **Abort is treated as success** (silent stop), not an error.
- A failed stream appends a visible **"Error: Failed to generate response."** assistant bubble — the
  one place chat errors surface in the UI.
- **Per-frame parse errors** (`JSON.parse` of a `data:` line) are caught and `console.error`'d
  individually, so one malformed frame doesn't kill the whole stream (`ChatPage.jsx:207-209`).
- **Stream `error`-type events** (`{type:"error", detail}`) are only logged — **not shown** to the
  user (`ChatPage.jsx:203-205`). This is a known gap.
- **The streaming path bypasses the Axios 401 interceptor.** A `401` here throws a generic
  `HTTP error! status: 401` and shows the fallback bubble, but does **not** auto-logout. If you want
  parity, handle 401 explicitly in `handleSend`.

## Error-surfacing matrix

| Surface | Where used |
|---------|-----------|
| Red banner | Auth forms, change-password modal |
| Inline destructive error | Profile modal (delete flows) |
| Fallback assistant bubble | Streaming failure |
| `window.alert` | Copy/download chat failures |
| `window.confirm` | Delete single chat |
| Console only (no UI) | List/rename/delete failures, stream `error` events, parse errors |

## React-level error boundaries

There is **no React error boundary** in the app. An uncaught render error would unmount the tree. For
production hardening, consider adding a top-level error boundary around the router in `App.jsx`.

## Recommendations

1. **Unify network error UX** with a toast system (replace `alert` and silent `console.error`).
2. **Surface stream `error` events** to the user.
3. **Handle 401 in the streaming path** to match Axios behavior.
4. **Add an error boundary** for resilience.
5. Optionally strip/guard `console.*` in production builds.

## Related chapters

- [Chapter 08 — Authentication](./08-authentication.md)
- [Chapter 10 — API Integration](./10-api-integration.md)
- [Chapter 22 — Troubleshooting](./22-troubleshooting.md)
