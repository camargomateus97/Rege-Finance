
import React from 'react';
import { ArrowLeft, ScrollText } from 'lucide-react';

interface TermsOfUseProps {
    onBack: () => void;
}

export function TermsOfUse({ onBack }: TermsOfUseProps) {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/5 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-2xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/50">
                    <ArrowLeft size={16} /> Voltar
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-violet-600/20 rounded-2xl flex items-center justify-center border border-violet-600/20">
                        <ScrollText className="text-violet-400" size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Termos de Uso</h1>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl text-zinc-400 text-sm leading-relaxed space-y-6">
                    <p>
                        Bem-vindo ao <strong>Rege Finance</strong>. Ao acessar e utilizar nossa plataforma, você concorda com os termos descritos abaixo.
                    </p>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">1. Aceitação dos Termos</h3>
                        <p>O uso dos serviços oferecidos implicam na aceitação imediata destes termos. Caso não concorde, por favor, não utilize a plataforma.</p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">2. Uso da Plataforma</h3>
                        <p>A plataforma destina-se ao gerenciamento financeiro pessoal. O usuário é responsável pela veracidade das informações inseridas e pela segurança de suas credenciais de acesso.</p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">3. Privacidade de Dados</h3>
                        <p>Valorizamos sua privacidade. Todos os dados são tratados conforme nossa Política de Privacidade. Não compartilhamos informações financeiras com terceiros sem consentimento explícito, exceto quando exigido por lei.</p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">4. Responsabilidades</h3>
                        <p>O Rege Finance é uma ferramenta de auxílio. Não nos responsabilizamos por decisões financeiras tomadas com base nas informações organizadas pela plataforma. O usuário deve sempre verificar seus dados junto às instituições bancárias oficiais.</p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold text-base mb-2">5. Alterações</h3>
                        <p>Podemos atualizar estes termos periodicamente. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.</p>
                    </section>
                </div>

                <p className="mt-8 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    Última atualização: Dezembro de 2025
                </p>
            </div>
        </div>
    );
}
