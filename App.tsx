
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, X,
  ArrowUpRight, ArrowDownLeft, Sparkles, MessageSquare, Loader2,
  PieChart as LucidePieChart, Mic, Camera, Calendar, ChevronDown, Send, Bot, Quote, Lightbulb,
  Check, Pencil, Tag, Download, FileText, FileSpreadsheet, Lock, Mail, Eye, EyeOff, LogIn, User, Phone, ArrowLeft, LogOut
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from './services/supabaseClient';
import { Transaction, TransactionType, Category, ChatMessage, ColorOption } from './types';
import { ICON_LIBRARY, DEFAULT_CATEGORIES, COLOR_PALETTE } from './constants';
import { getDailyQuote, smartParseTransaction, chatWithAssistant, getExpenseTips } from './services/geminiService';

import { LoginPage } from '../components/auth/LoginPage';

import { SignUpPage } from '../components/auth/SignUpPage';
import { TermsOfUse } from '../components/legal/TermsOfUse';
import { PrivacyPolicy } from '../components/legal/PrivacyPolicy';
import { ProfileModal } from '../components/profile/ProfileModal';

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'terms' | 'privacy'>('login');
  // Removed isRegistering in favor of currentPage
  const [isAppLoading, setIsAppLoading] = useState(true);

  // --- DASHBOARD STATE ---
  const [categories, setCategories] = useState<Record<string, Category>>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [dateFilter, setDateFilter] = useState('30');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Menu de logout
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [customCatName, setCustomCatName] = useState('');
  const [customCatColor, setCustomCatColor] = useState<ColorOption>(COLOR_PALETTE[0]);
  const [customCatIconName, setCustomCatIconName] = useState('Tag');

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newCategory, setNewCategory] = useState('food');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Olá! Sou o Rege, seu assistente financeiro. Como posso ajudar com suas finanças hoje? 🤖💰' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [aiTips, setAiTips] = useState<string | null>(null);
  const [isTipsLoading, setIsTipsLoading] = useState(false);

  const [dailyQuote, setDailyQuote] = useState('');

  // Fix: Changed exportMenuRef from HTMLDivElement to HTMLButtonElement as it's attached to a button on line 735.
  const exportMenuRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // --- SUPABASE AUTH & DATA SYNC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsAppLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
      fetchQuote();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    if (!user) return;

    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    if (!catError && catData && catData.length > 0) {
      const catMap: Record<string, Category> = { ...DEFAULT_CATEGORIES };
      catData.forEach(c => {
        catMap[c.slug || c.id] = {
          id: c.id,
          label: c.label,
          icon_name: c.icon_name,
          color: c.color,
          bg: c.bg,
          border: c.border,
          barColor: c.bar_color,
          hex: c.hex,
          type: c.type as TransactionType
        };
      });
      setCategories(catMap);
    }

    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!txError && txData) {
      setTransactions(txData.map(t => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        type: t.type as TransactionType,
        category: t.category,
        date: t.date
      })));
    }
  };

  const fetchQuote = async () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`rege_quote_${user?.id}_${today}`);
    if (saved) {
      setDailyQuote(saved);
      return;
    }
    const quote = await getDailyQuote();
    setDailyQuote(quote);
    localStorage.setItem(`rege_quote_${user?.id}_${today}`, quote);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await supabase.auth.signOut();
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount || !user) return;

    const amountNum = parseFloat(newAmount);
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        title: newTitle,
        amount: amountNum,
        type: newType,
        category: newCategory,
        date: newDate
      }])
      .select()
      .single();

    if (!error && data) {
      setTransactions([{
        id: data.id,
        title: data.title,
        amount: data.amount,
        type: data.type as TransactionType,
        category: data.category,
        date: data.date
      }, ...transactions]);
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCatName || !user) return;

    const newCatData = {
      user_id: user.id,
      label: customCatName,
      icon_name: customCatIconName,
      color: customCatColor.tailwindText,
      bg: customCatColor.tailwindBg,
      border: customCatColor.tailwindBorder,
      bar_color: customCatColor.tailwindBar,
      hex: customCatColor.hex,
      type: newType,
      slug: customCatName.toLowerCase().replace(/\s+/g, '_')
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([newCatData])
      .select()
      .single();

    if (!error && data) {
      const catId = data.slug || data.id;
      setCategories(prev => ({
        ...prev,
        [catId]: {
          id: data.id,
          label: data.label,
          iconName: data.icon_name,
          color: data.color,
          bg: data.bg,
          border: data.border,
          barColor: data.bar_color,
          hex: data.hex,
          type: data.type as TransactionType
        }
      }));
      setNewCategory(catId);
      setIsCategoryManagerOpen(false);
    }
  };

  const openCategoryManager = (id: string | null = null) => {
    setEditingCategoryId(id);
    if (id && categories[id]) {
      const cat = categories[id];
      setCustomCatName(cat.label);
      setCustomCatIconName(cat.iconName);
      const paletteColor = COLOR_PALETTE.find(c => c.hex === cat.hex) || COLOR_PALETTE[0];
      setCustomCatColor(paletteColor);
    } else {
      setCustomCatName('');
      setCustomCatIconName('Tag');
      setCustomCatColor(COLOR_PALETTE[0]);
    }
    setIsCategoryManagerOpen(true);
  };

  const formatMoney = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const filterOptions = [
    { id: 'today', label: 'Hoje' },
    { id: '7', label: '7 dias' },
    { id: '15', label: '15 dias' },
    { id: '30', label: '30 dias' },
    { id: 'current_month', label: 'Mês Atual' },
    { id: 'last_month', label: 'Mês Passado' },
    { id: 'this_year', label: 'Este Ano' },
    { id: 'all', label: 'Tudo' },
  ];

  const filteredTransactions = transactions.filter(t => {
    if (dateFilter === 'all') return true;
    const tDate = new Date(t.date + 'T12:00:00');
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateFilter === 'today') {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      return tDate >= todayStart && tDate <= today;
    }
    if (dateFilter === 'current_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return tDate >= startOfMonth && tDate <= today;
    }
    if (dateFilter === 'last_month') {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      return tDate >= startOfLastMonth && tDate <= endOfLastMonth;
    }
    const days = parseInt(dateFilter);
    if (!isNaN(days)) {
      const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - days);
      return tDate >= cutoff && tDate <= today;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalBalance = transactions.reduce((acc, item) => item.type === TransactionType.INCOME ? acc + item.amount : acc - item.amount, 0);
  const periodIncome = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const periodExpense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);

  const expensesByCategory = Object.keys(categories)
    .filter(catKey => categories[catKey].type === TransactionType.EXPENSE)
    .map(catKey => {
      const total = filteredTransactions
        .filter(t => t.type === TransactionType.EXPENSE && t.category === catKey)
        .reduce((sum, t) => sum + t.amount, 0);
      return { key: catKey, total, ...categories[catKey] };
    })
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total);

  const chartData = expensesByCategory.map(cat => ({
    name: cat.label, value: cat.total, fill: cat.hex, ...cat
  }));

  const topExpense = expensesByCategory.length > 0 ? expensesByCategory[0] : null;

  const resetForm = () => {
    setNewTitle(''); setNewAmount(''); setNewType(TransactionType.EXPENSE); setNewCategory('food');
    setNewDate(new Date().toISOString().split('T')[0]); setAiInput(''); setAiMode(true);
    setIsCategoryManagerOpen(false); setIsEditMode(false);
  };

  const handleAiSmartAdd = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await smartParseTransaction(aiInput);
      if (result) {
        if (result.title) setNewTitle(result.title);
        if (result.amount) setNewAmount(result.amount.toString());
        if (result.type) setNewType(result.type as TransactionType);
        if (result.category) setNewCategory(result.category);
        if (result.date) setNewDate(result.date);
        setAiMode(false);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
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

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const contextData = {
        balance: totalBalance,
        recentTransactions: transactions.slice(0, 10).map(t => ({
          title: t.title, amount: t.amount, type: t.type,
          category: categories[t.category]?.label || 'Outros', date: t.date
        }))
      };
      const aiResponse = await chatWithAssistant(chatHistory, userMsg, contextData);
      setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Desculpe, tive um problema ao processar sua solicitação." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateTips = async () => {
    if (!topExpense) return;
    setIsTipsLoading(true);
    try {
      const examples = filteredTransactions
        .filter(t => t.category === topExpense.key)
        .slice(0, 3)
        .map(t => `${t.title} (R$${t.amount})`);
      const tips = await getExpenseTips(topExpense.label, topExpense.total, examples);
      setAiTips(tips);
    } finally {
      setIsTipsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) return;
    const doc = new jsPDF();
    const periodLabel = filterOptions.find(o => o.id === dateFilter)?.label;
    doc.setFontSize(22); doc.setTextColor(124, 58, 237); doc.text('Relatorio Financeiro Rege', 20, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Periodo: ${periodLabel}`, 20, 28);
    const tableData = filteredTransactions.map(tx => [
      new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR'),
      tx.title, categories[tx.category]?.label || 'Outros',
      tx.type === TransactionType.INCOME ? 'Entrada' : 'Saida', formatMoney(tx.amount)
    ]);
    (doc as any).autoTable({
      startY: 50, head: [['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor']], body: tableData,
      theme: 'grid', headStyles: { fillColor: [124, 58, 237] }
    });
    doc.save(`rege-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR'),
      tx.title,
      categories[tx.category]?.label || 'Outros',
      tx.type === TransactionType.INCOME ? 'Entrada' : 'Saida',
      tx.amount.toFixed(2).replace('.', ',')
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rege-transacoes-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-violet-600 mb-4" size={40} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Preparando suas finanças...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (currentPage === 'signup') {
      return (
        <SignUpPage
          onBackToLogin={() => setCurrentPage('login')}
          onViewTerms={() => setCurrentPage('terms')}
          onViewPrivacy={() => setCurrentPage('privacy')}
        />
      );
    }
    if (currentPage === 'terms') {
      return <TermsOfUse onBack={() => setCurrentPage('signup')} />;
    }
    if (currentPage === 'privacy') {
      return <PrivacyPolicy onBack={() => setCurrentPage('signup')} />;
    }
    return <LoginPage onGoToSignUp={() => setCurrentPage('signup')} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center">
      <div className="w-full max-w-md bg-zinc-950 min-h-screen flex flex-col relative shadow-2xl overflow-hidden">

        {/* Header */}
        <header className="p-6 pb-2 flex items-center justify-between z-10">
          {/* Menu de Perfil (Logo + Titulo) */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 group transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:shadow-violet-600/40 transition-shadow">
                <Wallet size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Rege <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </h1>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-12 left-0 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-zinc-800 mb-1">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Usuário</p>
                  <p className="text-xs font-bold text-zinc-300 truncate">{user?.user_metadata?.full_name || user?.email}</p>
                </div>
                <button
                  onClick={() => { setIsProfileOpen(true); setIsUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <User size={16} />
                  <span className="text-sm font-bold">Meus dados</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-bold">Sair da conta</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 relative">
            <button
              ref={exportMenuRef}
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all relative"
            >
              <Download size={20} />
              {isExportMenuOpen && (
                <div className="absolute top-12 right-0 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={exportToPDF} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors">
                    <FileText size={16} />
                    <span className="text-sm font-bold">Documento (PDF)</span>
                  </button>
                  <button onClick={exportToCSV} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors">
                    <FileSpreadsheet size={16} />
                    <span className="text-sm font-bold">Planilha (CSV)</span>
                  </button>
                </div>
              )}
            </button>
            <button onClick={() => { setIsReportOpen(true); setAiTips(null); }} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all">
              <LucidePieChart size={20} />
            </button>
            <button onClick={() => setIsAssistantOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-violet-400 hover:bg-violet-900/20 transition-all relative">
              <Sparkles size={20} />
            </button>
          </div>
        </header>

        {/* Daily Quote */}
        {dailyQuote && (
          <div className="px-6 mt-4">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex gap-3 items-start backdrop-blur-sm relative group">
              <div className="p-2 bg-violet-500/10 rounded-full text-violet-400 mt-0.5"><Quote size={14} className="fill-current" /></div>
              <p className="text-zinc-200 text-sm font-medium italic leading-relaxed">"{dailyQuote}"</p>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="px-6 mt-6">
          <div className="bg-zinc-900 p-7 rounded-[2.5rem] shadow-2xl border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-[80px] -mr-16 -mt-16"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Saldo Total</span>
                <div className="text-4xl font-black text-white mt-2 tracking-tighter">{formatMoney(totalBalance)}</div>
              </div>
              <div className="bg-zinc-950/50 px-3.5 py-1.5 rounded-full border border-white/5">
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wide">
                  {filterOptions.find(o => o.id === dateFilter)?.label}
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-10 relative z-10">
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <TrendingUp size={12} /> Entrada
                </span>
                <span className="text-lg font-bold text-zinc-100">{formatMoney(periodIncome)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Saída <TrendingDown size={12} />
                </span>
                <span className="text-lg font-bold text-zinc-100">{formatMoney(periodExpense)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 px-6 pb-28 overflow-y-auto custom-scrollbar mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white tracking-tight">Atividade</h2>
            <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-zinc-800">
              <Calendar size={12} /> {filterOptions.find(o => o.id === dateFilter)?.label} <ChevronDown size={12} className={`transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isFilterMenuOpen && (
            <div className="mb-6 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
              {filterOptions.map(opt => (
                <button key={opt.id} onClick={() => { setDateFilter(opt.id); setIsFilterMenuOpen(false); }} className={`py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${dateFilter === opt.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-20 opacity-30 flex flex-col items-center">
                <Wallet className="text-zinc-700 mb-4" size={32} />
                <p className="text-zinc-500 font-medium">Nenhum lançamento registrado.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const catConfig = categories[tx.category] || categories.other;
                const CategoryIcon = ICON_LIBRARY[catConfig.iconName] || Tag;
                return (
                  <div key={tx.id} className="bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800/40 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${catConfig.bg} ${catConfig.color}`}>
                        <CategoryIcon size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-100 text-sm">{tx.title}</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{catConfig.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-base ${tx.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'} {formatMoney(tx.amount)}
                      </span>
                      <button onClick={() => handleDelete(tx.id)} className="text-zinc-800 hover:text-rose-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FAB */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20">
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-violet-600 hover:bg-violet-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 shadow-violet-600/40">
            <Plus size={32} />
          </button>
        </div>

        {/* Modal: Lançamento */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="bg-zinc-950 w-full max-w-sm rounded-t-[3rem] border-t border-zinc-800 shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="p-8 pb-4 flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  {isCategoryManagerOpen ? 'Nova Categoria' : 'Lançamento'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-400"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                {isCategoryManagerOpen ? (
                  <form onSubmit={handleSaveCategory} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome</label>
                      <input type="text" placeholder="Ex: Investimento" className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-5 font-bold focus:outline-none" value={customCatName} onChange={(e) => setCustomCatName(e.target.value)} autoFocus />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Ícone</label>
                      <div className="grid grid-cols-6 gap-2 p-3 bg-zinc-900 rounded-2xl h-40 overflow-y-auto">
                        {Object.keys(ICON_LIBRARY).map(k => (
                          <button key={k} type="button" onClick={() => setCustomCatIconName(k)} className={`p-3 rounded-xl flex items-center justify-center ${customCatIconName === k ? 'bg-violet-600 text-white' : 'text-zinc-600'}`}>
                            {React.createElement(ICON_LIBRARY[k], { size: 20 })}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-white text-zinc-900 font-black text-xs uppercase tracking-widest py-5 rounded-2xl">Salvar Categoria</button>
                  </form>
                ) : (
                  <>
                    <div className="flex gap-2 mb-6">
                      <button onClick={() => setAiMode(true)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl border-2 transition-all ${aiMode ? 'border-violet-600/50 bg-violet-600/10 text-violet-400' : 'border-zinc-900 text-zinc-600'}`}>IA</button>
                      <button onClick={() => setAiMode(false)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl border-2 transition-all ${!aiMode ? 'border-zinc-700 bg-zinc-800 text-white' : 'border-zinc-900 text-zinc-600'}`}>Manual</button>
                    </div>
                    {aiMode ? (
                      <div className="space-y-6">
                        <textarea placeholder="Ex: Recebi meu salário de 3500 reais hoje..." className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-[2rem] p-6 h-40 resize-none text-lg font-medium focus:outline-none" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
                        <div className="flex gap-3">
                          <button onClick={startListening} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-900 text-zinc-400'}`}><Mic size={18} /> Voz</button>
                          <button onClick={handleAiSmartAdd} disabled={isAiLoading || !aiInput.trim()} className="flex-[2] bg-violet-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2">
                            {isAiLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={16} /> Processar</>}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleAddTransaction} className="space-y-6">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Valor</label>
                          <input type="number" step="0.01" className="w-full bg-zinc-900 border-2 border-zinc-800 text-white text-4xl font-black rounded-[2rem] py-8 px-8 focus:outline-none" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0,00" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Descrição</label>
                          <input type="text" className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-2xl py-4 px-6 font-bold focus:outline-none" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="O que você comprou?" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Tipo</label>
                            <div className="flex bg-zinc-900 p-1 rounded-2xl border-2 border-zinc-800">
                              <button type="button" onClick={() => setNewType(TransactionType.INCOME)} className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center ${newType === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-700'}`}>
                                <ArrowUpRight size={18} />
                                <span className="text-[9px] font-black uppercase mt-1">Entrada</span>
                              </button>
                              <button type="button" onClick={() => setNewType(TransactionType.EXPENSE)} className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center ${newType === TransactionType.EXPENSE ? 'bg-rose-500/10 text-rose-400' : 'text-zinc-700'}`}>
                                <ArrowDownLeft size={18} />
                                <span className="text-[9px] font-black uppercase mt-1">Saída</span>
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Data</label>
                            <input type="date" className="w-full bg-zinc-900 border-2 border-zinc-800 text-white rounded-2xl py-4 px-4 font-bold focus:outline-none" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categoria</label>
                            <button type="button" onClick={() => setIsEditMode(!isEditMode)} className="text-[9px] font-black text-violet-400 uppercase tracking-widest">{isEditMode ? 'Feito' : 'Editar'}</button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {Object.keys(categories)
                              .filter(k => categories[k].type === newType)
                              .map(k => {
                                const cat = categories[k];
                                const Icon = ICON_LIBRARY[cat.iconName] || Tag;
                                return (
                                  <button key={k} type="button" onClick={() => { if (isEditMode) { /* Sem lógica de edição por enquanto */ } else setNewCategory(k); }} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${newCategory === k ? `bg-zinc-800 ${cat.border} ${cat.color}` : 'bg-zinc-900/50 border-zinc-900 text-zinc-600'}`}>
                                    <Icon size={20} />
                                    <span className="text-[8px] font-black uppercase mt-2 truncate w-full text-center">{cat.label}</span>
                                  </button>
                                );
                              })}
                            <button type="button" onClick={() => openCategoryManager(null)} className="flex flex-col items-center p-3 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-700"><Plus size={20} /><span className="text-[8px] font-black uppercase mt-2">Nova</span></button>
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-violet-600 text-white font-black text-xs uppercase tracking-widest py-6 rounded-[2rem] mt-4 shadow-xl active:scale-95 transition-all">Salvar Lançamento</button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Assistant */}
        {isAssistantOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setIsAssistantOpen(false)} />
            <div className="bg-zinc-950 w-full max-w-sm rounded-t-[3rem] border-t border-zinc-800 shadow-2xl relative z-10 flex flex-col h-[90vh]">
              <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-600/10 rounded-xl text-violet-400"><Bot size={20} /></div>
                  <h3 className="font-black text-white uppercase tracking-tighter">Rege IA</h3>
                </div>
                <button onClick={() => setIsAssistantOpen(false)} className="text-zinc-600"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-300'}`}>{m.text}</div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 text-zinc-500 px-5 py-3 rounded-2xl text-sm">
                      <Loader2 className="animate-spin" size={16} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-8 pt-0 flex gap-2">
                <input type="text" className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none" placeholder="Pergunte qualquer coisa..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()} />
                <button onClick={handleSendChatMessage} className="p-4 bg-violet-600 text-white rounded-2xl">
                  {isChatLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Analysis/Statistics */}
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity" onClick={() => setIsReportOpen(false)} />
            <div className="bg-zinc-950 w-full max-sm:rounded-t-[3rem] sm:rounded-[3rem] border-t sm:border border-zinc-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col overflow-hidden">
              <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Análise</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">Período: {filterOptions.find(o => o.id === dateFilter)?.label}</p>
                </div>
                <button onClick={() => setIsReportOpen(false)} className="p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-all"><X size={22} /></button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 pb-20">
                {expensesByCategory.length > 0 ? (
                  <>
                    {/* Recharts Container */}
                    <div className="mb-8 w-full h-[320px] relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          {React.createElement(Pie as any, {
                            data: chartData,
                            cx: "50%",
                            cy: "50%",
                            innerRadius: 80,
                            outerRadius: 110,
                            paddingAngle: 5,
                            dataKey: "value",
                            activeIndex: activeIndex !== null ? activeIndex : undefined,
                            activeShape: (props: any) => {
                              const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                              return (
                                <g>
                                  <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} className="transition-all duration-300" />
                                  <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 15} startAngle={startAngle} endAngle={endAngle} fill={fill} />
                                </g>
                              );
                            },
                            onMouseEnter: (_: any, index: number) => setActiveIndex(index),
                            onMouseLeave: () => setActiveIndex(null),
                            animationBegin: 0,
                            animationDuration: 1500,
                            stroke: "none"
                          }, chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />))}
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest opacity-60">Gasto Período</span>
                        <span className="text-white font-black text-2xl tracking-tighter mt-0.5">{formatMoney(periodExpense)}</span>
                      </div>
                    </div>

                    {topExpense && (
                      <div className="mb-10 bg-zinc-900/50 rounded-[2rem] p-6 border-2 border-zinc-800/80 shadow-inner group">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400"><Lightbulb size={20} className="fill-current opacity-40" /></div>
                          <h4 className="text-violet-300 font-black text-[11px] uppercase tracking-widest">Rege Ai</h4>
                        </div>
                        <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-5">
                          Sua maior despesa é <strong>{topExpense.label}</strong> representando {((topExpense.total / periodExpense) * 100).toFixed(0)}% do seu orçamento.
                        </p>

                        {!aiTips ? (
                          <button onClick={handleGenerateTips} disabled={isTipsLoading} className="w-full py-4 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border-2 border-violet-500/20 flex items-center justify-center gap-3 transition-all active:scale-95">
                            {isTipsLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            {isTipsLoading ? 'Consultando...' : 'Pedir Conselhos à IA'}
                          </button>
                        ) : (
                          <div className="bg-zinc-950/80 rounded-2xl p-5 text-[12px] text-zinc-300 leading-relaxed border border-zinc-800/80 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="whitespace-pre-line font-medium opacity-90">{aiTips}</div>
                            <button onClick={() => setAiTips(null)} className="text-[10px] font-black text-zinc-600 mt-4 uppercase tracking-widest hover:text-zinc-400 transition-colors">Fechar Dicas</button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-6 px-1">Distribuição</h4>
                      {expensesByCategory.map((cat, index) => {
                        const percentage = (cat.total / periodExpense) * 100;
                        const CatIcon = ICON_LIBRARY[cat.iconName] || Tag;
                        return (
                          <div key={cat.key} className="relative transition-all duration-300 rounded-3xl">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${cat.bg} ${cat.color} border border-white/5`}><CatIcon size={18} /></div>
                                <div>
                                  <span className="text-zinc-100 font-bold text-sm block">{cat.label}</span>
                                  <span className="text-[10px] text-zinc-500 font-bold">{percentage.toFixed(0)}% do total</span>
                                </div>
                              </div>
                              <span className="text-zinc-100 font-black text-sm">{formatMoney(cat.total)}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                              <div className={`h-full ${cat.barColor} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-zinc-600 text-sm font-bold uppercase tracking-widest opacity-40">Nenhum gasto registrado</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdate={async () => {
          const { data: { user: updatedUser } } = await supabase.auth.getUser();
          setUser(updatedUser);
        }}
      />
    </div>
  );
}
