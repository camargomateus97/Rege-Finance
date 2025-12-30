
import React from 'react';
import { 
  Utensils, Car, Home, Film, HeartPulse, ShoppingBag, Banknote, MoreHorizontal,
  Crown, Tag, Gift, Globe, Briefcase, GraduationCap, Gamepad2, Music, Plane, Star, 
  Smile, Wrench, Zap, Book, Coffee, Anchor, Sun, Moon, Umbrella, Dog, Cat, 
  Smartphone, Monitor, Headphones, Scissors, Key, Sparkles
} from 'lucide-react';
import { Category, ColorOption, TransactionType } from './types';

export const ICON_LIBRARY: Record<string, React.ElementType> = {
  Utensils, Car, Home, Film, HeartPulse, ShoppingBag, Banknote, MoreHorizontal,
  Crown, Tag, Gift, Globe, Briefcase, GraduationCap, Gamepad2, Music, Plane, Star, 
  Smile, Wrench, Zap, Book, Coffee, Anchor, Sun, Moon, Umbrella, Dog, Cat, 
  Smartphone, Monitor, Headphones, Scissors, Key, Sparkles
};

export const DEFAULT_CATEGORIES: Record<string, Category> = {
  income: { id: 'income', label: 'Salário', iconName: 'Banknote', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', barColor: 'bg-emerald-500', hex: '#10b981', type: TransactionType.INCOME },
  extra_income: { id: 'extra_income', label: 'Renda Extra', iconName: 'Sparkles', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', barColor: 'bg-emerald-500', hex: '#10b981', type: TransactionType.INCOME },
  kingdom: { id: 'kingdom', label: 'Reino', iconName: 'Crown', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', barColor: 'bg-yellow-500', hex: '#eab308', type: TransactionType.EXPENSE },
  food: { id: 'food', label: 'Alimentação', iconName: 'Utensils', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', barColor: 'bg-orange-500', hex: '#f97316', type: TransactionType.EXPENSE },
  transport: { id: 'transport', label: 'Transporte', iconName: 'Car', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', barColor: 'bg-blue-500', hex: '#3b82f6', type: TransactionType.EXPENSE },
  home: { id: 'home', label: 'Casa', iconName: 'Home', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', barColor: 'bg-indigo-500', hex: '#6366f1', type: TransactionType.EXPENSE },
  entertainment: { id: 'entertainment', label: 'Lazer', iconName: 'Film', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', barColor: 'bg-pink-500', hex: '#ec4899', type: TransactionType.EXPENSE },
  health: { id: 'health', label: 'Saúde', iconName: 'HeartPulse', color: 'text-red-400', bg: 'bg-zinc-500/10', border: 'border-red-500/20', barColor: 'bg-red-500', hex: '#ef4444', type: TransactionType.EXPENSE },
  shopping: { id: 'shopping', label: 'Compras', iconName: 'ShoppingBag', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', barColor: 'bg-purple-500', hex: '#a855f7', type: TransactionType.EXPENSE },
  other: { id: 'other', label: 'Outros', iconName: 'MoreHorizontal', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', barColor: 'bg-zinc-500', hex: '#71717a', type: TransactionType.EXPENSE },
};

export const COLOR_PALETTE: ColorOption[] = [
  { name: 'cyan', hex: '#06b6d4', tailwindText: 'text-cyan-400', tailwindBg: 'bg-cyan-500/10', tailwindBorder: 'border-cyan-500/20', tailwindBar: 'bg-cyan-500' },
  { name: 'lime', hex: '#84cc16', tailwindText: 'text-lime-400', tailwindBg: 'bg-lime-500/10', tailwindBorder: 'border-lime-500/20', tailwindBar: 'bg-lime-500' },
  { name: 'fuchsia', hex: '#d946ef', tailwindText: 'text-fuchsia-400', tailwindBg: 'bg-fuchsia-500/10', tailwindBorder: 'border-fuchsia-500/20', tailwindBar: 'bg-fuchsia-500' },
  { name: 'yellow', hex: '#eab308', tailwindText: 'text-yellow-400', tailwindBg: 'bg-yellow-500/10', tailwindBorder: 'border-yellow-500/20', tailwindBar: 'bg-yellow-500' },
  { name: 'rose', hex: '#f43f5e', tailwindText: 'text-rose-400', tailwindBg: 'bg-rose-500/10', tailwindBorder: 'border-rose-500/20', tailwindBar: 'bg-rose-500' },
  { name: 'indigo', hex: '#6366f1', tailwindText: 'text-indigo-400', tailwindBg: 'bg-indigo-500/10', tailwindBorder: 'border-indigo-500/20', tailwindBar: 'bg-indigo-500' },
  { name: 'orange', hex: '#f97316', tailwindText: 'text-orange-400', tailwindBg: 'bg-orange-500/10', tailwindBorder: 'border-orange-500/20', tailwindBar: 'bg-orange-500' },
  { name: 'blue', hex: '#3b82f6', tailwindText: 'text-blue-400', tailwindBg: 'bg-blue-500/10', tailwindBorder: 'border-blue-500/20', tailwindBar: 'bg-blue-500' },
  { name: 'red', hex: '#ef4444', tailwindText: 'text-red-400', tailwindBg: 'bg-red-500/10', tailwindBorder: 'border-red-500/20', tailwindBar: 'bg-red-500' },
  { name: 'purple', hex: '#a855f7', tailwindText: 'text-purple-400', tailwindBg: 'bg-purple-500/10', tailwindBorder: 'border-purple-500/20', tailwindBar: 'bg-purple-500' },
];
