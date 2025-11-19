import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Play, FileVideo, AlertCircle, Crosshair } from 'lucide-react';

interface BBoxViewerProps {
    url: string | null;
    type: string; // 'image' or 'video'
    detections: any[];
}

export default function BBoxViewer({ url, type, detections }: BBoxViewerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // 1. Handle Missing Media
    if (!url) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-lg text-slate-500">
                <p>Media not available</p>
            </div>
        );
    }

    // 2. VIDEO MODE (Smart Player)
    if (type === 'video') {
        // Filter logic: Find detection boxes relevant to the current video second.
        // We check if 'd.bbox' exists and isn't just empty zeros [0,0,0,0]
        const activeBoxes = detections.filter(d => {
            if (!d.timestamp || !d.bbox || d.bbox.every((n: number) => n === 0)) return false;
            const t = typeof d.timestamp === 'string' ? parseFloat(d.timestamp) : d.timestamp;
            // Show box if within 0.5s of current time
            return t >= currentTime - 0.5 && t <= currentTime + 0.5;
        });

        const hasOverlayData = activeBoxes.length > 0;

        return (
            <div className="relative w-full flex flex-col gap-4">
                <div className="relative bg-black rounded-lg overflow-hidden border border-slate-700 aspect-video flex items-center justify-center group shadow-2xl">

                    {/* A. VIDEO PLAYER */}
                    <video
                        ref={videoRef}
                        src={url}
                        controls
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    >
                        Your browser does not support the video tag.
                    </video>

                    {/* B. REACT OVERLAYS (Only renders if backend sent coordinates) */}
                    {activeBoxes.map((d, i) => {
                        const [x1, y1, x2, y2] = d.bbox;
                        const color = d.dangerous ? 'red' : 'emerald';

                        return (
                            <div
                                key={`${i}-${d.timestamp}`}
                                className={`absolute border-2 z-20 pointer-events-none transition-all duration-100 ease-linear`}
                                style={{
                                    // Convert Normalized (0-1) to Percentage
                                    left: `${x1 * 100}%`,
                                    top: `${y1 * 100}%`,
                                    width: `${(x2 - x1) * 100}%`,
                                    height: `${(y2 - y1) * 100}%`,
                                    borderColor: d.dangerous ? '#ef4444' : '#10b981',
                                    boxShadow: d.dangerous ? '0 0 20px rgba(239,68,68,0.5)' : 'none'
                                }}
                            >
                                {/* Label & Accuracy Badge */}
                                <div className="absolute -top-9 left-0.5 flex flex-col items-start">
                                    <span className={`text-white text-[10px] font-bold px-2 py-1 rounded-t-md flex items-center gap-1 uppercase tracking-wider ${d.dangerous ? 'bg-red-600' : 'bg-emerald-600'
                                        }`}>
                                        {d.dangerous && <AlertCircle className="w-3 h-3" />}
                                        {d.animal}
                                    </span>
                                    <span className="bg-black/80 backdrop-blur text-white text-[9px] font-mono px-2 py-0.5 rounded-b-md border-t-0 border border-white/20 flex items-center gap-1">
                                        <Crosshair className="w-2 h-2 text-yellow-400" />
                                        CONF: {Math.round(d.confidence * 100)}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Bar */}
                <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-full text-purple-400">
                            {hasOverlayData ? <Crosshair className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-sm text-slate-200 font-medium">
                                {hasOverlayData ? "Live AI Overlay" : "Processed Footage"}
                            </p>
                            <p className="text-xs text-slate-500">
                                {hasOverlayData ? "Rendering detection boxes in real-time" : "Visuals pre-rendered by server"}
                            </p>
                        </div>
                    </div>
                    <div className="text-right font-mono text-slate-500 text-xs">
                        {currentTime.toFixed(2)}s
                    </div>
                </div>
            </div>
        );
    }

    // 3. IMAGE MODE
    return (
        <div className="relative inline-block w-full">
            <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                <Image
                    src={url}
                    alt="AI Analysis Result"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto"
                    unoptimized
                />

                {detections.map((d: any, i: number) => {
                    const bbox = d.bbox || [];
                    if (bbox.length !== 4) return null;
                    const [x1, y1, x2, y2] = bbox;

                    return (
                        <div
                            key={i}
                            className={`absolute border-2 z-10 hover:opacity-100 opacity-80 transition ${d.dangerous ? 'border-red-500' : 'border-emerald-500'
                                }`}
                            style={{
                                left: x1, top: y1, width: x2 - x1, height: y2 - y1,
                            }}
                        >
                            <span className={`absolute -top-6 left-0 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${d.dangerous ? 'bg-red-600' : 'bg-emerald-600'
                                }`}>
                                {d.animal} {Math.round(d.confidence * 100)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}