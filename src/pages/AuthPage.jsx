import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { config } from '../config';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Mail, Lock, User, ArrowRight, CheckCircle2,
    Eye, EyeOff, Sparkles, Zap, Shield, ChevronRight
} from 'lucide-react';

const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                x: [0, 100, 0],
                y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-slate-500/10 blur-[120px]"
        />
        <motion.div
            animate={{
                scale: [1, 1.3, 1],
                x: [0, -100, 0],
                y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-zinc-500/10 blur-[120px]"
        />
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, -100, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-stone-500/10 blur-[120px]"
        />
    </div>
);

const FloatingInput = ({ label, icon: Icon, type = "text", value, onChange, required, showPasswordToggle, showPassword, setShowPassword, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative group">
            <input
                {...props}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                    "peer flex h-12 w-full rounded-xl border border-input bg-zinc-800/40 backdrop-blur-sm px-10 py-2 text-sm ring-offset-background transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
                    "placeholder:text-transparent"
                )}
                placeholder=" "
                required={required}
            />
            <div className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none",
                (isFocused || value) ? "text-primary" : "text-muted-foreground"
            )}>
                {Icon && <Icon className="h-4 w-4" />}
            </div>
            <label className={cn(
                "absolute left-10 transition-all duration-200 pointer-events-none px-1 rounded-sm",
                "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                "peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:translate-y-0 peer-focus:bg-[#2b2b2b]",
                "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:bg-[#2b2b2b]",
                "peer-autofill:-top-2 peer-autofill:text-xs peer-autofill:text-primary peer-autofill:translate-y-0 peer-autofill:bg-[#2b2b2b]",
                (value) && "-top-2 text-xs text-primary translate-y-0 bg-[#2b2b2b]"
            )}>
                {label}
            </label>
            {showPasswordToggle && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            )}
        </div>
    );
};

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
        <div className="dark bg-background text-foreground min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />

            {/* Top Left Brand Logo */}
            <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
                <motion.div
                    initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    className="h-10 w-10 rounded-xl bg-slate-800/50 backdrop-blur-md border border-white/10 flex items-center justify-center p-2"
                >
                    <img src="logo.png" alt="Logo" className="h-6 w-6" />
                </motion.div>
                <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
                    AIChatApp
                </span>
            </div>

            <div className="container relative z-10 max-w-[530px] bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                {/* Centered Form Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center relative">
                    <div className="mx-auto w-full max-w-[380px] space-y-8">

                        <div className="flex flex-col space-y-2 text-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={pathname}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {isLogin && "Welcome back"}
                                        {isSignup && "Create account"}
                                        {isForgotPassword && "Reset access"}
                                        {isResetPassword && "New password"}
                                    </h1>
                                    <p className="text-muted-foreground mt-2">
                                        {isLogin && "Enter details to access your account"}
                                        {isSignup && "Start your journey with us today"}
                                        {isForgotPassword && "We'll send an OTP to your email"}
                                        {isResetPassword && "Secure your account with a new password"}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Tab Switcher (Login/Signup Only) */}
                        {(isLogin || isSignup) && (
                            <div className="flex p-1 bg-muted/50 rounded-xl border border-white/5">
                                <button
                                    onClick={() => navigate('/login')}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                        isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                        isSignup ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={pathname}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    {isSignup && (
                                        <FloatingInput
                                            label="Full Name"
                                            icon={User}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    )}

                                    <FloatingInput
                                        label="Email Address"
                                        icon={Mail}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />

                                    {(isLogin || isSignup) && (
                                        <FloatingInput
                                            label="Password"
                                            icon={Lock}
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            showPasswordToggle
                                            showPassword={showPassword}
                                            setShowPassword={setShowPassword}
                                        />
                                    )}

                                    {isSignup && (
                                        <FloatingInput
                                            label="Confirm Password"
                                            icon={Lock}
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    )}

                                    {/* Password Strength Indicator (Signup) */}
                                    {isSignup && password && (
                                        <div className="grid grid-cols-4 gap-2 px-1">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-1 rounded-full bg-muted transition-colors",
                                                        password.length > i * 2 + 2 && (
                                                            password.length < 6 ? "bg-red-500" :
                                                                password.length < 9 ? "bg-yellow-500" : "bg-green-500"
                                                        )
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {isResetPassword && (
                                        <>
                                            <FloatingInput
                                                label="Enter OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                            />
                                            <FloatingInput
                                                label="New Password"
                                                icon={Lock}
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                showPasswordToggle
                                                showPassword={showPassword}
                                                setShowPassword={setShowPassword}
                                            />
                                            <FloatingInput
                                                label="Confirm New Password"
                                                icon={Lock}
                                                type={showPassword ? "text" : "password"}
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                required
                                            />
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl flex items-center gap-2 border border-destructive/20"
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                    {error}
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-sm text-green-500 bg-green-500/10 p-3 rounded-xl flex items-center gap-2 border border-green-500/20"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> {success}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    "relative h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 overflow-hidden group",
                                    !isLoading && "hover:shadow-primary/40 hover:-translate-y-0.5"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                <span className="flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin && "Sign In Account"}
                                            {isSignup && "Create Account"}
                                            {isForgotPassword && "Send OTP Code"}
                                            {isResetPassword && "Set New Password"}
                                            {!isLoading && <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="text-center pt-4">
                            {isLogin && (
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                                >
                                    Forgot Password?
                                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Link>
                            )}

                            {!isLogin && !isSignup && (
                                <Link
                                    to="/login"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowRight className="h-3 w-3 rotate-180" /> Back to Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Footer */}
            <div className="absolute bottom-8 left-0 right-0 lg:hidden text-center z-10">
                <p className="text-xs text-muted-foreground/60">
                    &copy; 2026 AIChatApp. All rights reserved.
                </p>
            </div>
        </div >
    );
}

