'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Wallet, ArrowRight, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      try {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: trimmedPassword,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw error;
          toast.success('Registration successful! Please check your email for a confirmation link.');
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: trimmedPassword,
          });
          if (error) {
            if (error.message.toLowerCase().includes('confirm')) {
              toast.error('Please confirm your email address before logging in.');
              return;
            }
            throw error;
          }
          toast.success('Welcome back!');
          router.push('/');
          router.refresh();
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred during authentication');
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 p-4 dark:bg-zinc-950">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 mb-2"
          >
            <Wallet className="h-8 w-8" />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
              RupeeTrack
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Master your finances in Indian Rupees</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {isSignUp ? 'Create account' : 'Welcome back'}
                </CardTitle>
                <Sparkles className="h-5 w-5 text-primary opacity-50" />
              </div>
              <CardDescription>
                {isSignUp 
                  ? 'Join thousands of users tracking their ₹ INR expenses' 
                  : 'Enter your details to access your dashboard'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAuth}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-11 border-zinc-200 dark:border-zinc-800 focus:ring-primary"
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <Button variant="link" className="px-0 font-normal text-xs h-auto text-primary">
                        Forgot password?
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      className="pl-10 h-11 border-zinc-200 dark:border-zinc-800 focus:ring-primary"
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  className="w-full h-11 text-base font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? 'Get Started' : 'Sign In'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                  </div>
                </div>

                <div className="text-center text-sm text-zinc-500">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-semibold text-primary hover:underline underline-offset-4"
                  >
                    {isSignUp ? 'Log in' : 'Create an account'}
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          <br />
          Built with ❤️ for Indian Savers.
        </p>
      </div>
    </div>
  );
}
