import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    MoreHorizontal,
    Share2,
    PanelLeft,
    PanelRight,
    Info
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import ProfileModal from './ProfileModal';
import AboutModal from './AboutModal';
import ShareModal from './ShareModal';

export default function Sidebar({
    conversations,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onDeleteAllConversations,
    onRenameChat,
    onCopyChat,
    onDownloadChat,
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
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState(null);
    const menuRef = useRef(null);

    // Share Menu State
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedShareChat, setSelectedShareChat] = useState(null);

    // Profile Menu State
    const [profileMenuPosition, setProfileMenuPosition] = useState(null);
    const profileTriggerRef = useRef(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target) && profileTriggerRef.current && !profileTriggerRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            // Close chat action menu on global click
            // We rely on stopPropagation on the trigger button to prevent this from firing immediately on toggle
            setActiveMenuId(null);
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
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
                "fixed inset-y-0 left-0 z-50 h-full border-r bg-muted/95 backdrop-blur-xl transition-[width,transform] duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full overflow-hidden",
                isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:w-20"
            )}>
                <div className={cn("h-full flex flex-col transition-all duration-300", isOpen ? "w-72" : "w-20")}>

                    {/* Header */}
                    <div className={cn("p-4 border-b space-y-4 flex flex-col items-center gap-2", isOpen ? "items-stretch" : "items-center px-2")}>

                        {/* Logo Row */}
                        <div className={cn("flex items-center w-full", isOpen ? "justify-between" : "justify-center flex-col gap-4")}>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                    <img src="logo.png" alt="Logo" className="h-full w-full object-cover" />
                                </div>
                                <span className={cn("font-semibold text-lg tracking-tight transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0 hidden")}>
                                    AIChatApp
                                </span>
                            </div>

                            {/* Sidebar Toggle Button (Moved Here) */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={cn(
                                    "p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground hidden lg:flex transition-colors",
                                    !isOpen && "mt-2" // Add margin when collapsed/stacked
                                )}
                                title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                            >
                                {isOpen ? <PanelLeft className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                            </button>
                        </div>

                        <button
                            onClick={onNewChat}
                            className={cn(
                                "flex h-10 items-center gap-2 rounded-md border bg-background hover:bg-accent transition-colors",
                                isOpen ? "w-full justify-start px-4" : "w-10 justify-center px-0 border-0 bg-transparent hover:bg-accent"
                            )}
                            title="New chat"
                        >
                            <Plus className="h-4 w-4" />
                            <span className={cn("text-sm font-medium transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0 hidden")}>
                                New chat
                            </span>
                        </button>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                        <div className={cn("space-y-1", !isOpen && "hidden")}>
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
                                                        if (window.innerWidth < 1024) {
                                                            setIsOpen(false);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors pr-10",
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
                                                <div className={cn(
                                                    "absolute right-2 top-1/2 -translate-y-1/2",
                                                    activeMenuId === chat.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                                                )}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (activeMenuId === chat.id) {
                                                                setActiveMenuId(null);
                                                                setMenuPosition(null);
                                                            } else {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setActiveMenuId(chat.id);
                                                                setMenuPosition({
                                                                    top: rect.bottom + 5,
                                                                    left: rect.right - 20
                                                                });
                                                            }
                                                        }}
                                                        className="p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
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
                    <div className={cn("border-t p-4 bg-background/50", !isOpen && "p-2")}>
                        <div className={cn("flex items-center justify-between relative", !isOpen && "flex-col gap-4")}>
                            {/* User Menu Trigger */}
                            <div
                                ref={profileTriggerRef}
                                className={cn("flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-1", !isOpen && "justify-center")}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (menuOpen) {
                                        setMenuOpen(false);
                                    } else {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setProfileMenuPosition({
                                            left: rect.left,
                                            bottom: window.innerHeight - rect.top + 10 // Position above
                                        });
                                        setMenuOpen(true);
                                    }
                                }}
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                    {user?.name?.[0]?.toUpperCase()
                                        ? <span className="text-xs font-bold text-primary">{user.name[0].toUpperCase()}</span>
                                        : <UserIconLucide className="h-5 w-5 text-primary" />
                                    }
                                </div>
                                <div className={cn("flex flex-col truncate min-w-0", !isOpen && "hidden")}>
                                    <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
                                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                </div>
                            </div>

                            {/* Theme Toggle - Removed from footer as it's now in Profile Menu */}

                        </div>
                    </div>



                </div>
            </div>

            {/* Portal for Action Menu */}
            {activeMenuId && menuPosition && createPortal(
                <div
                    className="fixed z-[100] w-32 rounded-md border bg-popover p-1 shadow-md text-popover-foreground animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: menuPosition.top,
                        left: menuPosition.left
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const chat = conversations.find(c => c.id === activeMenuId);
                            if (chat) {
                                setSelectedShareChat(chat);
                                setShareModalOpen(true);
                            }
                            setActiveMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </button>
                    <button
                        onClick={(e) => {
                            const chat = conversations.find(c => c.id === activeMenuId);
                            if (chat) startEditing(e, chat);
                            setActiveMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Rename
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(activeMenuId);
                            setActiveMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div >,
                document.body
            )
            }

            {/* Portal for User Profile Menu */}
            {
                menuOpen && profileMenuPosition && createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-[100] w-56 rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in zoom-in-95"
                        style={{
                            left: profileMenuPosition.left,
                            bottom: profileMenuPosition.bottom
                        }}
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
                                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                            <div className="h-px bg-muted my-1" />
                            <button
                                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                onClick={() => { setMenuOpen(false); setShowAboutModal(true); }}
                            >
                                <Info className="mr-2 h-4 w-4" />
                                <span>About Us</span>
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
                    </div>,
                    document.body
                )
            }

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onPasswordChange={() => {
                    setShowProfileModal(false);
                    setShowPasswordModal(true);
                }}
                onDeleteAllChats={onDeleteAllConversations}
            />

            <AboutModal
                isOpen={showAboutModal}
                onClose={() => setShowAboutModal(false)}
            />

            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => {
                    setShareModalOpen(false);
                    setSelectedShareChat(null);
                }}
                onCopy={() => onCopyChat && selectedShareChat ? onCopyChat(selectedShareChat.id) : null}
                onDownload={() => onDownloadChat && selectedShareChat ? onDownloadChat(selectedShareChat.id, selectedShareChat.title) : null}
                chatTitle={selectedShareChat?.title || "Chat"}
            />
        </>
    );
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}
