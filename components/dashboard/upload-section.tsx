"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Upload, Video, FileImage, AlertTriangle, CheckCircle } from "lucide-react";

export default function UploadSection({
    userId,
    onUploadComplete,
}: {
    userId: string;
    onUploadComplete: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus(null);

        try {
            // 1. Check Session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) throw new Error("Session expired. Please refresh.");

            const isVideo = file.type.startsWith("video");

            // --- STEP 1: Upload Raw File to Supabase (Backup) ---
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("wildguard")
                .upload(fileName, file);

            if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

            const { data: urlData } = supabase.storage
                .from("wildguard")
                .getPublicUrl(fileName);

            const rawPublicUrl = urlData.publicUrl;


            // --- STEP 2: Send to Python Server ---
            const formData = new FormData();
            formData.append("file", file);
            formData.append("user_id", userId);

            // Connect directly to Python (Bypassing Next.js to avoid size limits)
            const res = await fetch("http://127.0.0.1:5000/detect", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`AI Server Error: ${errorText.slice(0, 100)}`);
            }

            const data = await res.json();
            const detections = data.detections || [];

            // [CRITICAL LOGIC] Determine which URL to save
            // If Python generated a processed video (data.video_url), use that!
            // Otherwise, fallback to the raw uploaded file.
            let finalVideoUrl = null;
            let finalImageUrl = null;

            if (isVideo) {
                finalVideoUrl = data.video_url ? data.video_url : rawPublicUrl;
            } else {
                finalImageUrl = rawPublicUrl;
            }

            // --- STEP 3: Save to Database ---
            const { error: dbError } = await supabase
                .from("detections")
                .insert({
                    user_id: userId,
                    detection_type: isVideo ? "video" : "image",
                    animal_count: detections.length,
                    image_url: finalImageUrl,
                    video_url: finalVideoUrl, // <--- This now holds the AI video link
                    confidence_score: detections.length > 0 ? detections[0].confidence : 0,
                    detections: detections,
                    location: "Upload Station"
                });

            if (dbError) throw new Error(`DB Save Error: ${dbError.message}`);

            // --- STEP 4: Create Alerts ---
            const dangerous = detections.filter((d: any) => d.dangerous);
            if (dangerous.length > 0) {
                await supabase.from("danger_alerts").insert(
                    dangerous.map((d: any) => ({
                        user_id: userId,
                        animal_name: d.animal,
                        message: `DANGER: ${d.animal} detected in uploaded media!`,
                        alert_level: "critical",
                        is_read: false
                    }))
                );
            }

            setStatus({ type: 'success', msg: `Success! Found ${detections.length} objects.` });
            setFile(null);
            onUploadComplete();

        } catch (err: any) {
            console.error(err);
            setStatus({ type: 'error', msg: err.message || "Upload Failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
                }`}>
                <label className="flex flex-col items-center justify-center cursor-pointer h-full min-h-[120px]">
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

                    {file ? (
                        <div className="animate-in fade-in zoom-in">
                            <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                            <p className="text-emerald-400 font-medium text-sm">{file.name}</p>
                            <p className="text-slate-500 text-xs mt-1">Ready for analysis</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-3 mb-3 text-slate-400">
                                <FileImage className="w-8 h-8" />
                                <Video className="w-8 h-8" />
                            </div>
                            <span className="text-slate-300 font-medium">Click to Upload</span>
                            <span className="text-slate-600 text-xs mt-1">Supports MP4, JPG, PNG</span>
                        </>
                    )}
                </label>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${!file || loading
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                    }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing AI Video...</span>
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" />
                        <span>Run Analysis</span>
                    </>
                )}
            </button>

            {status && (
                <div className={`p-3 rounded text-sm text-center ${status.type === 'error' ? 'text-red-400 bg-red-900/20' : 'text-emerald-400 bg-emerald-900/20'
                    }`}>
                    {status.msg}
                </div>
            )}
        </div>
    );
}