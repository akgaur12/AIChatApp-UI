import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Plus, Globe, X, Brain, Image, Newspaper } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatInput({
    onSend,
    isLoading,
    onStop,
    isHero,
    isWebSearch,
    setIsWebSearch,
    isThinking,
    setIsThinking,
    isImageSearch,
    setIsImageSearch,
    isNewsSearch,
    setIsNewsSearch
}) {
    const [input, setInput] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const textareaRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit'; // Reset height
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input, isWebSearch, isThinking, isImageSearch, isNewsSearch]); // Reset height if badge appears/disappears

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

        onSend(input, { isWebSearch, isThinking, isImageSearch, isNewsSearch });
        setInput('');
    };

    return (
        <div className={cn(
            "w-full max-w-3xl mx-auto relative transition-all duration-300",
            isHero ? "scale-105" : "scale-100"
        )}>
            <div className={cn(
                "relative flex items-end gap-2 bg-muted/30 border border-border/50 rounded-2xl p-2 shadow-lg backdrop-blur-sm transition-all duration-300 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
                isHero && "p-3 shadow-2xl border-primary/20"
            )}>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground transition-all shrink-0 mb-0.5 focus:outline-none"
                    >
                        <Plus className={cn("h-5 w-5 transition-transform duration-300", isMenuOpen && "rotate-45")} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-3 w-56 bg-popover/90 backdrop-blur-md border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 ring-1 ring-black/5">
                            <button
                                onClick={() => {
                                    setIsWebSearch(true);
                                    setIsThinking(false);
                                    setIsImageSearch(false);
                                    setIsNewsSearch(false);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors focus:outline-none font-medium"
                            >
                                <Globe className="h-4 w-4 text-blue-500" />
                                <span>Websearch</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsThinking(true);
                                    setIsWebSearch(false);
                                    setIsImageSearch(false);
                                    setIsNewsSearch(false);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors focus:outline-none font-medium"
                            >
                                <Brain className="h-4 w-4 text-purple-500" />
                                <span>Thinking</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsImageSearch(true);
                                    setIsWebSearch(false);
                                    setIsThinking(false);
                                    setIsNewsSearch(false);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors focus:outline-none font-medium"
                            >
                                <Image className="h-4 w-4 text-emerald-500" />
                                <span>Image search</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsNewsSearch(true);
                                    setIsWebSearch(false);
                                    setIsThinking(false);
                                    setIsImageSearch(false);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors focus:outline-none font-medium"
                            >
                                <Newspaper className="h-4 w-4 text-orange-500" />
                                <span>News search</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message AI Assistant..."
                        className="w-full max-h-[200px] min-h-[44px] bg-transparent border-0 focus:ring-0 focus:outline-none focus:ring-offset-0 resize-none py-2.5 px-2 text-[15px] leading-relaxed scrollbar-minimal placeholder:text-muted-foreground/60 transition-all selection:bg-primary/20"
                        rows={1}
                        disabled={isLoading && !onStop}
                        style={{ outline: 'none', WebkitTapHighlightColor: 'transparent', boxShadow: 'none' }}
                    />

                    <div className="flex flex-wrap gap-2 px-1">
                        {isWebSearch && (
                            <div className="flex items-center gap-2 self-start bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-[13px] font-semibold animate-in zoom-in-95 duration-200 border border-blue-500/20">
                                <Globe className="h-3.5 w-3.5" />
                                <span>Web Search</span>
                                <button
                                    onClick={() => setIsWebSearch(false)}
                                    className="ml-1 hover:bg-blue-500/20 rounded-md p-0.5 transition-colors focus:outline-none"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}

                        {isThinking && (
                            <div className="flex items-center gap-2 self-start bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-lg text-[13px] font-semibold animate-in zoom-in-95 duration-200 border border-purple-500/20">
                                <Brain className="h-3.5 w-3.5" />
                                <span>Thinking</span>
                                <button
                                    onClick={() => setIsThinking(false)}
                                    className="ml-1 hover:bg-purple-500/20 rounded-md p-0.5 transition-colors focus:outline-none"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}

                        {isImageSearch && (
                            <div className="flex items-center gap-2 self-start bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-[13px] font-semibold animate-in zoom-in-95 duration-200 border border-emerald-500/20">
                                <Image className="h-3.5 w-3.5" />
                                <span>Image Search</span>
                                <button
                                    onClick={() => setIsImageSearch(false)}
                                    className="ml-1 hover:bg-emerald-500/20 rounded-md p-0.5 transition-colors focus:outline-none"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}

                        {isNewsSearch && (
                            <div className="flex items-center gap-2 self-start bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg text-[13px] font-semibold animate-in zoom-in-95 duration-200 border border-orange-500/20">
                                <Newspaper className="h-3.5 w-3.5" />
                                <span>News Search</span>
                                <button
                                    onClick={() => setIsNewsSearch(false)}
                                    className="ml-1 hover:bg-orange-500/20 rounded-md p-0.5 transition-colors focus:outline-none"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() && !isLoading}
                    className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-xl transition-all shrink-0 mb-0.5 focus:outline-none",
                        input.trim() || isLoading
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md scale-100"
                            : "bg-muted text-muted-foreground/50 scale-95"
                    )}
                >
                    {isLoading ? (
                        <StopCircle className="h-5 w-5" />
                    ) : (
                        <Send className={cn("h-5 w-5", input.trim() && "animate-in slide-in-from-bottom-1")} />
                    )}
                </button>

            </div>
            {!isHero && (
                <div className="text-center text-[11px] text-muted-foreground/60 mt-3 font-medium tracking-tight">
                    AI can make mistakes. Consider checking important information.
                </div>
            )}
        </div>
    );
}
