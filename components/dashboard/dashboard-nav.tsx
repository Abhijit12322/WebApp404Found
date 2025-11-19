'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Binoculars, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardNav({ user }: { user: User | null }) {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        toast.success('Logged out successfully');
        router.push('/');
    };

    return (
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition">
                        <Binoculars className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-lg font-bold text-white">WildGuard AI</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                    {user.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm text-slate-300 hidden sm:inline">{user.email}</span>
                        </div>
                    )}

                    <Link href="/settings">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </Link>

                    <Button
                        size="sm"
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    );
}
