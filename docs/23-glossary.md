# 23 — Glossary

[← Back to Index](./index.md)

Definitions of the key terms, technologies, and project-specific concepts used throughout this book
and the codebase.

## Project-specific concepts

| Term | Meaning |
|------|---------|
| **Service** | One of the five AI capabilities the UI can request per message: `chat`, `web_search`, `thinking`, `image_search`, `news_search`. Sent as `service_name` to the stream endpoint. Defined in `config.services`. |
| **Service toggle** | The mutually-exclusive UI switches in `ChatInput` that select the active service for the next message. |
| **Conversation / chat** | A persisted thread of message turns, identified by an `id`. Listed in the sidebar; opened via the `/chat/:id` route. |
| **Turn** | The backend's unit pairing one `user` prompt with its `assistant` reply (and `created_at`). The UI flattens each turn into two display messages. |
| **Message (display)** | A single rendered item: `{ id, role: 'user'|'assistant', content, isStreaming?, created_at? }`. |
| **Optimistic UI** | Inserting the user message and an empty assistant placeholder immediately on send, before the server responds. |
| **Streaming placeholder** | The empty assistant message (with `isStreaming: true`) that fills as SSE `content` frames arrive; shows a pulsing cursor. |
| **Hero state** | The empty-thread layout: centered logo, "How can I help you today?", and an enlarged input. Driven by `isChatEmpty`. |
| **Theme** | A named set of CSS color variables applied via a class on `<html>` (e.g. `dark`, `midnight-green`). 20+ available. |
| **CSS token / design token** | An HSL color variable (`--background`, `--primary`, …) that themes set and Tailwind utilities consume. |

## Web / React / tooling terms

| Term | Meaning |
|------|---------|
| **SPA (Single-Page Application)** | A web app that loads once and updates the view client-side via JS routing, without full page reloads. |
| **Vite** | The build tool and dev server; provides HMR and produces the optimized `dist/` bundle. |
| **HMR (Hot Module Replacement)** | Dev-time feature that swaps changed modules without a full reload, preserving state where possible. |
| **React Context** | React's built-in mechanism for sharing state across the tree without prop drilling. Used for Auth and Theme. |
| **Provider** | A component that supplies a Context value to its descendants (`AuthProvider`, `ThemeProvider`). |
| **Hook** | A function (`useState`, `useEffect`, `useRef`, `useAuth`, `useTheme`, …) that lets function components use React features. |
| **`useRef`** | A hook holding a mutable value that persists across renders without causing re-renders (used for the abort controller, DOM refs). |
| **StrictMode** | A dev-only React wrapper that double-invokes effects/renders to surface side-effect bugs. |
| **Portal** | `ReactDOM.createPortal` renders children into a different DOM node (here `document.body`) so overlays escape parent clipping/stacking. |
| **Route guard** | A wrapper component (`ProtectedRoute`) that conditionally renders or redirects based on auth state. |
| **`BrowserRouter`** | React Router's history-API-based router; requires a server SPA fallback to `index.html`. |

## HTTP / networking terms

| Term | Meaning |
|------|---------|
| **REST** | The request/response JSON API style used for auth and conversation CRUD (via Axios). |
| **Axios** | Promise-based HTTP client; configured with a base URL and interceptors in `api/client.js`. |
| **Interceptor** | Axios middleware that runs on every request (attach token) or response (handle 401). |
| **SSE (Server-Sent Events)** | A one-way server→client streaming protocol over HTTP; frames are `data: <payload>\n\n`. Used for token streaming. |
| **`ReadableStream` / `getReader()`** | Web API for reading a response body incrementally; how the SSE stream is consumed. |
| **`TextDecoder`** | Converts streamed byte chunks into strings for parsing. |
| **`AbortController` / `signal`** | Web API to cancel an in-flight `fetch`; powers the Stop button. |
| **CORS** | Cross-Origin Resource Sharing; the backend must permit the SPA's origin. |

## Auth / security terms

| Term | Meaning |
|------|---------|
| **JWT (JSON Web Token)** | A signed token (`header.payload.signature`) carrying claims. Stored in `localStorage`, sent as a bearer token. |
| **Claim** | A field inside the JWT payload (`sub`, `email`, `name`, `exp`, …). |
| **Bearer token** | An auth scheme: `Authorization: Bearer <token>`. |
| **`exp` claim** | The token's expiry, in Unix seconds; checked by `isTokenExpired`. |
| **OTP (One-Time Password)** | The code emailed during the forgot/reset-password flow. |
| **XSS (Cross-Site Scripting)** | An attack class where injected scripts run in the page; relevant because tokens live in `localStorage` and Markdown allows raw HTML. |

## Styling terms

| Term | Meaning |
|------|---------|
| **Tailwind CSS** | Utility-first CSS framework; classes map to design tokens. |
| **`@tailwindcss/typography` / `prose`** | Plugin and classes that style rendered Markdown. |
| **Tailwind variant** | A prefix selector (e.g. `dark:`, `blue:`) that applies a utility only under a condition; custom theme variants are registered in `tailwind.config.js`. |
| **`cn()`** | Project helper combining `clsx` (conditional classes) and `tailwind-merge` (conflict resolution). |
| **`clsx`** | Builds className strings from conditional inputs. |
| **`tailwind-merge`** | Dedupes/merges conflicting Tailwind classes. |
| **Autoprefixer** | PostCSS plugin adding vendor prefixes. |

## Markdown rendering terms

| Term | Meaning |
|------|---------|
| **react-markdown** | Renders Markdown strings as React elements with custom component overrides. |
| **remark-gfm** | GitHub-Flavored Markdown plugin (tables, autolinks, strikethrough, task lists). |
| **rehype-raw** | Allows raw HTML embedded in Markdown to be parsed/rendered (note: does not sanitize). |

## Related chapters

- [Chapter 01 — Project Overview](./01-project-overview.md)
- [Chapter 10 — API Integration](./10-api-integration.md)
- [Index](./index.md)
