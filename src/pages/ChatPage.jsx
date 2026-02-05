import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const { id } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedService, setSelectedService] = useState(config.services.default);

    const currentChatId = id || null;

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
        if (!chatId) {
            setMessages([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await client.get(config.endpoints.chat.conversation(chatId));
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
        } catch (error) {
            console.error("Failed to load chat", error);
            navigate('/chat');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        loadChat(id);
    }, [id, loadChat]);

    const handleSelectChat = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    const handleNewChat = () => {
        navigate('/chat');
        if (window.innerWidth < 1024) {
            setSidebarOpen(false); // Close mobile sidebar
        }
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

    const handleDeleteAllConversations = async () => {
        try {
            const res = await client.delete(config.endpoints.chat.delete_all_conversations);
            setConversations([]);
            setMessages([]);
            navigate('/chat');
            return res.data;
        } catch (err) {
            console.error("Failed to delete all conversations", err);
            throw err;
        }
    };

    const handleSend = async (text, options = {}) => {
        const isWebSearch = options.isWebSearch || false;
        const isThinking = options.isThinking || false;

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
        let serviceName = selectedService;
        if (isWebSearch) serviceName = 'web_search';
        else if (isThinking) serviceName = 'thinking';

        const payload = {
            user_query: text,
            service_name: serviceName,
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
                navigate(`/chat/${newConvId}`, { replace: true });
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

    const handleRegenerate = async (messageId) => {
        // Find index of the AI message we want to regenerate
        const aiMsgIndex = messages.findIndex(m => m.id === messageId);
        if (aiMsgIndex === -1) return;

        // The user message to regenerate from is the one immediately preceding this AI message
        const userMsg = messages[aiMsgIndex - 1];
        if (!userMsg || userMsg.role !== 'user') return;

        // Re-send the user prompt without truncating (appends to bottom)
        handleSend(userMsg.content);
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

    const formatChatContent = (chatData) => {
        if (!chatData || !chatData.messages) return "";
        return chatData.messages.map(msg => {
            const userPart = `User: ${msg.user}`;
            const aiPart = msg.assistant ? `\nAI: ${msg.assistant}` : "";
            return `${userPart}${aiPart}`;
        }).join("\n\n");
    };

    const handleCopyChat = async (chatId) => {
        try {
            const res = await client.get(config.endpoints.chat.conversation(chatId));
            const text = formatChatContent(res.data);
            await navigator.clipboard.writeText(text);
            // You might want to add a toast notification here
            console.log("Chat copied to clipboard");
        } catch (err) {
            console.error("Failed to copy chat", err);
            alert("Failed to copy chat to clipboard.");
        }
    };

    const handleDownloadChat = async (chatId, title) => {
        try {
            const res = await client.get(config.endpoints.chat.conversation(chatId));
            const text = formatChatContent(res.data);

            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'chat'}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to download chat", err);
            alert("Failed to download chat.");
        }
    };

    const isChatEmpty = messages.length === 0;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">

            {/* Sidebar */}
            <Sidebar
                conversations={conversations}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onDeleteAllConversations={handleDeleteAllConversations}
                onRenameChat={handleRenameChat}
                onCopyChat={handleCopyChat}
                onDownloadChat={handleDownloadChat}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col h-full w-full relative">

                {/* Messages */}
                <ChatArea
                    messages={messages}
                    isLoading={isLoading}
                    isStreaming={isStreaming}
                    onRegenerate={handleRegenerate}
                />

                {/* Input */}
                <div className={cn(
                    "w-full transition-all duration-500 ease-in-out px-4",
                    isChatEmpty
                        ? "absolute inset-0 flex flex-col items-center justify-center bg-background z-10"
                        : "bg-background pb-2"
                )}>
                    {isChatEmpty && (
                        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="h-16 w-16 mb-6 flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">How can I help you today?</h2>
                            {/* <p className="max-w-md text-muted-foreground text-lg">
                                Ask me anything about code, writing, or just have a chat.
                            </p> */}
                        </div>
                    )}
                    <ChatInput
                        onSend={handleSend}
                        isLoading={isLoading}
                        onStop={isStreaming ? handleStop : null}
                        isHero={isChatEmpty}
                    />
                </div>

            </div>
        </div>
    );
}
