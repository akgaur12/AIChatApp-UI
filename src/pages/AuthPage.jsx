import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { config } from '../config';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, signup } = useAuth();
    const { pathname } = location;

    const isLogin = pathname === '/login';
    const isSignup = pathname === '/signup';
    const isForgotPassword = pathname === '/forgot-password';
    const isResetPassword = pathname === '/reset-password';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();

        // Basic Validation
        if ((isLogin || isSignup) && password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }
        if (isResetPassword && newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        if (isSignup && password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        if (isResetPassword && newPassword !== confirmNewPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await login(email, password);
                navigate('/'); // Go to chat
            } else if (isSignup) {
                await signup(name, email, password);
                setSuccess('Account created! Please logging in.');
                setTimeout(() => navigate('/login'), 2000);
            } else if (isForgotPassword) {
                await client.post(config.endpoints.auth.forgotPassword, { email });
                setSuccess('OTP sent to your email.');
                // Optionally navigate to reset password page or show OTP field here
                // For this flow, let's guide them to click the link or go to reset page manually/automatically
                setTimeout(() => navigate('/reset-password'), 1500);
            } else if (isResetPassword) {
                await client.post(config.endpoints.auth.resetPassword, {
                    email,
                    otp,
                    new_password: newPassword
                });
                setSuccess('Password reset successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark bg-background text-foreground min-h-screen">
            <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

                {/* Left Side - Hero / Branding */}
                <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: 'url("auth_banner.png")' }}
                    />
                    {/* Overlay for readability */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-20 flex items-center text-lg font-medium">
                        <div className="mr-2 h-8 w-8 rounded-lg bg-primary/20 backdrop-blur flex items-center justify-center overflow-hidden">
                            <img src="logo.png" alt="AIChatApp Logo" className="h-full w-full object-cover" />
                        </div>
                        AIChatApp
                    </div>
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                Experience the future of conversation. Seamless, intelligent, and designed for you
                            </p>
                            {/* <footer className="text-sm">akgaur12</footer> */}
                        </blockquote>
                    </div>
                </div>

                {/* Right Side - Forms */}
                <div className="lg:p-8 flex items-center justify-center h-full bg-background">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">

                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {isLogin && "Welcome back"}
                                {isSignup && "Create an account"}
                                {isForgotPassword && "Reset Password"}
                                {isResetPassword && "Set new password"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isLogin && "Enter your email to sign in to your account"}
                                {isSignup && "Enter your email below to create your account"}
                                {isForgotPassword && "Enter your email to receive a reset OTP"}
                                {isResetPassword && "Enter the OTP sent to your email"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">

                                {/* Name Field (Signup only) */}
                                {isSignup && (
                                    <div className="grid gap-2">
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <input
                                                placeholder="Full Name"
                                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={isSignup}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email Field (All except Reset Password maybe, but usually needed for identification) */}
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <input
                                            placeholder="name@example.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field (Login, Signup) */}
                                {(isLogin || isSignup) && (
                                    <div className="grid gap-2">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <input
                                                placeholder="Password"
                                                type={showPassword ? "text" : "password"}
                                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Confirm Password Field (Signup only) */}
                                {isSignup && (
                                    <div className="grid gap-2">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <input
                                                placeholder="Confirm Password"
                                                type={showPassword ? "text" : "password"}
                                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required={isSignup}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* OTP Field (Reset Password only) */}
                                {isResetPassword && (
                                    <div className="grid gap-2">
                                        <div className="relative">
                                            <input
                                                placeholder="Enter OTP"
                                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* New Password Field (Reset Password only) */}
                                {isResetPassword && (
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    placeholder="New Password"
                                                    type={showPassword ? "text" : "password"}
                                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    placeholder="Confirm New Password"
                                                    type={showPassword ? "text" : "password"}
                                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={confirmNewPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="text-sm text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 p-2 rounded-md flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> {success}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={cn(
                                        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                                    )}
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLogin && "Sign In with Email"}
                                    {isSignup && "Create Account"}
                                    {isForgotPassword && "Send OTP"}
                                    {isResetPassword && "Reset Password"}
                                </button>
                            </div>
                        </form>

                        {/* Footer Links */}
                        <div className="text-center text-sm text-muted-foreground">
                            {isLogin ? (
                                <>
                                    <Link to="/forgot-password" class="underline underline-offset-4 hover:text-primary block mb-2">Forgot Password?</Link>
                                    Don't have an account?{" "}
                                    <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
                                        Sign up
                                    </Link>
                                </>
                            ) : isSignup ? (
                                <>
                                    Already have an account?{" "}
                                    <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                                        Sign in
                                    </Link>
                                </>
                            ) : (
                                <Link to="/login" className="underline underline-offset-4 hover:text-primary flex items-center justify-center gap-1">
                                    <ArrowRight className="h-3 w-3 rotate-180" /> Back to Login
                                </Link>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
