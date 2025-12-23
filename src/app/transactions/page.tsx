'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { formatCurrency } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  ArrowUpDown,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { EditTransactionDialog } from '@/components/edit-transaction-dialog';
import { Card } from '@/components/ui/card';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }
    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }
    if (search) {
      query = query.ilike('description', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to fetch transactions');
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [user, typeFilter, categoryFilter, search]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete transaction');
    } else {
      toast.success('Transaction deleted');
      fetchTransactions();
    }
  };

  const categories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input 
                placeholder="Search description..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-100 dark:bg-zinc-900">
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-24 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-48 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-20 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-16 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded ml-auto"></div></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                    No transactions found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id} className="group">
                    <TableCell className="text-zinc-500 font-medium">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {t.type === 'income' ? 
                          <ArrowUpCircle className="h-4 w-4 text-emerald-500 shrink-0" /> : 
                          <ArrowDownCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        }
                        <span className="font-medium">{t.description || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 capitalize">
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingTransaction(t);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <EditTransactionDialog 
          transaction={editingTransaction} 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          onSuccess={fetchTransactions} 
        />
      </main>
    </div>
  );
}
