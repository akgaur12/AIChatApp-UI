import React, { createContext, useContext, useState, useEffect } from 'react';
import client, { setLogoutHandler } from '../api/client';
import { config } from '../config';
import { parseJwt, isTokenExpired } from '../lib/jwt';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const setUserFromToken = (token) => {
        if (!token) {
            setUser(null);
            return;
        }
        const decoded = parseJwt(token);
        if (decoded) {
            // Map common JWT claims to our user object
            setUser({
                email: decoded.sub || decoded.email,
                name: decoded.name || decoded.preferred_username || decoded.nickname || 'User',
                // Add other fields if available in your token
            });
        } else {
            // Fallback if decoding fails but we have a token (shouldn't happen often)
            setUser({ email: "user@example.com", name: "User" });
        }
    };

    useEffect(() => {
        // Register logout handler with API client
        setLogoutHandler(logout);

        // Check if token exists and is valid
        const token = localStorage.getItem('token');
        if (token) {
            if (isTokenExpired(token)) {
                logout();
            } else {
                setUserFromToken(token);
            }
        }
        setLoading(false);

        // Clean up handler on unmount (though AuthProvider usually persists)
        return () => setLogoutHandler(null);
    }, []);

    const login = async (email, password) => {
        try {
            // Note: Sending sensitive data in the request body is standard. 
            // In DevTools (Network tab), you will see the payload of your own request.
            // Security is handled by HTTPS, which encrypts this data in transit.
            const response = await client.post(config.endpoints.auth.login, { email, password });
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            setUserFromToken(access_token);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const signup = async (name, email, password, role = "ROLE_USER") => {
        // Just a pass-through to API
        await client.post(config.endpoints.auth.signup, { name, email, password, role: [role] });
    };

    const deleteAccount = async () => {
        try {
            await client.delete(config.endpoints.auth.deleteAccount);
            return true;
        } catch (error) {
            console.error("Delete account failed:", error);
            throw error;
        }
    };

    // Provide other auth methods like forgot password wrapper if needed, 
    // but they can also be direct API calls in the components.

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, deleteAccount, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
