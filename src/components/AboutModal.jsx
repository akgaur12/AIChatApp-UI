import React from 'react';
import { X, Github, Mail, Globe, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AboutModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Info className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight">About AIChatApp</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <h3 className="text-xl font-bold">AIChatApp</h3>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium">v1.0.0</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A modern, AI-powered chat platform designed for seamless communication and intelligent assistance.
                            Built with performance and user experience in mind.
                        </p>
                    </div>

                    <div className="space-y-4 rounded-lg bg-muted/50 p-4 border border-border/50">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Developer</span>
                            <span className="text-sm font-semibold">Akash Gaur</span>
                        </div>
                        <div className="h-px bg-border/50" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Tech Stack</span>
                            <span className="text-sm font-semibold">Langchain, LangGraph, FastAPI<br/>React, Tailwind CSS, Lucide</span>
                        </div>
                        <div className="h-px bg-border/50" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-semibold">Operational</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Features</h4>
                        <ul className="grid grid-cols-2 gap-2">
                            {['Intelligent AI', 'Real-time Responses', 'Modern UI/UX', 'Dark/Light Mode'].map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-6 border-t bg-muted/30 p-4">
                   <a
                        href="https://github.com/akgaur12"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        >
                        <Github className="h-5 w-5" />
                    </a>
                                            <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Globe className="h-5 w-5" />
                    </button>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
