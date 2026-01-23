import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Plus, Globe, X, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatInput({ onSend, isLoading, onStop }) {
    const [input, setInput] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isWebSearch, setIsWebSearch] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const textareaRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit'; // Reset height
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input, isWebSearch, isThinking]); // Reset height if badge appears/disappears

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!input.trim() || (isLoading && !onStop)) return;
        if (isLoading && onStop) {
            onStop();
            return;
        }

        onSend(input, { isWebSearch, isThinking });
        setInput('');
    };

    return (
        <div className="w-full bg-background border-t p-4 pb-2">
            <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-muted/50 border rounded-xl p-2 shadow-sm">

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors shrink-0 mb-0.5 focus:outline-none"
                    >
                        <Plus className={cn("h-5 w-5 transition-transform", isMenuOpen && "rotate-45")} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-popover border rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button
                                onClick={() => {
                                    setIsWebSearch(true);
                                    setIsThinking(false);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors focus:outline-none"
                            >
                                <Globe className="h-4 w-4 text-primary" />
                                <span>Websearch</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsThinking(true);
                                    setIsWebSearch(false);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors focus:outline-none"
                            >
                                <Brain className="h-4 w-4 text-primary" />
                                <span>Thinking</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        className="w-full max-h-[200px] min-h-[44px] bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-3 px-2 text-sm leading-relaxed scrollbar-minimal"
                        rows={1}
                        disabled={isLoading && !onStop}
                    />

                    <div className="flex flex-wrap gap-2">
                        {isWebSearch && (
                            <div className="flex items-center gap-1.5 self-start bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium animate-in zoom-in-95 duration-200 mb-1">
                                <Globe className="h-3.5 w-3.5" />
                                <span>Web Search</span>
                                <button
                                    onClick={() => setIsWebSearch(false)}
                                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors focus:outline-none"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {isThinking && (
                            <div className="flex items-center gap-1.5 self-start bg-purple-500/10 text-purple-600 px-2 py-1 rounded-md text-xs font-medium animate-in zoom-in-95 duration-200 mb-1">
                                <Brain className="h-3.5 w-3.5" />
                                <span>Thinking</span>
                                <button
                                    onClick={() => setIsThinking(false)}
                                    className="ml-1 hover:bg-purple-500/20 rounded-full p-0.5 transition-colors focus:outline-none"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() && !isLoading}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5 focus:outline-none"
                >
                    {isLoading ? (
                        <StopCircle className="h-5 w-5 animate-pulse" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </button>

            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">
                AI can make mistakes. Consider checking important information.
            </div>
        </div>
    );
}
