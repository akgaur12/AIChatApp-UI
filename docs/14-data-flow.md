# 14 — Data Flow & Sequence Diagrams

[← Back to Index](./index.md)

This chapter visualizes the most important end-to-end flows. For wire-level detail see
[Chapter 10](./10-api-integration.md); for auth specifics see [Chapter 08](./08-authentication.md).

## App bootstrap & session restore

```mermaid
sequenceDiagram
    participant HTML as index.html
    participant Main as main.jsx
    participant App as App.jsx
    participant TP as ThemeProvider
    participant AP as AuthProvider
    participant R as Router

    HTML->>Main: load module, #root
    Main->>App: render <App/> in StrictMode
    App->>TP: mount (read theme from localStorage, set <html> class)
    TP->>AP: mount
    AP->>AP: register logout handler with API client
    AP->>AP: read localStorage['token']
    alt token valid
        AP->>AP: setUser(decoded claims)
    else expired / none
        AP->>AP: logout() / leave user=null
    end
    AP->>R: render routes (loading=false)
    R->>R: '/' → '/chat' → ProtectedRoute
```

## Login → chat

```mermaid
sequenceDiagram
    actor U as User
    participant Auth as AuthPage
    participant Ctx as AuthContext
    participant Cl as Axios client
    participant API as Backend

    U->>Auth: enter email/password, submit
    Auth->>Ctx: login(email, password)
    Ctx->>Cl: POST /auth/login-json
    Cl->>API: + Content-Type json
    API-->>Cl: 200 { access_token }
    Cl-->>Ctx: response
    Ctx->>Ctx: localStorage['token']=access_token; setUser(decode)
    Ctx-->>Auth: ok
    Auth->>Auth: navigate('/')
    Note over U,API: ProtectedRoute now passes → ChatPage renders
```

## Opening an existing conversation

```mermaid
sequenceDiagram
    actor U as User
    participant SB as Sidebar
    participant CP as ChatPage
    participant API as Backend

    U->>SB: click conversation
    SB->>CP: onSelectChat(id)
    CP->>CP: navigate('/chat/'+id)
    Note over CP: useParams() id changes → effect fires
    CP->>API: GET /chat/conversations/{id}
    API-->>CP: { messages: [ {id,user,assistant,created_at} ] }
    CP->>CP: flatten turns → messages[]
    CP->>CP: render ChatArea (auto-scroll to bottom)
```

## Sending a message (streaming) — full picture

```mermaid
sequenceDiagram
    actor U as User
    participant CI as ChatInput
    participant CP as ChatPage
    participant API as Backend (SSE)
    participant CA as ChatArea/ChatMessage

    U->>CI: type + Enter
    CI->>CP: onSend(text, {service toggles})
    CP->>CA: optimistic: user msg + empty assistant (isStreaming)
    CP->>CP: new AbortController
    CP->>API: POST /chat/run_pipeline/stream {user_query, service_name, conversation_id}
    activate API
    loop streamed frames
        API-->>CP: data: {type:"content", content:"..."}
        CP->>CA: append token → live render
        API-->>CP: data: {type:"metadata", conversation_id}
        CP->>CP: capture newConvId (if new chat)
    end
    deactivate API
    alt new conversation
        CP->>CP: navigate('/chat/'+newConvId, replace)
    end
    CP->>API: GET /chat/conversations (refresh sidebar)
    CP->>CA: placeholder.isStreaming=false
```

### With Stop pressed

```mermaid
sequenceDiagram
    actor U as User
    participant CP as ChatPage
    participant API as Backend
    U->>CP: click Stop
    CP->>CP: abortController.abort()
    API--xCP: fetch rejects with AbortError
    CP->>CP: catch → recognize AbortError → stop silently
    CP->>CP: finally: isLoading=false, isStreaming=false
```

## Token expiry / 401 (Axios calls)

```mermaid
sequenceDiagram
    participant Cmp as Any component
    participant Cl as Axios client
    participant API as Backend
    participant Ctx as AuthContext

    Cmp->>Cl: GET /chat/conversations
    Cl->>API: + Bearer token (expired)
    API-->>Cl: 401
    Cl->>Cl: response interceptor: remove token
    Cl->>Ctx: onLogout() (registered handler)
    Ctx->>Ctx: user=null
    Note over Cmp,Ctx: ProtectedRoute redirects → /login
```

> Reminder: this auto-logout applies to **Axios** calls. The streaming `fetch` does not route through
> the interceptor (see [Chapter 16](./16-error-handling.md)).

## Theme change

```mermaid
sequenceDiagram
    actor U as User
    participant SB as Sidebar (theme menu)
    participant TC as ThemeContext
    participant DOM as <html>
    U->>SB: pick "Midnight Green"
    SB->>TC: setTheme('midnight-green')
    TC->>TC: localStorage['vite-ui-theme']='midnight-green'
    TC->>DOM: remove all theme classes, add 'midnight-green'
    Note over DOM: CSS variables change → whole UI recolors
```

## State ownership summary

```mermaid
graph TD
    LS["localStorage<br/>token, vite-ui-theme"] --> Ctx["Contexts"]
    Ctx --> CP["ChatPage (page state)"]
    Backend["Backend (durable data)"] --> CP
    CP --> Children["Sidebar / ChatArea / ChatInput"]
```

## Related chapters

- [Chapter 10 — API Integration](./10-api-integration.md)
- [Chapter 16 — Error Handling & Logging](./16-error-handling.md)
