export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'salary' | 'freelance' | 'business' | 'others' // Income
  | 'food' | 'rent' | 'transport' | 'shopping' | 'bills' | 'entertainment' | 'medical' | 'education'; // Expense

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

export const INCOME_CATEGORIES = ['salary', 'freelance', 'business', 'others'];
export const EXPENSE_CATEGORIES = ['food', 'rent', 'transport', 'shopping', 'bills', 'entertainment', 'medical', 'education', 'others'];
