// components/charts/SpeciesPieChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#34d399', '#06b6d4', '#60a5fa', '#a78bfa', '#f97316', '#fb7185', '#f59e0b'];

export default function SpeciesPieChart({ userId, hours = 24 }: { userId?: string; hours?: number }) {
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
                    .gte('timestamp', since)
                    .order('animal_name', { ascending: true });

                const agg: Record<string, number> = {};
                (logs || []).forEach((r: any) => {
                    const name = r.animal_name || 'Unknown';
                    agg[name] = (agg[name] || 0) + (r.animal_count || 0);
                });

                const arr = Object.entries(agg).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
                setData(arr);
            } catch (err) {
                console.error('SpeciesPieChart error', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId, hours]);

    if (!userId) return <p className="text-sm text-slate-400">Login to see charts</p>;

    return (
        <div className="h-56 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            {loading ? (
                <p className="text-slate-400">Loading species distribution...</p>
            ) : data.length === 0 ? (
                <p className="text-slate-400">No data</p>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie dataKey="value" data={data} outerRadius={80} fill="#8884d8" label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0b1220' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
