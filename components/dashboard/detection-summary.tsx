"use client";

import React from "react";

export function DetectionSummary({ summary }: { summary?: any[] | null }) {
    if (!summary || summary.length === 0) {
        return <p className="text-slate-400">No animals detected.</p>;
    }
    return (
        <div className="space-y-2">
            {summary.map((s: any) => (
                <div key={s.animal} className="p-3 bg-slate-800/40 rounded border border-slate-700 flex justify-between items-center">
                    <div>
                        <div className="text-white font-medium capitalize">{s.animal}</div>
                        <div className="text-slate-400 text-sm">{s.count} detected</div>
                    </div>
                    <div className="text-emerald-400 font-semibold">{(s.average_confidence * 100).toFixed(1)}%</div>
                </div>
            ))}
        </div>
    );
}
