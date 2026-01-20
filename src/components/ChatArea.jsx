import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Loader2, Zap } from 'lucide-react';

export default function ChatArea({ messages, isLoading, isStreaming }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isStreaming]);

    if (!messages || messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Zap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">How can I help you today?</h2>
                <p className="max-w-md mx-auto mb-8">
                    I'm a powerful AI assistant capable of helping you with code, writing, analysis, and more.
                    Start a conversation to get started!
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-fancy" ref={scrollRef}>
            <div className="flex flex-col pb-20"> {/* pb-20 to account for input area fixed at bottom or just spacing */}
                {messages.map((msg, index) => (
                    <ChatMessage key={msg.id || index} message={msg} />
                ))}
                {isLoading && !isStreaming && (
                    <div className="w-full p-4 flex justify-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
