
export const config = {
    API_BASE_URL: "http://0.0.0.0:45001",

    services: {
        available: ["chat", "web_search"],
        default: "chat"
    },

    endpoints: {
        auth: {
            login: "/auth/login-json",
            signup: "/auth/signup",
            forgotPassword: "/auth/forget-password",
            resetPassword: "/auth/verify-otp-reset-password",
            changePassword: "/auth/reset-password",
            // Add other auth routes if needed
        },
        chat: {
            base: "/chat",
            stream: "/chat/run_pipeline/stream",
            conversations: "/chat/conversations",
            // Helper for dynamic routes
            conversation: (id) => `/chat/conversations/${id}`,
            rename_conversation: (id) => `/chat/conversations/${id}/rename`,
            delete_conversation: (id) => `/chat/conversations/${id}/delete`,
        }
    }
};
