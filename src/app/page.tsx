'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchTransactions();
    }
  }, [user, authLoading, router, fetchTransactions]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-zinc-500">Loading your finances...</p>
        </div>
      </div>
    );
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Welcome back! Here&apos;s your summary in INR.</p>
          </div>
          <AddTransactionDialog onSuccess={fetchTransactions} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary text-primary-foreground shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs opacity-70 mt-1">Available across all accounts</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-emerald-100 dark:border-emerald-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Income</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Total earnings recorded</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-rose-100 dark:border-rose-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Expenses</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalExpense)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Total spending recorded</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-7">
          <Card className="md:col-span-4 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <CardTitle>Recent Transactions</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                  ))
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>No transactions found. Add your first one!</p>
                  </div>
                ) : (
                  transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {t.type === 'income' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{t.category}</p>
                          <p className="text-xs text-zinc-500">{t.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                        <p className="text-[10px] text-zinc-400">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 shadow-sm bg-zinc-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm opacity-70">Highest Spending Category</p>
                <p className="text-xl font-bold capitalize">
                  {transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, curr) => {
                      const existing = acc.find(a => a.category === curr.category);
                      if (existing) existing.amount += Number(curr.amount);
                      else acc.push({ category: curr.category, amount: Number(curr.amount) });
                      return acc;
                    }, [] as { category: string, amount: number }[])
                    .sort((a, b) => b.amount - a.amount)[0]?.category || 'None'}
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-sm opacity-70">Savings Rate</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">
                    {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                  </p>
                  <p className="text-xs opacity-50 pb-1">of total income</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
