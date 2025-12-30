
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, Wallet } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface LoginPageProps {
    onGoToSignUp: () => void;
}

export function LoginPage({ onGoToSignUp }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : authError.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-600/20 mb-6">
                        <Wallet size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Rege Finance</h1>
                    <p className="text-zinc-500 text-sm font-medium text-center px-4">Sua gestão financeira com sabedoria e inteligência.</p>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="email"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-violet-600 transition-colors"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-rose-500 text-[11px] font-bold uppercase tracking-wider text-center bg-rose-500/10 py-2 rounded-lg">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-violet-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><LogIn size={18} /> Entrar</>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col items-center gap-4">
                        <button className="text-zinc-500 text-xs font-bold hover:text-white transition-colors">Esqueceu sua senha?</button>
                        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                            Não tem conta? <button onClick={onGoToSignUp} className="text-violet-400 hover:underline">Criar agora</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
