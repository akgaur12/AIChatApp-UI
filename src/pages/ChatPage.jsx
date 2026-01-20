import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { config } from '../config';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import ChatInput from '../components/ChatInput';
import { Menu, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(config.services.default); // Default service

    // Ref to abort controller for stopping generation
    const abortControllerRef = React.useRef(null);

    const services = config.services.available;

    const fetchConversations = useCallback(async () => {
        try {
            const res = await client.get(config.endpoints.chat.conversations);
            setConversations(res.data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    }, []);

    const loadChat = useCallback(async (chatId) => {
        setIsLoading(true);
        setMessages([]);
        try {
            const res = await client.get(config.endpoints.chat.conversation(chatId));
            // Transform messages if needed to match our internal structure
            // The backend returns: { ..., messages: [ { user:..., assistant:..., seq:... } ] }
            // We need to flatten this to a list of { role: 'user'|'assistant', content: string }
            // Wait, the backend schema in view_file showed:
            // messages: [ { id, chat_id, user, assistant, ... } ]
            // We need to map this to our display format.
            // Actually, looking at `serialize_conversation` in chat_router.py:
            // It returns `messages` list.
            // Each message has `user` and `assistant` fields.
            // We need to split them for the UI flow usually, OR the UI expects pairs?
            // My ChatArea expects a list of messages. each message should probably correspond to a bubble.
            // If the backend stores them as "turns" (User + Assistant), I should split them visually.

            const formattedMessages = [];
            if (res.data.messages) {
                res.data.messages.forEach(turn => {
                    formattedMessages.push({
                        id: turn.id + '-user',
                        role: 'user',
                        content: turn.user,
                        created_at: turn.created_at
                    });
                    if (turn.assistant) {
                        formattedMessages.push({
                            id: turn.id + '-ai',
                            role: 'assistant',
                            content: turn.assistant,
                            created_at: turn.created_at
                        });
                    }
                });
            }
            setMessages(formattedMessages);
            setCurrentChatId(chatId);
        } catch (error) {
            console.error("Failed to load chat", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        setSidebarOpen(false); // Close mobile sidebar
    };

    const handleDeleteChat = async (chatId) => {
        if (!window.confirm("Are you sure you want to delete this chat?")) return;
        try {
            await client.delete(config.endpoints.chat.conversation(chatId));
            setConversations(prev => prev.filter(c => c.id !== chatId));
            if (currentChatId === chatId) {
                handleNewChat();
            }
        } catch (err) {
            console.error("Failed to delete chat", err);
        }
    };

    const handleSend = async (text) => {
        // Optimistic UI update
        const tempUserMsg = { id: Date.now() + '-u', role: 'user', content: text };
        setMessages(prev => [...prev, tempUserMsg]);
        setIsLoading(true);
        setIsStreaming(true);

        // Create a placeholder for AI response
        const tempAiMsgId = Date.now() + '-ai';
        setMessages(prev => [...prev, { id: tempAiMsgId, role: 'assistant', content: '', isStreaming: true }]);

        abortControllerRef.current = new AbortController();

        // Prepare payload
        const payload = {
            user_query: text,
            service_name: selectedService,
            conversation_id: currentChatId
        };

        try {
            const response = await fetch(`${config.API_BASE_URL}${config.endpoints.chat.stream}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = "";
            let newConvId = currentChatId;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'content') {
                                aiContent += data.content;
                                // Update the last message (AI placeholder)
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const lastMsg = newMsgs[newMsgs.length - 1];
                                    if (lastMsg.id === tempAiMsgId) {
                                        lastMsg.content = aiContent;
                                    }
                                    return newMsgs;
                                });
                            } else if (data.type === 'metadata') {
                                if (data.conversation_id && !currentChatId) {
                                    newConvId = data.conversation_id;
                                    // Only update ID locally, don't trigger reload yet
                                }
                            } else if (data.type === 'error') {
                                console.error("Stream error:", data.detail);
                                // Add error indication?
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data", e);
                        }
                    }
                }
            }

            // Stream finished
            if (!currentChatId && newConvId) {
                setCurrentChatId(newConvId);
                fetchConversations(); // Refresh list to show new chat title
            } else {
                // Just refresh list to update timestamp/sort
                fetchConversations();
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error("Send message failed", error);
                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: "Error: Failed to generate response." }]);
            }
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.id === tempAiMsgId) {
                    lastMsg.isStreaming = false;
                }
                return newMsgs;
            });
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const handleRenameChat = async (chatId, newTitle) => {
        try {
            const res = await client.put(config.endpoints.chat.rename_conversation(chatId), { title: newTitle });
            setConversations(prev => prev.map(c =>
                c.id === chatId ? { ...c, title: res.data.title } : c
            ));
        } catch (err) {
            console.error("Failed to rename chat", err);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">

            {/* Sidebar */}
            <Sidebar
                conversations={conversations}
                currentChatId={currentChatId}
                onSelectChat={loadChat}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col h-full w-full relative">

                {/* Header - Mobile Menu & Model Selector */}
                <div className="h-14 border-b flex items-center px-4 justify-between bg-background/50 backdrop-blur top-0 sticky z-10">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-md"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="font-semibold text-lg">
                            {currentChatId ? (conversations.find(c => c.id === currentChatId)?.title || "Chat") : "New Chat"}
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="appearance-none bg-accent/50 border-0 rounded-md py-1 px-3 pr-8 text-sm focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                        >
                            {services.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-50" />
                    </div>
                </div>

                {/* Messages */}
                <ChatArea
                    messages={messages}
                    isLoading={isLoading}
                    isStreaming={isStreaming}
                />

                {/* Input */}
                <ChatInput
                    onSend={handleSend}
                    isLoading={isLoading}
                    onStop={isStreaming ? handleStop : null}
                />

            </div>
        </div>
    );
}
