# 17 — Security Considerations

[← Back to Index](./index.md)

This chapter is an honest assessment of the front-end's security posture: what's protected, what the
trade-offs are, and concrete hardening recommendations. Front-end security is **defense alongside**,
never instead of, server-side enforcement.

## Authentication & token handling

### Token storage: `localStorage`
The JWT is stored in `localStorage` under the key `token` (`AuthContext`, `api/client.js`).

- **Implication:** any JavaScript running on the page can read it. If an XSS vulnerability exists, the
  token is exfiltratable. `localStorage` is also not cleared when the tab closes.
- **Trade-off chosen:** simplicity and persistence across reloads.
- **Alternatives:** an `HttpOnly`, `Secure`, `SameSite` cookie (not readable by JS) issued by the
  backend would mitigate XSS token theft, at the cost of CSRF considerations and backend changes.

### Client-side JWT decoding
`lib/jwt.js` decodes the payload **without verifying the signature** (`parseJwt`). This is fine and
intentional — it's only used to read display claims and `exp`. **Never trust client-side decode for
authorization**; the backend must verify the signature on every request.

### Expiry handling
- On app start, an expired token triggers `logout()` (`AuthContext`).
- `401` responses from **Axios** calls clear the token and log the user out.
- **Gap:** the streaming `fetch` path does not auto-logout on 401 (see
  [Chapter 16](./16-error-handling.md)).

## Transport security

- The default `API_BASE_URL` is **`http://0.0.0.0:45001`** (plaintext HTTP). For any non-local
  deployment this **must** be an `https://` endpoint — otherwise tokens and credentials travel in
  cleartext.
- A code comment in `AuthContext.login` correctly notes that request payloads (including passwords)
  are visible in DevTools for the user's own requests and that confidentiality in transit relies on
  HTTPS (`AuthContext.jsx:52-54`).

## XSS surface

The chat renders **model output as Markdown** with `rehype-raw` enabled, which **allows raw HTML** in
the Markdown to be parsed and rendered (`ChatMessage.jsx:120`).

- **Risk:** `rehype-raw` does **not** sanitize. If the backend ever relays untrusted/unsanitized HTML
  (e.g. from web-search results) into assistant content, it could render active markup.
- **Current mitigations:** links are forced to `target="_blank" rel="noopener noreferrer"`
  (`ChatMessage.jsx:156-165`), preventing reverse-tabnabbing.
- **Recommendation:** add `rehype-sanitize` after `rehype-raw`, or drop `rehype-raw` if raw HTML isn't
  required, to neutralize script/dangerous tags. This is the single highest-value front-end hardening.

## Input validation

- Client-side checks exist (password length ≥ 6, confirmation match) but are **UX aids only**. All
  validation must be re-enforced server-side.

## Clipboard & downloads

- `navigator.clipboard.writeText` and blob downloads operate on the user's own conversation content —
  low risk. Downloads are plain `.txt`.

## CORS & headers

- CORS is enforced by the **backend**; the SPA simply makes cross-origin requests to `API_BASE_URL`.
- No CSP (Content-Security-Policy) is set by the SPA itself (it's static; CSP would be configured at
  the hosting/CDN layer). Adding a strict CSP at the web server is recommended, especially given the
  raw-HTML rendering note above.

## Secrets

- **No secrets are committed.** There is no API key or credential in the front-end source. The backend
  holds all secrets. `.env*` files are git-ignored.

## Dependency security

- Dependencies use caret ranges with a committed lockfile. Run `npm audit` periodically and keep
  `react-markdown`/`rehype`/`remark` current (these process untrusted content).

## Authorization

- The only client-side gate is "valid non-expired token present" (`ProtectedRoute`). **Every
  privileged action is authorized server-side.** The UI sends `role: ["ROLE_USER"]` at signup but
  performs no role-based UI gating.

## Security checklist for deployment

- [ ] Set `API_BASE_URL` to an **HTTPS** endpoint.
- [ ] Add `rehype-sanitize` (or remove `rehype-raw`) to the Markdown pipeline.
- [ ] Configure a strict **CSP** at the web server/CDN.
- [ ] Consider moving the token to an `HttpOnly` cookie (backend coordination).
- [ ] Handle `401` in the streaming path for consistent session expiry.
- [ ] Run `npm audit` in CI; pin/update content-processing deps.
- [ ] Ensure backend re-validates all inputs and verifies JWT signatures.

## Related chapters

- [Chapter 08 — Authentication](./08-authentication.md)
- [Chapter 16 — Error Handling](./16-error-handling.md)
- [Chapter 19 — Build, Deployment & CI/CD](./19-build-deployment.md)
