
import React, { useState, useEffect } from 'react';
import { X, User, Phone, Lock, Save, Loader2, Check, Mail } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUpdate: () => void;
}

export function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user && isOpen) {
            setEmail(user.email || '');
            setFullName(user.user_metadata?.full_name || '');
            setPhone(user.user_metadata?.phone || '');
            setCurrentPassword('');
            setNewPassword('');
            setMsg(null);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
        setPhone(value);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMsg(null);

        try {
            // 1. Update Profile Data
            const { error: profileError } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone: phone
                }
            });

            if (profileError) throw profileError;

            // 2. Update Password if provided
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
                }
                if (!currentPassword) {
                    throw new Error("Para alterar a senha, informe sua senha atual.");
                }

                // Verify current password by signing in
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: currentPassword
                });

                if (signInError) {
                    throw new Error("Senha atual incorreta.");
                }

                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword
                });
                if (passwordError) throw passwordError;
            }

            setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            onUpdate(); // Refresh data in parent

            // Clear password fields after success
            if (newPassword) {
                setNewPassword('');
                setCurrentPassword('');
            }

        } catch (error: any) {
            setMsg({ type: 'error', text: error.message || 'Erro ao atualizar perfil.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-zinc-900/50 p-6 border-b border-zinc-800/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User size={20} className="text-violet-500" />
                        Meus Dados
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSave} className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    maxLength={15}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-4 border-t border-zinc-800/50 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock size={16} className="text-violet-500" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Alterar Segurança</span>
                            </div>

                            {/* Current Password */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Senha Atual</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors"
                                        placeholder="Digite sua senha atual"
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-violet-600 transition-colors"
                                        placeholder="Mínimo 6 caracteres (Opcional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feedback Message */}
                        {msg && (
                            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {msg.type === 'success' ? <Check size={14} /> : null}
                                {msg.text}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Salvar</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
