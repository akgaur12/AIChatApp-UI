import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';

export default function ChatInput({ onSend, isLoading, onStop }) {
    const [input, setInput] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit'; // Reset height
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

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

        onSend(input);
        setInput('');
    };

    return (
        <div className="w-full bg-background border-t p-4 pb-6">
            <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-muted/50 border rounded-xl p-2 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary transition-all shadow-sm">

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-sm leading-relaxed scrollbar-hide"
                    rows={1}
                    disabled={isLoading && !onStop} // Allow typing if we can stop? usually no, keep simple
                />

                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() && !isLoading}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5"
                >
                    {isLoading ? (
                        <StopCircle className="h-5 w-5 animate-pulse" /> // If onStop provided, this stops. If not, just loading spinner
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
