# AIChatApp UI — Technical Documentation

> A complete, developer-oriented reference for the **AIChatApp** front-end: a modern, responsive,
> theme-rich AI chat interface built with React 18, Vite, and Tailwind CSS, talking to a FastAPI +
> LangChain/LangGraph backend over REST and Server-Sent Events (SSE).

This documentation book is intended to take a developer with **no prior knowledge** of the project
from zero to productive, and to serve as a **long-term reference** for the team that maintains and
extends it.

---

## How to read this book

If you are **new**, read the chapters in order — they build on each other. If you are **experienced**
and looking for a specific answer, jump straight to the relevant chapter using the index below.

Every chapter is grounded in the **actual implementation**. Code references use the
`path:line` convention (e.g. `src/pages/ChatPage.jsx:124`) so you can click straight to the source.

---

## Table of contents

| # | Chapter | What you'll find |
|---|---------|------------------|
| 01 | [Project Overview](./01-project-overview.md) | What the app is, objectives, feature set, scope and non-goals |
| 02 | [High-Level Architecture](./02-architecture.md) | The big picture, client/server split, layered architecture, component tree |
| 03 | [Technology Stack & Dependencies](./03-tech-stack.md) | Every dependency, why it's here, version notes |
| 04 | [Directory & File Structure](./04-directory-structure.md) | Where everything lives and why |
| 05 | [Getting Started](./05-getting-started.md) | Install, configure, run, build, preview |
| 06 | [Configuration & Environment](./06-configuration.md) | `config.js`, Vite, PostCSS, Tailwind, env handling |
| 07 | [Routing & Navigation](./07-routing.md) | React Router setup, public vs. protected routes |
| 08 | [Authentication & Authorization](./08-authentication.md) | JWT flow, login/signup/reset, token lifecycle, guards |
| 09 | [State Management](./09-state-management.md) | The Context API approach: Auth & Theme providers |
| 10 | [API Integration & Contracts](./10-api-integration.md) | Axios client, endpoints, request/response shapes, SSE streaming |
| 11 | [Core Components](./11-components.md) | Every component, its props, responsibilities, and interactions |
| 12 | [Feature Implementation](./12-features.md) | Feature-by-feature walkthroughs (chat, services, history, sharing) |
| 13 | [Theming & Styling](./13-theming-styling.md) | The 20+ theme system, CSS variables, Tailwind variants |
| 14 | [Data Flow & Sequence Diagrams](./14-data-flow.md) | End-to-end flows with diagrams |
| 15 | [Design Patterns & Decisions](./15-design-patterns.md) | Architectural decisions and the reasoning behind them |
| 16 | [Error Handling & Logging](./16-error-handling.md) | How errors propagate, where they're caught, logging conventions |
| 17 | [Security Considerations](./17-security.md) | Token storage, transport, XSS surface, known trade-offs |
| 18 | [Testing Strategy](./18-testing.md) | Current state, recommended approach, what to test |
| 19 | [Build, Deployment & CI/CD](./19-build-deployment.md) | Production build, hosting, serving, CI/CD guidance |
| 20 | [Development Workflow & Coding Standards](./20-workflow-standards.md) | Conventions, ESLint, contribution flow |
| 21 | [Performance Considerations](./21-performance.md) | Current characteristics, bottlenecks, optimization opportunities |
| 22 | [Troubleshooting Guide](./22-troubleshooting.md) | Common problems and fixes |
| 23 | [Glossary](./23-glossary.md) | Key terms and concepts |

---

## At a glance

- **Type:** Single-Page Application (SPA), front-end only. The backend lives in a separate repository
  ([AIChatApp](https://github.com/akgaur12/AIChatApp)).
- **Language:** JavaScript (JSX), ES Modules. No TypeScript (type stubs are present as devDependencies only).
- **Build tool:** Vite 5.
- **Styling:** Tailwind CSS 3 with a CSS-variable-driven multi-theme system and the Typography plugin.
- **State:** React Context API (no Redux/Zustand). Two providers: `AuthProvider` and `ThemeProvider`.
- **Transport:** Axios for standard REST calls; the native `fetch` + `ReadableStream` for SSE token streaming.
- **Auth:** JWT bearer tokens stored in `localStorage`, decoded client-side.

> **Source-of-truth note:** This documentation describes the front-end repository only. API endpoint
> *shapes* are documented as the UI consumes them (see [Chapter 10](./10-api-integration.md)); the
> authoritative backend contract lives in the backend repository.
