
import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center p-6 relative overflow-hidden">
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-2xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/50">
                    <ArrowLeft size={16} /> Voltar
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-600/20">
                        <ShieldCheck className="text-emerald-400" size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Política de Privacidade</h1>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl text-zinc-400 text-sm leading-relaxed space-y-6">
                    <p>
                        A sua privacidade é fundamental para o <strong>Rege Finance</strong>. Esta política descreve como coletamos, usamos e protegemos seus dados.
                    </p>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">1. Coleta de Informações</h3>
                        <p>Coletamos informações que você nos fornece diretamente, como nome, e-mail e dados de transações financeiras inseridos na plataforma.</p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">2. Uso das Informações</h3>
                        <p>Utilizamos seus dados para:</p>
                        <ul className="list-disc pl-5 space-y-1 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                            <li>Prover e manter os serviços da plataforma;</li>
                            <li>Personalizar sua experiência e gerar insights financeiros;</li>
                            <li>Melhorar nossos serviços e desenvolver novas funcionalidades;</li>
                            <li>Garantir a segurança da sua conta.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">3. Proteção de Dados</h3>
                        <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração ou destruição.</p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">4. Seus Direitos</h3>
                        <p>Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Você pode gerenciar suas informações diretamente nas configurações da sua conta ('Meus Dados').</p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">5. Contato</h3>
                        <p>Se tiver dúvidas sobre esta política, entre em contato conosco através dos canais de suporte oficiais.</p>
                    </section>
                </div>

                <p className="mt-8 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    Última atualização: Dezembro de 2025
                </p>
            </div>
        </div>
    );
}
