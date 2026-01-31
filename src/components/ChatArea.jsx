import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Loader2, Zap } from 'lucide-react';

export default function ChatArea({ messages, isLoading, isStreaming, onRegenerate }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isStreaming]);

    if (!messages || messages.length === 0) {
        return null;
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-fancy" ref={scrollRef}>
            <div className="flex flex-col pb-4"> {/* reduced padding */}
                {messages.map((msg, index) => (
                    <ChatMessage
                        key={msg.id || index}
                        message={msg}
                        onRegenerate={onRegenerate}
                    />
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
