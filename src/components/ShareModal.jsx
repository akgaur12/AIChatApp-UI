import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Download, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ShareModal({
    isOpen,
    onClose,
    onCopy,
    onDownload,
    chatTitle
}) {
    const [isCopying, setIsCopying] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        setIsCopying(true);
        try {
            await onCopy();
            // Optional: User feedback could be handled here or by parent via toast
        } catch (error) {
            console.error("Copy failed", error);
        } finally {
            setIsCopying(false);
            onClose();
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await onDownload();
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setIsDownloading(false);
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg animate-in fade-in zoom-in-95 duration-200 p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">
                            Share Chat
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Export content from <span className="font-medium text-foreground">"{chatTitle}"</span>
                    </p>
                </div>

                {/* Body */}
                <div className="grid gap-4 py-2">
                    <button
                        onClick={handleCopy}
                        disabled={isCopying}
                        className={cn(
                            "flex items-center justify-between rounded-md border p-4 hover:bg-accent hover:text-accent-foreground transition-colors",
                            isCopying && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-2 text-primary">
                                <Copy className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Copy entire chat</div>
                                <div className="text-xs text-muted-foreground">Copy all messages to clipboard</div>
                            </div>
                        </div>
                        {isCopying && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={cn(
                            "flex items-center justify-between rounded-md border p-4 hover:bg-accent hover:text-accent-foreground transition-colors",
                            isDownloading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-2 text-primary">
                                <Download className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Download as file</div>
                                <div className="text-xs text-muted-foreground">Save as .txt file</div>
                            </div>
                        </div>
                        {isDownloading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </button>
                </div>

                {/* Footer */}
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
