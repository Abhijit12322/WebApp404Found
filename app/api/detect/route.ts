import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
    try {
        const { userId, imageUrl, videoUrl } = await req.json();

        // Select correct URL
        const fileUrl = imageUrl || videoUrl;

        if (!fileUrl) {
            return Response.json({ error: "Missing imageUrl or videoUrl" });
        }

        const type = imageUrl ? "image" : "video";

        // Send to ML server
        const mlRes = await fetch(process.env.ML_SERVER_URL + "/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                image_url: fileUrl,
            }),
        });

        const data = await mlRes.json();
        console.log("ML RESULT:", data);

        if (!data.detections) {
            return Response.json({ error: "No detections" });
        }

        // Save detection summary
        await supabaseAdmin.from("detections").insert({
            user_id: userId,
            detection_type: type,
            animal_count: data.detections.length,
            image_url: imageUrl || null,
            video_url: videoUrl || null,
        });

        // Save logs
        for (const det of data.detections) {
            await supabaseAdmin.from("detection_logs").insert({
                user_id: userId,
                animal_name: det.animal,
                animal_count: det.count,
                detection_type: type,
                confidence_score: det.confidence,
                bbox: det.bbox,
                image_url: imageUrl || null,
                video_url: videoUrl || null,
            });

            if (det.dangerous) {
                await supabaseAdmin.from("danger_alerts").insert({
                    user_id: userId,
                    animal_name: det.animal,
                    alert_level: "high",
                    message: `${det.animal} detected`,
                    is_read: false,
                });
            }
        }

        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: String(err) });
    }
}
