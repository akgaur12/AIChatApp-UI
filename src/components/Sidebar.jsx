import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import {
    MessageSquare,
    Plus,
    LogOut,
    Moon,
    Sun,
    Trash2,
    Pencil,
    User as UserIconLucide,
    Check,
    X,
    Settings,
    KeyRound,
    MoreVertical
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import ProfileModal from './ProfileModal';

export default function Sidebar({
    conversations,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onRenameChat,
    isOpen,
    setIsOpen
}) {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const inputRef = useRef(null);

    // Menu State
    const [menuOpen, setMenuOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const startEditing = (e, chat) => {
        e.stopPropagation();
        setEditingId(chat.id);
        setEditTitle(chat.title || "");
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingId(null);
        setEditTitle("");
    };

    const submitRename = (e) => {
        if (e) e.stopPropagation();
        if (editingId && editTitle.trim()) {
            onRenameChat(editingId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submitRename(e);
        } else if (e.key === 'Escape') {
            cancelEditing(e);
        }
    };

    return (
        <>
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
                    isOpen ? "block" : "hidden"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 border-r bg-muted/40 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 lg:flex lg:flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>

                {/* Header */}
                <div className="p-4 border-b space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
                            <img src="logo.png" alt="Logo" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight">AIChatApp</span>
                    </div>

                    <button
                        onClick={onNewChat}
                        className="flex h-10 w-full items-center justify-start gap-2 rounded-md border bg-background px-4 hover:bg-accent transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">New chat</span>
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                    <div className="space-y-1">
                        {conversations.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-10">
                                No conversations yet.
                            </div>
                        ) : (
                            conversations.map((chat) => (
                                <div
                                    key={chat.id}
                                    className="group relative"
                                >
                                    {editingId === chat.id ? (
                                        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-background border ring-1 ring-primary/20">
                                            <input
                                                ref={inputRef}
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onBlur={submitRename}
                                                className="flex-1 bg-transparent text-sm outline-none w-full min-w-0"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    onSelectChat(chat.id);
                                                    setIsOpen(false);
                                                }}
                                                className={cn(
                                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors pr-16",
                                                    currentChatId === chat.id
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                                )}
                                            >
                                                <MessageSquare className="h-4 w-4 shrink-0" />
                                                <span className="truncate text-left flex-1" title={chat.title}>
                                                    {chat.title || "New Chat"}
                                                </span>
                                            </button>

                                            {/* Actions */}
                                            <div className="absolute right-1 top-1.5 hidden group-hover:flex bg-gradient-to-l from-muted/40 via-muted/40 to-transparent pl-2 items-center gap-1">
                                                <button
                                                    onClick={(e) => startEditing(e, chat)}
                                                    className="p-1 rounded-md hover:bg-primary/20 hover:text-primary text-muted-foreground/50 transition-colors"
                                                    title="Rename Chat"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteChat(chat.id);
                                                    }}
                                                    className="p-1 rounded-md hover:bg-destructive hover:text-destructive-foreground text-muted-foreground/50 transition-colors"
                                                    title="Delete Chat"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className="border-t p-4 bg-background/50">
                    <div className="flex items-center justify-between relative">
                        {/* User Menu Trigger */}
                        <div
                            className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-1"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                {/*  */}
                                {user?.name?.[0]?.toUpperCase()
                                    ? <span className="text-xs font-bold text-primary">{user.name[0].toUpperCase()}</span>
                                    : <UserIconLucide className="h-5 w-5 text-primary" />
                                }
                            </div>
                            <div className="flex flex-col truncate min-w-0">
                                <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
                                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground ml-2 shrink-0"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {/* User Menu Dropdown */}
                        {menuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute bottom-full left-0 mb-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in zoom-in-95"
                            >
                                <div className="p-2 space-y-1">
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                        My Account
                                    </div>
                                    <button
                                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                        onClick={() => { setMenuOpen(false); setShowProfileModal(true); }}
                                    >
                                        <UserIconLucide className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </button>
                                    <button
                                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                        onClick={() => { setMenuOpen(false); setShowPasswordModal(true); }}
                                    >
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        <span>Change Password</span>
                                    </button>
                                    <div className="h-px bg-muted my-1" />
                                    <button
                                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer text-destructive"
                                        onClick={() => { setMenuOpen(false); logout(); }}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onPasswordChange={() => {
                    setShowProfileModal(false);
                    setShowPasswordModal(true);
                }}
            />
        </>
    );
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}
