// components/charts/TopSpeciesBarChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TopSpeciesBarChart({ userId, hours = 168, top = 6 }: { userId?: string; hours?: number; top?: number }) {
    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);

        (async () => {
            try {
                const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
                const { data: logs } = await supabase
                    .from('detection_logs')
                    .select('animal_name, animal_count')
                    .eq('user_id', userId)
                    .gte('timestamp', since);

                const agg: Record<string, number> = {};
                (logs || []).forEach((r: any) => {
                    const name = r.animal_name || 'Unknown';
                    agg[name] = (agg[name] || 0) + (r.animal_count || 0);
                });

                const arr = Object.entries(agg)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, top);

                setData(arr);
            } catch (err) {
                console.error('TopSpeciesBarChart error', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId, hours, top]);

    if (!userId) return <p className="text-sm text-slate-400">Login to see charts</p>;

    return (
        <div className="h-56 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            {loading ? (
                <p className="text-slate-400">Loading top species...</p>
            ) : data.length === 0 ? (
                <p className="text-slate-400">No data</p>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                        <Tooltip contentStyle={{ background: '#0b1220' }} itemStyle={{ color: '#fff' }} />
                        <Bar dataKey="value" fill="#34d399" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
