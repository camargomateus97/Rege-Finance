
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../types';
import { chatWithAssistant } from '../../services/geminiService';

interface RegeChatProps {
    onClose: () => void;
    totalBalance: number;
    recentTransactions: any[];
    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const RegeChat: React.FC<RegeChatProps> = ({
    onClose,
    totalBalance,
    recentTransactions,
    chatHistory,
    setChatHistory
}) => {
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isChatLoading]);

    const handleSendChatMessage = async () => {
        if (!chatInput.trim() || isChatLoading) return;
        const userMsg = chatInput.trim();
        setChatInput('');

        // Update local state first
        const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userMsg }];
        setChatHistory(updatedHistory);

        setIsChatLoading(true);
        try {
            const contextData = {
                balance: totalBalance,
                recentTransactions: recentTransactions
            };
            const aiResponse = await chatWithAssistant(updatedHistory, userMsg, contextData);
            setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Desculpe, tive um problema ao processar sua solicitação." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="bg-zinc-950 w-full max-w-sm rounded-t-[3rem] border-t border-zinc-800 shadow-2xl relative z-10 flex flex-col h-[90vh]">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-600/10 rounded-xl text-violet-400"><Bot size={20} /></div>
                    <h3 className="font-black text-white uppercase tracking-tighter">Rege IA</h3>
                </div>
                <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {chatHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                            }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-900 px-5 py-3 rounded-2xl flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-violet-400" />
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Rege está pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-6 pb-10 border-t border-zinc-900">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Pergunte qualquer coisa..."
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-violet-600/50 transition-all font-medium"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    />
                    <button
                        onClick={handleSendChatMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="absolute right-2 top-2 w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center hover:bg-violet-700 disabled:opacity-50 disabled:bg-zinc-800 transition-all"
                    >
                        {isChatLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
