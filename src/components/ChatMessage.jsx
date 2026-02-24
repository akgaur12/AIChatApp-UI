import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '../lib/utils';
import { User, Bot, Copy, Check, RotateCcw, ExternalLink, ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from 'lucide-react';

const CodeBlock = ({ children, ...props }) => {
    const [copied, setCopied] = React.useState(false);
    const codeRef = React.useRef(null);

    // Extract language from the code child
    const getLanguage = () => {
        const codeElement = React.Children.toArray(children).find(
            child => React.isValidElement(child)
        );
        const className = codeElement?.props?.className || '';
        const match = /language-(\w+)/.exec(className);
        return match ? match[1] : '';
    };

    const language = getLanguage();

    const handleCopy = () => {
        const content = codeRef.current?.innerText || '';
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-6 group/code bg-muted/20 dark:bg-[#0d1117] rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[13px] font-mono text-muted-foreground/70 lowercase">
                    {language || 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
                    title="Copy code"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </button>
            </div>
            <div className="overflow-x-auto w-full">
                <pre ref={codeRef} className="!border-none !bg-transparent px-5 pb-5 pt-1 !m-0 font-mono text-sm leading-relaxed text-foreground dark:text-foreground" {...props}>
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { isBlock: true });
                        }
                        return child;
                    })}
                </pre>
            </div>
        </div>
    );
};

export default function ChatMessage({ message, onRegenerate }) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn(
            "group w-full text-foreground py-2 px-4 transition-colors duration-200",
            "bg-transparent"
        )}>
            <div className={cn(
                "mx-auto max-w-3xl flex flex-col",
                isUser ? "items-end" : "items-start"
            )}>
                {/* Message Bubble/Content */}
                <div className={cn(
                    "relative transition-all duration-200",
                    isUser
                        ? "bg-muted text-foreground px-5 py-2.5 rounded-[22px] max-w-[85%] shadow-sm hover:bg-muted/80"
                        : "w-full"
                )}>
                    <div className={cn(
                        "prose prose-slate dark:prose-invert max-w-none break-words leading-relaxed text-[15px]",
                        isUser ? "prose-p:m-0" : "prose-p:leading-relaxed prose-p:mb-4",
                        "prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-4",
                        "prose-a:text-blue-500 prose-a:font-medium hover:prose-a:text-blue-600 prose-a:underline prose-a:underline-offset-4",
                        "prose-strong:font-bold",
                        "prose-code:text-foreground prose-code:font-medium prose-code:before:content-none prose-code:after:content-none",
                        "prose-pre:bg-[#1E1E1E] prose-pre:border prose-pre:border-white/10 prose-pre:shadow-xl",
                        "prose-ol:list-decimal prose-ul:list-disc",
                        "prose-th:font-semibold prose-th:text-xs prose-th:uppercase prose-th:tracking-wider",
                        "prose-td:text-sm",
                        "blue:prose-p:text-[hsl(210_40%_98%)] blue:prose-headings:text-[hsl(210_40%_98%)] blue:prose-strong:text-[hsl(210_40%_98%)] blue:prose-li:text-[hsl(210_40%_98%)] blue:text-[hsl(210_40%_98%)]",
                        "light-mint:prose-p:text-[hsl(160_40%_15%)] light-mint:prose-headings:text-[hsl(160_40%_15%)] light-mint:prose-strong:text-[hsl(160_40%_15%)] light-mint:prose-li:text-[hsl(160_40%_15%)] light-mint:text-[hsl(160_40%_15%)]",
                        "midnight-green:prose-p:text-[hsl(220_14%_96%)] midnight-green:prose-headings:text-[hsl(220_14%_96%)] midnight-green:prose-strong:text-[hsl(220_14%_96%)] midnight-green:prose-li:text-[hsl(220_14%_96%)] midnight-green:text-[hsl(220_14%_96%)]",
                        "deep-slate:prose-p:text-[hsl(0_0%_93%)] deep-slate:prose-headings:text-[hsl(0_0%_93%)] deep-slate:prose-strong:text-[hsl(0_0%_93%)] deep-slate:prose-li:text-[hsl(0_0%_93%)] deep-slate:text-[hsl(0_0%_93%)]",
                        "carbon-black:prose-p:text-[hsl(240_5%_96%)] carbon-black:prose-headings:text-[hsl(240_5%_96%)] carbon-black:prose-strong:text-[hsl(240_5%_96%)] carbon-black:prose-li:text-[hsl(240_5%_96%)] carbon-black:text-[hsl(240_5%_96%)]",
                        "deep-graphite:prose-p:text-[hsl(0_0%_98%)] deep-graphite:prose-headings:text-[hsl(0_0%_98%)] deep-graphite:prose-strong:text-[hsl(0_0%_98%)] deep-graphite:prose-li:text-[hsl(0_0%_98%)] deep-graphite:text-[hsl(0_0%_98%)]",
                        "midnight-blue:prose-p:text-[hsl(210_40%_96%)] midnight-blue:prose-headings:text-[hsl(210_40%_96%)] midnight-blue:prose-strong:text-[hsl(210_40%_96%)] midnight-blue:prose-li:text-[hsl(210_40%_96%)] midnight-blue:text-[hsl(210_40%_96%)]",
                        "earth-tone:prose-p:text-[hsl(30_30%_20%)] earth-tone:prose-headings:text-[hsl(30_30%_20%)] earth-tone:prose-strong:text-[hsl(30_30%_20%)] earth-tone:prose-li:text-[hsl(30_30%_20%)] earth-tone:text-[hsl(30_30%_20%)]",
                        "warm-sun:prose-p:text-[hsl(47_68%_20%)] warm-sun:prose-headings:text-[hsl(47_68%_20%)] warm-sun:prose-strong:text-[hsl(47_68%_20%)] warm-sun:prose-li:text-[hsl(47_68%_20%)] warm-sun:text-[hsl(47_68%_20%)]",
                        "peach-coral:prose-p:text-[hsl(11_66%_20%)] peach-coral:prose-headings:text-[hsl(11_66%_20%)] peach-coral:prose-strong:text-[hsl(11_66%_20%)] peach-coral:prose-li:text-[hsl(11_66%_20%)] peach-coral:text-[hsl(11_66%_20%)]",
                        "lavender-indigo:prose-p:text-[hsl(235_50%_20%)] lavender-indigo:prose-headings:text-[hsl(235_50%_20%)] lavender-indigo:prose-strong:text-[hsl(235_50%_20%)] lavender-indigo:prose-li:text-[hsl(235_50%_20%)] lavender-indigo:text-[hsl(235_50%_20%)]",

                        "sage-green:prose-p:text-[hsl(165_25%_20%)] sage-green:prose-headings:text-[hsl(165_25%_20%)] sage-green:prose-strong:text-[hsl(165_25%_20%)] sage-green:prose-li:text-[hsl(165_25%_20%)] sage-green:text-[hsl(165_25%_20%)]",
                        "warm-stone:prose-p:text-[hsl(10_5%_10%)] warm-stone:prose-headings:text-[hsl(10_5%_10%)] warm-stone:prose-strong:text-[hsl(10_5%_10%)] warm-stone:prose-li:text-[hsl(10_5%_10%)] warm-stone:text-[hsl(10_5%_10%)]",
                        "terracotta-clay:prose-p:text-[hsl(15_50%_20%)] terracotta-clay:prose-headings:text-[hsl(15_50%_20%)] terracotta-clay:prose-strong:text-[hsl(15_50%_20%)] terracotta-clay:prose-li:text-[hsl(15_50%_20%)] terracotta-clay:text-[hsl(15_50%_20%)]",
                        "steel-blue:prose-p:text-[hsl(220_35%_20%)] steel-blue:prose-headings:text-[hsl(220_35%_20%)] steel-blue:prose-strong:text-[hsl(220_35%_20%)] steel-blue:prose-li:text-[hsl(220_35%_20%)] steel-blue:text-[hsl(220_35%_20%)]",
                        "mocha-brown:prose-p:text-[hsl(35_30%_20%)] mocha-brown:prose-headings:text-[hsl(35_30%_20%)] mocha-brown:prose-strong:text-[hsl(35_30%_20%)] mocha-brown:prose-li:text-[hsl(35_30%_20%)] mocha-brown:text-[hsl(35_30%_20%)]"
                    )}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                pre: CodeBlock,
                                code: ({ node, className, children, isBlock, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');

                                    if (!isBlock && !match) {
                                        return (
                                            <code
                                                className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-medium text-foreground"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    }

                                    return (
                                        <code className={cn(className, "text-foreground")} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                table: ({ node, ...props }) => (
                                    <div className="my-6 w-full overflow-hidden rounded-lg border border-border/50 bg-transparent transition-all">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-separate border-spacing-0" {...props} />
                                        </div>
                                    </div>
                                ),
                                th: ({ node, ...props }) => (
                                    <th className="bg-muted/50 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border/50" {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                    <td className="px-4 py-2.5 text-sm text-foreground/80 border border-border/40" {...props} />
                                ),
                                a: ({ node, ...props }) => (
                                    <a
                                        {...props}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600 underline underline-offset-4 decoration-2 inline-flex items-center gap-1 group/link break-all"
                                    >
                                        <span className="inline-block">{props.children}</span>
                                        <ExternalLink className="h-3 w-3 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                                    </a>
                                )
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                        {message.isStreaming && (
                            <span className="inline-block w-1.5 h-5 ml-1 align-middle bg-primary/50 animate-pulse rounded-full" />
                        )}
                    </div>
                </div>

                {/* Assistant Action Row */}
                {!isUser && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-1.5">
                        <button onClick={handleCopy} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-muted-foreground/60 hover:text-foreground" title="Copy">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => onRegenerate?.(message.id)}
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-muted-foreground/60 hover:text-foreground"
                            title="Regenerate"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
