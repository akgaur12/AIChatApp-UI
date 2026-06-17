# 21 — Performance Considerations

[← Back to Index](./index.md)

This chapter describes the app's current performance characteristics, the places worth watching, and
concrete optimization opportunities — all grounded in the actual code.

## What's already good

- **Vite production build** — esbuild/Rollup minification, tree-shaking, and asset hashing out of the
  box (see [Chapter 19](./19-build-deployment.md)).
- **Streaming responses** — tokens render as they arrive (`ChatPage.handleSend`), so perceived latency
  is dominated by time-to-first-token, not full-response time.
- **Optimistic UI** — the user message and assistant placeholder appear instantly.
- **Tailwind purging** — only used utilities are emitted, keeping CSS small despite many themes (theme
  CSS variable blocks are tiny).
- **Lightweight state** — Context + local state means no heavy store overhead.

## Hotspots & how rendering behaves

### Streaming re-renders the whole message list
Each `content` frame calls `setMessages` with a new array (`ChatPage.jsx:190-197`). Because
`ChatArea` maps all messages into `ChatMessage`, **every streamed token re-renders the entire list**.

- For typical thread lengths this is fine.
- For very long threads, each token costs an O(n) render plus a Markdown re-parse of the streaming
  message.

**Mitigations:**
- Wrap `ChatMessage` in `React.memo` keyed on `message.id` + `content` so completed messages don't
  re-render while a new one streams.
- Consider batching tokens (e.g. flush every animation frame) instead of per-frame `setState`.
- For huge histories, virtualize the list (e.g. `react-virtuoso`).

### Markdown parsing cost
`react-markdown` + `remark-gfm` + `rehype-raw` re-parses the streaming message's content on every
update. Memoizing non-streaming messages (above) removes most of this cost.

### Auto-scroll
`ChatArea` sets `scrollTop = scrollHeight` on every `messages`/`isStreaming` change
(`ChatArea.jsx:8-12`). Cheap, but it **forces scroll-to-bottom unconditionally** — a user scrolling up
mid-stream gets yanked down. Consider only auto-scrolling when already near the bottom.

### Textarea auto-resize
`ChatInput` recomputes height on every keystroke and on toggle changes (`ChatInput.jsx:24-29`). Reads
`scrollHeight` (a layout read). Negligible for normal typing.

## Network efficiency

- **No request caching/dedup.** Opening a chat always refetches it; the conversation list is refetched
  after every send/delete/rename. This is simple but chatty.
  - **Opportunity:** add React Query (cache + background refresh + dedupe) or a small in-memory cache
    keyed by conversation id.
- **List refresh after each send** (`fetchConversations()` on stream end) is an extra round trip used
  to update titles/order — acceptable, but could be replaced by reading the `metadata` event.

## Asset & bundle considerations

- Icons come from `lucide-react`, imported **per-icon**, so tree-shaking keeps only what's used —
  good.
- `framer-motion` is a relatively large dependency but is only imported on the auth screen. If bundle
  size matters, consider code-splitting the auth route (`React.lazy`) so motion isn't in the main chat
  chunk.
- Images in `public/` are PNGs; ensure logos/banner are appropriately sized/compressed for the web.

## Memory & lifecycle

- The `AbortController` ref is reset to `null` in the `finally` of `handleSend` — no leak.
- Document-level click listeners in `Sidebar`/`ChatInput` are added and **removed** in effect cleanups —
  no listener leak.
- StrictMode double-invokes effects **in dev only**; it does not affect production performance.

## Optimization opportunities (prioritized)

| Priority | Optimization | Benefit |
|----------|--------------|---------|
| High | `React.memo` on `ChatMessage` (skip re-render of settled messages) | Big win on long threads during streaming |
| High | Conditional auto-scroll (only when near bottom) | UX correctness + fewer forced reflows |
| Medium | Token batching (rAF flush) for `setMessages` | Fewer renders/parses under fast streams |
| Medium | React Query / cache for conversations + messages | Fewer network round trips, snappier navigation |
| Medium | Code-split auth route (lazy `framer-motion`) | Smaller initial chat bundle |
| Low | List virtualization | Only for extremely long histories |
| Low | Image optimization in `public/` | Faster first paint |

## Measuring

- Use the browser **Performance** and **React DevTools Profiler** to confirm re-render counts during
  streaming before/after `React.memo`.
- Use `npm run build` + a bundle visualizer (e.g. `rollup-plugin-visualizer`) to inspect chunk sizes.

## Related chapters

- [Chapter 10 — API Integration](./10-api-integration.md)
- [Chapter 15 — Design Patterns](./15-design-patterns.md)
- [Chapter 19 — Build & Deployment](./19-build-deployment.md)
