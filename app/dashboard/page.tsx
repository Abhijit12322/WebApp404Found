"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

import DashboardNav from "@/components/dashboard/dashboard-nav";
import UploadSection from "@/components/dashboard/upload-section";
import LiveMonitoringSection from "@/components/dashboard/live-monitoring-section";
import AlertNotifier from "@/components/dashboard/alert-notifier";

import Modal from "@/components/ui/modal";
import BBoxViewer from "@/components/dashboard/bbox-viewer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileUp,
    TrendingUp,
    Bell,
    Loader2,
    Video,
    Image as ImageIcon,
    Calendar,
    ChevronRight,
    CheckCheck,
    X,
    Download
} from "lucide-react";

/* ------------------------- Types ------------------------- */
type DetectionRow = {
    id: string;
    user_id: string;
    detection_type: "image" | "video";
    animal_count: number;
    image_url?: string | null;
    video_url?: string | null;
    confidence_score?: number | null;
    created_at?: string | null;
    summary?: any[] | null;
    detections?: any[] | null;
};

type DangerAlert = {
    id: string;
    user_id: string;
    animal_name: string;
    message?: string;
    alert_level?: string;
    is_read?: boolean;
    created_at?: string | null;
};

/* ------------------------- Helper: Group Detections ------------------------- */
function getUniqueDetections(detections: any[]) {
    if (!Array.isArray(detections)) return [];

    const map = new Map();
    detections.forEach((d) => {
        if (!map.has(d.animal) || d.confidence > map.get(d.animal).confidence) {
            map.set(d.animal, d);
        }
    });
    return Array.from(map.values());
}

/* ------------------------- Helper: Group Alerts (NEW) ------------------------- */
// Filters out duplicate alerts for the same animal that happen at the same time
function getUniqueAlerts(alerts: DangerAlert[]) {
    const unique: DangerAlert[] = [];
    const seen = new Set<string>();

    alerts.forEach(alert => {
        // Create a key based on Animal Name + Message Content
        // This squashes identical alerts regardless of timestamp differences
        const key = `${alert.animal_name}-${alert.message}`;

        if (!seen.has(key)) {
            seen.add(key);
            unique.push(alert);
        }
    });
    return unique;
}

/* ------------------------- Page -------------------------- */

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [detections, setDetections] = useState<DetectionRow[]>([]);
    const [alerts, setAlerts] = useState<DangerAlert[]>([]);
    const [selectedDetection, setSelectedDetection] = useState<DetectionRow | null>(null);
    const [openModal, setOpenModal] = useState(false);

    const [stats, setStats] = useState({
        totalDetections: 0,
        animalsDetected: 0,
        alertsActive: 0,
    });

    const [loadingData, setLoadingData] = useState(false);

    /* ------------------ Auth Check ------------------ */
    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [loading, user, router]);

    /* ------------------ Data Fetching ------------------ */
    useEffect(() => {
        if (user) void fetchDashboardData();
    }, [user]);

    async function fetchDashboardData() {
        if (!user) return;
        setLoadingData(true);

        try {
            // 1. Recent Detections
            const { data: detData } = await supabase
                .from("detections")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

            // 2. Active Alerts
            const { data: alertsData } = await supabase
                .from("danger_alerts")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_read", false)
                .order("created_at", { ascending: false });

            // 3. Stats Counts
            const { count } = await supabase
                .from("detections")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            // Apply Deduplication Filters
            const cleanAlerts = getUniqueAlerts(alertsData ?? []);

            setDetections(detData ?? []);
            setAlerts(cleanAlerts); // <--- Using the clean list

            setStats({
                totalDetections: count ?? 0,
                animalsDetected: (detData ?? []).reduce((acc, d) => acc + (d.animal_count ?? 0), 0),
                alertsActive: cleanAlerts.length, // Update count to match view
            });
        } catch (err) {
            console.error("Data Fetch Error:", err);
        }
        setLoadingData(false);
    }

    // --- ACTION: Dismiss Single Alert ---
    const dismissAlert = async (id: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        setStats((prev) => ({ ...prev, alertsActive: Math.max(0, prev.alertsActive - 1) }));

        await supabase
            .from("danger_alerts")
            .update({ is_read: true })
            .eq("id", id)
            .eq("user_id", user!.id);
    };

    // --- ACTION: Clear All Alerts ---
    const clearAllAlerts = async () => {
        if (alerts.length === 0) return;
        setAlerts([]);
        setStats((prev) => ({ ...prev, alertsActive: 0 }));

        await supabase
            .from("danger_alerts")
            .update({ is_read: true })
            .eq("user_id", user!.id)
            .eq("is_read", false);
    };

    // --- ACTION: Download Report ---
    const downloadReport = () => {
        if (!selectedDetection) return;

        const uniqueObjs = getUniqueDetections(selectedDetection.detections ?? []);
        const dateStr = new Date(selectedDetection.created_at!).toLocaleString();

        const reportContent = `
WILDGUARD AI - INTELLIGENCE REPORT
==================================
Report ID: ${selectedDetection.id}
Date: ${dateStr}
Type: ${selectedDetection.detection_type.toUpperCase()} Analysis

[ SUMMARY ]
----------------------------------
Total Objects: ${selectedDetection.animal_count}
Avg Confidence: ${Math.round((selectedDetection.confidence_score || 0) * 100)}%
Unique Species: ${uniqueObjs.length}

[ DETECTION LOG ]
----------------------------------
${uniqueObjs.map((d: any, i) =>
            `#${i + 1} ${d.animal.toUpperCase()}
   - Status: ${d.dangerous ? 'CRITICAL THREAT' : 'Monitoring'}
   - Confidence: ${Math.round(d.confidence * 100)}%`
        ).join('\n\n')}

----------------------------------
Generated by WildGuard AI System
`.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WildGuard_Report_${selectedDetection.id.slice(0, 8)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 font-mono animate-pulse">Authenticating WildGuard...</p>
            </div>
        );
    }

    /* ------------------------- Render ------------------------- */
    const uniqueObjects = selectedDetection
        ? getUniqueDetections(selectedDetection.detections ?? [])
        : [];

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
            <DashboardNav user={user} />
            <AlertNotifier userId={user.id} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* --- STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Scans" value={stats.totalDetections} icon={<FileUp className="w-8 h-8 text-emerald-400" />} trend="+12% from last week" />
                    <StatCard title="Animals Identified" value={stats.animalsDetected} icon={<TrendingUp className="w-8 h-8 text-cyan-400" />} trend="Active Wildlife Activity" />
                    <StatCard title="Active Threats" value={stats.alertsActive} icon={<Bell className="w-8 h-8 text-orange-500" />} trend="Requires Attention" highlight={stats.alertsActive > 0} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* LEFT: Actions */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur shadow-xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6 pb-2 border-b border-slate-800/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        Live Sector Feed
                                    </h3>
                                    <span className="text-xs font-mono text-emerald-500">ONLINE</span>
                                </div>
                                <div className="p-6"><LiveMonitoringSection userId={user.id} /></div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur shadow-xl">
                            <CardHeader><CardTitle className="text-lg text-white flex items-center gap-2"><FileUp className="w-5 h-5 text-blue-400" />Manual Analysis</CardTitle></CardHeader>
                            <CardContent><UploadSection userId={user.id} onUploadComplete={fetchDashboardData} /></CardContent>
                        </Card>
                    </div>

                    {/* RIGHT: Feeds */}
                    <div className="space-y-8">
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur shadow-xl h-[400px] flex flex-col">
                            <CardHeader className="border-b border-slate-800/50 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg text-white flex items-center gap-2"><Bell className="w-5 h-5 text-orange-500" />Threat Alerts</CardTitle>
                                {alerts.length > 0 && (
                                    <button onClick={clearAllAlerts} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white hover:bg-slate-800 px-2 py-1 rounded transition"><CheckCheck className="w-3 h-3" /> Clear</button>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                {alerts.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500"><Bell className="w-10 h-10 mb-2 opacity-20" /><p className="text-sm">No active threats</p></div>
                                ) : (
                                    <div className="divide-y divide-slate-800/50">
                                        {alerts.map((a) => (
                                            <div key={a.id} className={`relative group p-4 transition border-l-4 ${a.alert_level === 'critical' ? 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10' : 'border-l-orange-500 hover:bg-slate-800/50'}`}>
                                                <div className="flex justify-between items-start mb-1 pr-6">
                                                    <h4 className="font-bold text-slate-200 capitalize">{a.animal_name} Detected</h4>
                                                    <span className="text-[10px] text-slate-500 font-mono">{new Date(a.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed">{a.message}</p>
                                                <button onClick={(e) => { e.stopPropagation(); dismissAlert(a.id); }} className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur shadow-xl h-[500px] flex flex-col">
                            <CardHeader className="border-b border-slate-800/50 pb-4">
                                <CardTitle className="text-lg text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />Detection Log</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                {detections.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">No records found</div>
                                ) : (
                                    <div className="divide-y divide-slate-800/50">
                                        {detections.map((d) => (
                                            <div key={d.id} onClick={() => { setSelectedDetection(d); setOpenModal(true); }} className="p-4 flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${d.detection_type === 'video' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                        {d.detection_type === 'video' ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200 capitalize">{d.detection_type} Analysis</p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1"><Calendar className="w-3 h-3" />{new Date(d.created_at!).toLocaleDateString()} <span className="w-1 h-1 bg-slate-600 rounded-full" /> <span>{d.animal_count} Found</span></div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ----------- PRO MODAL ----------- */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                {selectedDetection ? (
                    <div className="flex flex-col h-[85vh] w-full max-w-6xl mx-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="shrink-0 p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedDetection.detection_type === 'video' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {selectedDetection.detection_type === 'video' ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-none">
                                        <span className="capitalize">{selectedDetection.detection_type}</span> Analysis
                                    </h2>
                                    <p className="text-xs text-slate-500 font-mono mt-1">{selectedDetection.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Grid */}
                        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">

                            {/* Left: Media (8 Columns) */}
                            <div className="lg:col-span-8 bg-black flex items-center justify-center relative">
                                <div className="w-full h-full flex items-center justify-center bg-black/50">
                                    <BBoxViewer
                                        url={selectedDetection.detection_type === 'video' ? selectedDetection.video_url ?? null : selectedDetection.image_url ?? null}
                                        type={selectedDetection.detection_type}
                                        detections={[]}
                                    />
                                </div>
                            </div>

                            {/* Right: Details (4 Columns) */}
                            <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">

                                {/* Scrollable Data Area */}
                                <div className="flex-1 overflow-y-auto p-6 pr-2 custom-scrollbar">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Detection Summary</h3>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Confidence</p>
                                            <p className="text-2xl font-mono text-emerald-400 font-bold">
                                                {selectedDetection.confidence_score ? Math.round(selectedDetection.confidence_score * 100) : 0}%
                                            </p>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Total Objects</p>
                                            <p className="text-2xl font-mono text-white font-bold">{selectedDetection.animal_count}</p>
                                        </div>
                                    </div>

                                    {/* Object List */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detected Species</p>
                                        <div className="space-y-2">
                                            {uniqueObjects.length > 0 ? (
                                                uniqueObjects.map((det: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm p-3 bg-slate-800/40 rounded-lg border border-slate-800 hover:border-slate-700 transition">
                                                        <span className="capitalize text-slate-200 font-medium truncate max-w-[120px]">{det.animal}</span>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${det.dangerous ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                                {det.dangerous ? 'THREAT' : 'SAFE'}
                                                            </span>
                                                            <span className="text-xs font-mono text-slate-500 w-10 text-right">{Math.round(det.confidence * 100)}%</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-600 italic py-4 text-center bg-slate-800/20 rounded-lg border border-slate-800 border-dashed">No specific objects identified.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Action Footer */}
                                <div className="p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 z-10">
                                    <button
                                        onClick={downloadReport}
                                        className="w-full py-4 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold uppercase tracking-wide rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-0.5"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Full Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </main>
    );
}

function StatCard({ title, value, icon, trend, highlight = false }: { title: string; value: number; icon: React.ReactNode; trend?: string; highlight?: boolean; }) {
    return (
        <div className={`relative overflow-hidden rounded-xl border p-6 shadow-lg transition-all hover:scale-[1.02] ${highlight ? "bg-linear-to-br from-orange-900/20 to-slate-900 border-orange-500/50" : "bg-slate-900/50 border-slate-800"}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <h4 className="text-3xl font-bold text-white mt-2">{value}</h4>
                    {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-slate-800/50 ${highlight ? 'bg-orange-500/10' : ''}`}>{icon}</div>
            </div>
        </div>
    );
}