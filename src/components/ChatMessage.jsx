import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { User, Bot } from 'lucide-react';

export default function ChatMessage({ message }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "group w-full text-foreground border-b border-black/5 dark:border-white/5",
            isUser ? "bg-background" : "bg-muted/30"
        )}>
            <div className="mx-auto max-w-3xl p-4 md:p-6 flex gap-4 md:gap-6">

                {/* Avatar */}
                <div className={cn(
                    "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-sm border shadow",
                    isUser ? "bg-background" : "bg-primary text-primary-foreground"
                )}>
                    {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>

                {/* Content */}
                <div className="relative flex-1 overflow-hidden">
                    <div className="text-sm font-medium mb-1 opacity-90">
                        {isUser ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-7">
                        <ReactMarkdown
                            components={{
                                pre: ({ node, ...props }) => (
                                    <div className="overflow-auto w-full my-2 bg-black/10 dark:bg-black/30 p-2 rounded-md">
                                        <pre {...props} />
                                    </div>
                                ),
                                code: ({ node, ...props }) => (
                                    <code className="bg-black/10 dark:bg-white/10 rounded-sm px-1 py-0.5" {...props} />
                                )
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                        {/* Streaming cursor if needed, handled by parent usually but we can check a flag */}
                        {message.isStreaming && (
                            <span className="inline-block w-2.5 h-4 ml-1 align-middle bg-primary animate-pulse" />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
