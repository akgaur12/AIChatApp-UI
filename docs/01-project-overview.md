# 01 — Project Overview

[← Back to Index](./index.md)

## What is AIChatApp UI?

**AIChatApp UI** is the web front-end of a full-stack AI chat product. It provides a polished,
ChatGPT-style conversational interface where authenticated users can chat with an AI assistant,
switch between specialized AI "services" (web search, image search, news search, and an extended
"thinking" mode), browse and manage their conversation history, and personalize the look of the app
with a large catalog of color themes.

The application is **purely a client**. All intelligence — model inference, retrieval, web/news/image
search, persistence of conversations, and user accounts — is provided by a separate backend service
built with **FastAPI**, **LangChain**, and **LangGraph**
(repo: [`akgaur12/AIChatApp`](https://github.com/akgaur12/AIChatApp)). The UI's job is to render that
experience well, manage client-side session state, and stream responses token-by-token.

## Objectives

1. **Deliver a premium chat UX** — fast, fluid, animated, responsive across mobile/tablet/desktop.
2. **Stream responses in real time** — show tokens as the model generates them, with the ability to
   stop generation mid-stream.
3. **Support multiple AI capabilities** — let the user pick a "service" per message (standard chat,
   web search, thinking, image search, news search).
4. **Persist and manage conversations** — list, open, rename, delete, share, copy, and download chats.
5. **Provide complete account management** — signup, login, forgot/reset password (OTP-based),
   change password, delete account.
6. **Be highly themeable** — ship 20+ professionally designed themes selectable at runtime and
   persisted across sessions.

## Feature set (as implemented)

| Area | Capability | Where it lives |
|------|-----------|----------------|
| **Auth** | Login (JSON), Signup, Forgot password (OTP), Reset password, Change password, Delete account | `src/pages/AuthPage.jsx`, `src/context/AuthContext.jsx`, `src/components/ChangePasswordModal.jsx`, `src/components/ProfileModal.jsx` |
| **Chat** | Streaming responses, optimistic UI, stop generation, regenerate | `src/pages/ChatPage.jsx`, `src/components/ChatArea.jsx`, `src/components/ChatMessage.jsx`, `src/components/ChatInput.jsx` |
| **Services** | Chat, Web search, Thinking, Image search, News search | `src/config.js`, `src/components/ChatInput.jsx`, `src/pages/ChatPage.jsx` |
| **History** | List conversations, open by URL, rename, delete one, delete all | `src/components/Sidebar.jsx`, `src/pages/ChatPage.jsx` |
| **Sharing/Export** | Copy whole chat to clipboard, download chat as `.txt` | `src/components/ShareModal.jsx`, `src/pages/ChatPage.jsx` |
| **Markdown** | GFM rendering, tables, code blocks with copy & language label, safe external links | `src/components/ChatMessage.jsx` |
| **Theming** | 20+ runtime-selectable themes persisted to `localStorage` | `src/context/ThemeContext.jsx`, `src/index.css`, `tailwind.config.js` |
| **Modals** | Profile, About, Change Password, Share | `src/components/*Modal.jsx` |

See [Chapter 12 — Feature Implementation](./12-features.md) for the detailed walkthroughs.

## Target users

- **End users**: anyone who wants a conversational AI assistant with search-augmented modes.
- **Developers** (this audience): engineers maintaining or extending the front-end.

## Scope and non-goals

**In scope (this repo):**
- The React SPA, its routing, state, styling, and the contracts it expects from the backend.

**Out of scope (this repo):**
- The AI pipelines, prompt engineering, and LangGraph orchestration (backend).
- User/data persistence, the database, and the actual auth issuance/validation (backend).
- Any server-side rendering — this is a client-rendered SPA.

## Project metadata

- **Package name:** `aichatapp-ui` (`package.json:2`)
- **Version:** `0.0.0` (the package version is a placeholder; the user-facing app version is shown as
  `v1.0.0` in the About modal — `src/components/AboutModal.jsx:39`).
- **License:** MIT (`LICENSE`).
- **Module type:** ES Modules (`"type": "module"` in `package.json:5`).
- **Developer:** Akash Gaur (per `src/components/AboutModal.jsx:50`).

## Next steps

- To understand how the pieces fit together, read [Chapter 02 — Architecture](./02-architecture.md).
- To get it running locally, jump to [Chapter 05 — Getting Started](./05-getting-started.md).
