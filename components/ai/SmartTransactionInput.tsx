
import React, { useState } from 'react';
import { Sparkles, Mic, Loader2 } from 'lucide-react';
import { smartParseTransaction } from '../../services/geminiService';
import { TransactionType } from '../../types';

interface SmartTransactionInputProps {
    onParsed: (data: any) => void;
}

export const SmartTransactionInput: React.FC<SmartTransactionInputProps> = ({ onParsed }) => {
    const [aiInput, setAiInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAiSmartAdd = async () => {
        if (!aiInput.trim()) return;
        setIsAiLoading(true);
        setError(null);
        try {
            const result = await smartParseTransaction(aiInput);
            if (result) {
                onParsed(result);
            }
        } catch (err: any) {
            console.error("SmartAdd Error:", err);
            setError(err.message || "Erro de conexão com a Rege IA.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Seu navegador não suporta reconhecimento de voz.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAiInput(prev => prev ? prev + " " + transcript : transcript);
        };
        recognition.start();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative">
                <textarea
                    placeholder="Ex: Recebi meu salário de 3500 reais hoje..."
                    className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-[2rem] p-6 h-44 resize-none text-lg font-medium focus:outline-none focus:border-violet-600/30 transition-all"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                />
                <div className="absolute top-4 right-4 text-violet-600/20">
                    <Sparkles size={32} />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={startListening}
                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        }`}
                >
                    <Mic size={18} /> {isListening ? 'Ouvindo...' : 'Voz'}
                </button>

                <button
                    onClick={handleAiSmartAdd}
                    disabled={isAiLoading || !aiInput.trim()}
                    className="flex-[2] bg-violet-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-700 disabled:opacity-50 disabled:bg-zinc-800 transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98]"
                >
                    {isAiLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Processar com Rege IA
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-xs font-bold text-rose-400 text-center">{error}</p>
                </div>
            )}

            <div className="p-4 bg-violet-600/5 rounded-2xl border border-violet-600/10">
                <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest text-center">
                    Dica: Tente dizer o valor, descrição e categoria.
                </p>
            </div>
        </div>
    );
};
