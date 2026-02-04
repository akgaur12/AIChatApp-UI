import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User as UserIcon, LogOut, KeyRound, Trash2, AlertTriangle, Check } from 'lucide-react';
import { cn } from '../lib/utils';

// Using a custom modal structure similar to ChangePasswordModal if UI components aren't available
export default function ProfileModal({ isOpen, onClose, onPasswordChange }) {
    const { user, logout, deleteAccount } = useAuth();
    const [deleteStep, setDeleteStep] = React.useState(0); // 0: initial, 1: first confirm, 2: final confirm
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [error, setError] = React.useState("");

    // Reset state when modal opens or closes
    React.useEffect(() => {
        if (!isOpen) {
            setDeleteStep(0);
            setIsDeleting(false);
            setIsSuccess(false);
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDeleteAccount = async () => {
        if (deleteStep < 2) {
            setDeleteStep(deleteStep + 1);
            return;
        }

        setIsDeleting(true);
        setError("");
        try {
            await deleteAccount();
            setIsSuccess(true);
            setTimeout(() => {
                logout();
                onClose();
            }, 3000);
        } catch (err) {
            setError("Failed to delete account. Please try again.");
            setIsDeleting(false);
            setDeleteStep(0);
        }
    };

    const resetDelete = () => {
        setDeleteStep(0);
        setError("");
    };

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
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Check className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-semibold text-foreground">Account Deleted</h4>
                                <p className="text-sm text-muted-foreground">
                                    Account and all associated data deleted successfully.<br />
                                    Redirecting to login...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                {deleteStep === 0 ? (
                                    <>
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
                                            className="flex items-center justify-center w-full rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log Out
                                        </button>

                                        <button
                                            onClick={() => setDeleteStep(1)}
                                            className="flex items-center justify-center w-full rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground px-4 py-2 text-sm font-medium shadow-sm transition-all border border-destructive/20"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Account
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="space-y-2">
                                            <h5 className="font-semibold text-destructive flex items-center gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                {deleteStep === 1 ? "Delete Account?" : "Final Confirmation"}
                                            </h5>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {deleteStep === 1
                                                    ? (
                                                        <span className="flex items-start gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                                            <span className="text-foreground">Are you sure you want to delete your account? All your chats and conversation data will be permanently deleted.</span>
                                                        </span>
                                                    )
                                                    : (
                                                        <span className="flex items-start gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                                            <span className="text-foreground">This action is irreversible. All your data will be gone forever. Are you absolutely certain?</span>
                                                        </span>
                                                    )}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={resetDelete}
                                                disabled={isDeleting}
                                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={isDeleting}
                                                className={cn(
                                                    "flex-1 rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-all",
                                                    deleteStep === 1
                                                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        : "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                                                )}
                                            >
                                                {isDeleting ? "Deleting..." : deleteStep === 1 ? "Yes, Delete" : "Confirm Delete"}
                                            </button>
                                        </div>
                                        {error && <p className="text-[10px] text-red-500 text-center mt-2">{error}</p>}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
