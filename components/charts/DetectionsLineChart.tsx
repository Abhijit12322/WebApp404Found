// components/charts/DetectionsLineChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

type Point = { date: string; total: number };

export default function DetectionsLineChart({ userId, hours = 72 }: { userId?: string; hours?: number }) {
    const [data, setData] = useState<Point[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);

        (async () => {
            try {
                const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
                const { data: logs } = await supabase
                    .from('detection_logs')
                    .select('timestamp, animal_count')
                    .eq('user_id', userId)
                    .gte('timestamp', since)
                    .order('timestamp', { ascending: true });

                // group by hour
                const buckets = new Map<string, number>();
                (logs || []).forEach((row: any) => {
                    const d = new Date(row.timestamp);
                    // bucket by hour (YYYY-MM-DD HH:00)
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
                    buckets.set(key, (buckets.get(key) || 0) + (row.animal_count || 0));
                });

                // fill missing hours for smooth line
                const points: Point[] = [];
                const start = Date.now() - hours * 60 * 60 * 1000;
                for (let t = start; t <= Date.now(); t += 60 * 60 * 1000) {
                    const d = new Date(t);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
                    points.push({ date: key, total: buckets.get(key) || 0 });
                }

                setData(points);
            } catch (err) {
                console.error('DetectionsLineChart error', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId, hours]);

    if (!userId) return <p className="text-sm text-slate-400">Login to see charts</p>;

    return (
        <div className="h-56 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            {loading ? (
                <p className="text-slate-400">Loading chart...</p>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="date" minTickGap={20} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#0b1220' }} itemStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="total" stroke="#34d399" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
