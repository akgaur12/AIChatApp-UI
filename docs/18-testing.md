# 18 — Testing Strategy

[← Back to Index](./index.md)

## Current state (honest baseline)

**There are no automated tests in this repository today.**

- No test runner is configured (no Jest/Vitest in `package.json`).
- No `test` script exists in `package.json` (`scripts` are `dev`, `build`, `lint`, `preview`).
- No `*.test.jsx` / `*.spec.jsx` files, and no `__tests__` directories.
- No coverage tooling (though `.gitignore` pre-emptively ignores `coverage/`).

Quality is currently maintained by **ESLint** (`npm run lint`) and manual testing. This chapter
therefore doubles as a **recommended testing plan** for the team.

## Recommended toolchain

Given Vite + React, the natural stack is:

| Layer | Tool | Why |
|-------|------|-----|
| Unit / component | **Vitest** + **@testing-library/react** | First-class Vite integration, fast, jsdom |
| DOM assertions | **@testing-library/jest-dom** | Readable matchers |
| User interaction | **@testing-library/user-event** | Realistic events |
| Network mocking | **MSW (Mock Service Worker)** | Mock REST and **stream** endpoints uniformly |
| End-to-end | **Playwright** | Real browser flows incl. SSE streaming |

Suggested `package.json` additions:

```jsonc
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:e2e": "playwright test",
  "coverage": "vitest run --coverage"
}
```

## What to test (priority order)

### 1. Pure utilities (fast wins, high value)
- **`lib/jwt.js`**
  - `parseJwt` returns the decoded payload for a valid token; `null` for malformed/empty.
  - `isTokenExpired` true for missing/expired/no-`exp`; false for a future `exp`.
- **`lib/utils.js`**
  - `cn` merges conditional classes and resolves Tailwind conflicts (`p-2 p-4` → `p-4`).

### 2. Contexts
- **`AuthContext`**
  - On mount with a valid token → `user` populated; with an expired token → logged out.
  - `login` stores the token and sets the user; `logout` clears both.
  - 401 via the client triggers logout (wire up `setLogoutHandler`).
- **`ThemeContext`**
  - `setTheme` writes `localStorage['vite-ui-theme']` and toggles the `<html>` class; old theme class
    removed.

### 3. Routing / guards
- `ProtectedRoute` shows the spinner while `loading`, redirects to `/login` when unauthenticated, and
  renders children when authenticated.
- `/` and unknown routes redirect correctly.

### 4. Auth flows (`AuthPage`)
- Each mode renders the right fields and validations (length, match).
- Submit calls the correct endpoint/action and shows success/error banners.

### 5. Chat behavior (`ChatPage`) — the critical path
Use MSW to mock both REST and the SSE stream:
- Optimistic insert appears immediately on send.
- Streamed `content` frames accumulate into the assistant message.
- `metadata.conversation_id` drives the URL replace for new chats.
- **Stop** aborts and leaves the partial message without an error bubble.
- A failed stream appends the "Error: Failed to generate response." bubble.
- Service toggle → correct `service_name` in the request body.

### 6. Component units
- `ChatMessage`: renders Markdown, code block copy works, links get `target/rel`.
- `ChatInput`: Enter sends, Shift+Enter newlines, service selection is mutually exclusive.
- `ProfileModal`: two-step confirmation gates the destructive call.

### 7. E2E (Playwright)
- Full signup → login → send message (mock backend) → see streamed reply → rename → delete.

## Example: a starter unit test

```jsx
// src/lib/jwt.test.js  (Vitest)
import { describe, it, expect } from 'vitest';
import { isTokenExpired } from './jwt';

const makeToken = (payload) =>
  `h.${btoa(JSON.stringify(payload))}.s`;

describe('isTokenExpired', () => {
  it('returns true when no token', () => {
    expect(isTokenExpired(null)).toBe(true);
  });
  it('returns true when exp is in the past', () => {
    expect(isTokenExpired(makeToken({ exp: 1 }))).toBe(true);
  });
  it('returns false when exp is in the future', () => {
    expect(isTokenExpired(makeToken({ exp: Math.floor(Date.now()/1000) + 3600 }))).toBe(false);
  });
});
```

## Mocking the SSE stream (MSW sketch)

```js
http.post('*/chat/run_pipeline/stream', () => {
  const body = new ReadableStream({
    start(c) {
      const enc = new TextEncoder();
      c.enqueue(enc.encode('data: {"type":"content","content":"Hi"}\n\n'));
      c.enqueue(enc.encode('data: {"type":"metadata","conversation_id":"c1"}\n\n'));
      c.close();
    }
  });
  return new HttpResponse(body, { headers: { 'Content-Type': 'text/event-stream' } });
});
```

## Coverage goals (suggested)

- **Utilities & contexts: 90%+** (cheap, deterministic).
- **Critical chat path: covered by integration tests** even if line coverage is moderate.
- Treat coverage as a guide, not a gate; prioritize the streaming and auth paths.

## Related chapters

- [Chapter 10 — API Integration](./10-api-integration.md) (what to mock)
- [Chapter 20 — Development Workflow & Coding Standards](./20-workflow-standards.md)
