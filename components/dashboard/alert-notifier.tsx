'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, X, BellRing, CheckCircle } from 'lucide-react';

type Alert = {
    id: string;
    animal_name: string;
    message: string;
    alert_level: string;
    created_at: string;
};

export default function AlertNotifier({ userId }: { userId: string }) {
    const [toasts, setToasts] = useState<Alert[]>([]);
    // 1. Track IDs that we have already displayed to prevent duplicates
    const seenIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        const fetchNewAlerts = async () => {
            // Fetch unread alerts
            const { data } = await supabase
                .from('danger_alerts')
                .select('*')
                .eq('user_id', userId)
                .eq('is_read', false)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data && data.length > 0) {
                // 2. Filter out alerts we've already seen in this session
                const newAlerts = data.filter(alert => !seenIds.current.has(alert.id));

                if (newAlerts.length > 0) {
                    // Mark them as seen immediately
                    newAlerts.forEach(a => seenIds.current.add(a.id));

                    // Add to UI (State) - Append new ones, don't replace everything
                    setToasts(prev => [...prev, ...newAlerts]);

                    // Optional: Play sound here if needed
                }
            }
        };

        // Poll every 3 seconds
        const interval = setInterval(fetchNewAlerts, 3000);
        fetchNewAlerts(); // Initial run

        return () => clearInterval(interval);
    }, [userId]);

    // 3. Handle Dismiss
    const dismissAlert = async (id: string) => {
        // Remove from UI
        setToasts((prev) => prev.filter((t) => t.id !== id));

        // Mark read in DB
        await supabase.from('danger_alerts').update({ is_read: true }).eq('id', id);
    };

    // 4. Auto-dismiss logic (Optional: Remove older toasts after 10 seconds)
    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => {
                const oldest = toasts[0];
                // Only auto-dismiss non-critical alerts, or remove this check to auto-dismiss all
                if (oldest && oldest.alert_level !== 'critical') {
                    dismissAlert(oldest.id);
                }
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [toasts]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {toasts.map((alert) => (
                <div
                    key={alert.id}
                    className={`
                        pointer-events-auto
                        relative overflow-hidden rounded-lg border shadow-2xl backdrop-blur-md 
                        transition-all duration-500 animate-in slide-in-from-right-full fade-in
                        ${alert.alert_level === 'critical'
                            ? 'bg-red-950/95 border-red-500/50 text-white shadow-red-900/20'
                            : 'bg-slate-900/95 border-emerald-500/50 text-slate-100'}
                    `}
                >
                    {/* Side Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.alert_level === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                        }`} />

                    <div className="p-4 pl-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-1">
                                {alert.alert_level === 'critical' ? (
                                    <BellRing className="w-5 h-5 text-red-400" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                )}
                                <h4 className="font-bold uppercase tracking-wide text-sm">
                                    {alert.animal_name} Detected
                                </h4>
                            </div>
                            <button
                                onClick={() => dismissAlert(alert.id)}
                                className="text-white/50 hover:text-white transition p-1 hover:bg-white/10 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs opacity-90 mt-1 leading-relaxed">
                            {alert.message}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}