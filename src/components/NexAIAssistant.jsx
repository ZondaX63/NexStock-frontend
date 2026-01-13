import React, { useState, useRef, useEffect } from 'react';
import { Close, Send, AutoAwesome as SparklesIcon, SmartToy } from '@mui/icons-material';
import api from '../api';

const NexAIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Merhaba! Ben NexAI asistanınız. Stok, satış veya genel işletme durumunuz hakkında size nasıl yardımcı olabilirim?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', { message: input });
            setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: 'Üzgünüm, şu an bağlantı kuramıyorum.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* FAB Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/40 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
                >
                    <SparklesIcon className="group-hover:rotate-12 transition-transform" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 md:w-96 min-h-[400px] max-h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <SmartToy style={{ fontSize: 20 }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">NexAI Asistan</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">Çevrimiçi</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                            <Close style={{ fontSize: 20 }} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Bir şeyler sorun..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-2 h-8 w-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:bg-slate-300 hover:bg-indigo-700 transition-colors"
                            >
                                <Send style={{ fontSize: 16 }} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default NexAIAssistant;
