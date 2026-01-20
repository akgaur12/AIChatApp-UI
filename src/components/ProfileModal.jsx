import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User as UserIcon, LogOut, KeyRound } from 'lucide-react';
import { cn } from '../lib/utils';

// Using a custom modal structure similar to ChangePasswordModal if UI components aren't available
export default function ProfileModal({ isOpen, onClose, onPasswordChange }) {
    const { user, logout } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div
                className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col space-y-1.5 p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold leading-none tracking-tight text-xl">User Profile</h3>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-accent focus:outline-none"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 pt-0 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-background ring-2 ring-primary/20">
                            {user?.name?.[0]?.toUpperCase() ? (
                                <span className="text-4xl font-bold text-primary">{user.name[0].toUpperCase()}</span>
                            ) : (
                                <UserIcon className="h-12 w-12 text-primary" />
                            )}
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-semibold mb-1">{user?.name || 'User'}</h4>
                            <p className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{user?.email}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid gap-3">
                        <button
                            onClick={() => {
                                onPasswordChange();
                            }}
                            className="flex items-center justify-center w-full rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Change Password
                        </button>

                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="flex items-center justify-center w-full rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 text-sm font-medium shadow-sm transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
