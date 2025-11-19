'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Activity,
    Wifi,
    WifiOff,
    RefreshCw,
    Maximize,
    Camera,
    Minimize,
    Power, // New Power Icon
    Loader2
} from 'lucide-react';

export default function LiveMonitoringSection({ userId }: { userId?: string }) {
    const [isSystemOn, setIsSystemOn] = useState(false); // Default to Offline
    const [isOnline, setIsOnline] = useState(false);     // Tracks actual connection
    const [refreshKey, setRefreshKey] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Master Power Toggle
    const togglePower = () => {
        if (isSystemOn) {
            // Turn Off
            setIsSystemOn(false);
            setIsOnline(false);
        } else {
            // Turn On
            setIsSystemOn(true);
            setRefreshKey((prev) => prev + 1); // Trigger connection attempt
        }
    };

    // 2. Handle Reconnection (Only if system is on)
    const handleRefresh = () => {
        if (!isSystemOn) return;
        setIsOnline(false); // Reset status to trigger loading state
        setRefreshKey((prev) => prev + 1);
    };

    // 3. Fullscreen Logic
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    // 4. Snapshot Logic
    const takeSnapshot = () => {
        if (!isOnline) return;
        const canvas = document.createElement('canvas');
        const img = containerRef.current?.querySelector('img');
        if (img) {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d')?.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.download = `evidence-${Date.now()}.jpg`;
            link.href = canvas.toDataURL('image/jpeg');
            link.click();
        }
    };

    return (
        <div ref={containerRef} className={`flex flex-col h-full transition-all duration-500 ${isFullscreen ? 'bg-black p-10 flex items-center justify-center' : ''}`}>

            {/* HEADER CONTROLS */}
            {!isFullscreen && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${!isSystemOn ? 'bg-slate-600' :
                                isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-orange-500 animate-ping'
                            }`}></div>

                        <h3 className={`font-semibold text-sm tracking-wide transition-colors ${!isSystemOn ? 'text-slate-500' : 'text-slate-100'
                            }`}>
                            {!isSystemOn ? "SYSTEM OFFLINE" : isOnline ? "LIVE FEED A-1" : "CONNECTING..."}
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        {/* POWER BUTTON */}
                        <button
                            onClick={togglePower}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isSystemOn
                                    ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20'
                                }`}
                        >
                            <Power className="w-3.5 h-3.5" />
                            {isSystemOn ? "GO OFFLINE" : "GO ONLINE"}
                        </button>

                        {/* UTILS */}
                        <button
                            onClick={handleRefresh}
                            disabled={!isSystemOn}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-30"
                            title="Refresh Connection"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                            title="Fullscreen"
                        >
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* VIEWPORT */}
            <div className={`relative w-full bg-black overflow-hidden border shadow-2xl group transition-all duration-500 ${isFullscreen ? 'h-full w-auto aspect-video rounded-none' : 'aspect-video rounded-xl border-slate-800'
                }`}>

                {/* 1. THE LIVE STREAM (Only loaded if System is On) */}
                {isSystemOn && (
                    <img
                        key={refreshKey}
                        src={`/api/flask/video_feed?t=${refreshKey}`}
                        alt="Live Surveillance Feed"
                        className={`w-full h-full object-contain transition-opacity duration-700 ${isOnline ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setIsOnline(true)}
                        onError={() => setIsOnline(false)}
                    />
                )}

                {/* 2. OFFLINE SCREEN (Static) */}
                {!isSystemOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20">
                        <div className="bg-slate-800 p-6 rounded-full mb-4 border border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <Power className="w-10 h-10 text-slate-500" />
                        </div>
                        <p className="text-slate-500 font-mono tracking-widest text-lg">MONITORING DISABLED</p>
                        <p className="text-slate-600 text-xs mt-2">Click "Go Online" to establish link</p>
                    </div>
                )}

                {/* 3. LOADING / ERROR SCREEN (When On but not connected) */}
                {isSystemOn && !isOnline && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                        <p className="text-emerald-400 font-mono tracking-widest text-sm animate-pulse">ESTABLISHING SECURE LINK...</p>
                    </div>
                )}

                {/* 4. OVERLAYS (Visible only when Online) */}
                {isSystemOn && isOnline && (
                    <>
                        {/* Rec Indicator */}
                        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                            <div className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm w-fit flex items-center gap-1 animate-pulse">
                                <Activity className="w-3 h-3" /> LIVE
                            </div>
                            <div className="bg-black/50 backdrop-blur text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                                YOLOv8x
                            </div>
                        </div>

                        {/* Camera Controls */}
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <button
                                onClick={takeSnapshot}
                                className="bg-black/60 hover:bg-emerald-600 text-white p-2.5 rounded-full backdrop-blur border border-white/10 transition shadow-lg"
                                title="Evidence Snapshot"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            {isFullscreen && (
                                <button
                                    onClick={toggleFullscreen}
                                    className="bg-black/60 hover:bg-slate-700 text-white p-2.5 rounded-full backdrop-blur border border-white/10 transition shadow-lg"
                                    title="Exit Fullscreen"
                                >
                                    <Minimize className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Crosshair Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-red-500 rounded-full"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}