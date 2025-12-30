
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone, ArrowLeft } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface SignUpPageProps {
    onBackToLogin: () => void;
    onViewTerms: () => void;
    onViewPrivacy: () => void;
}

export function SignUpPage({ onBackToLogin, onViewTerms, onViewPrivacy }: SignUpPageProps) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !phone || !email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);
        setError('');

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                }
            }
        });

        if (signUpError) {
            let errorMsg = signUpError.message;
            if (errorMsg === 'Password should be at least 6 characters') {
                errorMsg = 'A senha deve ter no mínimo 6 caracteres.';
            } else if (errorMsg === 'User already registered') {
                errorMsg = 'Este usuário já está cadastrado.';
            }
            setError(errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={onBackToLogin} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 font-bold text-[10px] uppercase tracking-widest">
                    <ArrowLeft size={16} /> Voltar ao Login
                </button>

                <div className="mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Criar Conta</h2>
                    <p className="text-zinc-500 text-sm font-medium">Junte-se ao Rege e transforme suas finanças.</p>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors text-sm"
                                    placeholder="digite seu nome completo"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block">Número de Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="tel"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors text-sm"
                                    placeholder="(00) 00000-0000"
                                    value={phone}
                                    maxLength={15}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, "");
                                        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
                                        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
                                        setPhone(value);
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="email"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors text-sm"
                                    placeholder="seu@melhor-email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-violet-600 transition-colors text-sm"
                                    placeholder="Crie uma senha forte"
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

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Finalizar Cadastro'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-zinc-600 text-[9px] font-medium leading-relaxed uppercase tracking-wider">
                        Ao clicar em finalizar, você concorda com nossos <br /> <button type="button" onClick={onViewTerms} className="text-zinc-400 underline hover:text-white transition-colors">Termos de Uso</button> e <button type="button" onClick={onViewPrivacy} className="text-zinc-400 underline hover:text-white transition-colors">Privacidade</button>.
                    </p>
                </div>
            </div>
        </div>
    );
}
