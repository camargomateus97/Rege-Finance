
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Category {
  id: string;
  label: string;
  iconName: string;
  color: string;
  bg: string;
  border: string;
  barColor: string;
  hex: string;
  type: TransactionType;
}

export interface Transaction {
  id: string | number;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export interface ColorOption {
  name: string;
  hex: string;
  tailwindText: string;
  tailwindBg: string;
  tailwindBorder: string;
  tailwindBar: string;
}
