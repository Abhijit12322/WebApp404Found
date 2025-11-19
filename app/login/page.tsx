'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Binoculars, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { signIn, signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const result = isSignUp ? await signUp(email, password) : await signIn(email, password);
            const { data, error } = result;
            if (error) {
                if (error.message.includes('already registered')) {
                    toast.error('Email already registered. Please sign in.');
                } else {
                    toast.error(error.message);
                }
                setIsLoading(false);
                return;
            }


            // For email not confirmed
            if (!data.user && data.session === null) {
                toast.error('Email not confirmed. Please check your inbox.');
                setIsLoading(false);
                return;
            }

            toast.success(isSignUp ? 'Account created! Check your email to confirm.' : 'Logged in successfully!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Binoculars className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <span className="text-xl font-bold text-white">WildGuard AI</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-400">
                        {isSignUp
                            ? 'Join WildGuard AI for wildlife monitoring'
                            : 'Sign in to your WildGuard AI account'}
                    </p>
                </div>

                {/* Card */}
                <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-white">
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </CardTitle>
                        <CardDescription>
                            {isSignUp
                                ? 'Enter your email and password to create an account'
                                : 'Enter your credentials to access the dashboard'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-slate-400">
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            </span>
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-emerald-400 hover:text-emerald-300 font-medium transition"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-slate-500">
                    <Link href="/" className="hover:text-slate-400 transition">
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
