'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Lion', count: 12 },
    { name: 'Elephant', count: 8 },
    { name: 'Zebra', count: 15 },
    { name: 'Giraffe', count: 5 },
    { name: 'Rhino', count: 3 },
];

export default function AnimalCountSection() {
    return (
        <Card className="border-slate-700 bg-slate-900/50">
            <CardHeader>
                <CardTitle className="text-white">Animal Count Statistics</CardTitle>
                <CardDescription>Detection count by species</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
