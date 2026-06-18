# Architecture Diagrams

This directory contains all architecture and flow diagrams for AIChatApp-UI.

## Structure

```
docs/diagrams/
  src/          — editable Mermaid source files (*.mmd)
  *.png         — rendered PNGs (2x scale, white background)
  README.md     — this file
```

## Regenerating PNGs

Requires [mermaid-cli](https://github.com/mermaid-js/mermaid-cli):

```bash
npm i -g @mermaid-js/mermaid-cli
```

Then from the repo root:

```bash
cd docs/diagrams
for f in src/*.mmd; do
  base=$(basename "$f" .mmd)
  mmdc -i "$f" -o "${base}.png" -b white -s 2 -p .puppeteer.json
done
```

The `.puppeteer.json` config (needed for headless/root environments) should contain:

```json
{ "args": ["--no-sandbox", "--disable-setuid-sandbox"] }
```

## Diagrams

| File | Description |
|------|-------------|
| `src/01-system-architecture.mmd` | Full system — browser, backend, external services |
| `src/02-component-tree.mmd` | React component hierarchy |
| `src/03-auth-flow.mmd` | Auth sequence — login, signup, token lifecycle |
| `src/04-chat-streaming-flow.mmd` | SSE chat sequence — send, stream, stop, regenerate |
| `src/05-state-management.mmd` | Context stores and local state layout |
| `src/06-routing-navigation.mmd` | Route graph — guards, redirects, navigation |
| `src/07-data-model.mmd` | ER diagram — conversations, turns, messages, JWT |
| `src/08-theme-system.mmd` | Theme pipeline — context to CSS variables to Tailwind |

See [../architecture-diagrams.md](../architecture-diagrams.md) for the full documented version with embedded PNGs.
