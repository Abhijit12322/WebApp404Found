from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from ultralytics import YOLO
from supabase import create_client, Client
import cv2
import os
import tempfile
import pathlib
import traceback
import gc
import shutil
import time

# ==========================================
# 1. CONFIGURATION & SETUP
# ==========================================
pathlib.PosixPath = pathlib.WindowsPath
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024
CORS(app, resources={r"/*": {"origins": "*"}})

# --- 🔑 SUPABASE KEYS ---
SUPABASE_URL = "https://puropwctzpebzrcbnbfx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cm9wd2N0enBlYnpyY2JuYmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzMxOTMsImV4cCI6MjA3ODk0OTE5M30.8thGeSUgaDlyOS5NEWYlG86ApT2ijw2bJPMlDSavjf4"
BUCKET_NAME = "wildguard"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase Connected")
except Exception as e:
    print(f"❌ Supabase Error: {e}")

DANGEROUS_ANIMALS = {"tiger", "lion", "bear", "elephant",
                     "leopard", "cheetah", "wolf", "rhinoceros", "rhino", "hippo", "crocodile"}
CONFIDENCE_THRESHOLD = 0.4
IMAGE_SIZE = 640

# ==========================================
# 2. LOAD AI
# ==========================================
model = None
try:
    print("⏳ Loading Model...")
    model = YOLO("best.pt") if os.path.exists(
        "best.pt") else YOLO("yolov8n.pt")
    print("✅ Model Loaded")
except Exception as e:
    print(f"❌ Model Error: {e}")

# ==========================================
# 3. DETECT ROUTE (WebM Fix)
# ==========================================


@app.route('/detect', methods=['POST'])
def detect():
    if model is None:
        return jsonify({"error": "Model offline"}), 500

    temp_input_path = None
    output_video_path = None
    processed_url = None

    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file"}), 400
        file = request.files['file']
        user_id = request.form.get("user_id", "unknown")
        filename = "".join(
            x for x in file.filename if x.isalnum() or x in "._-").lower()

        upload_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        temp_input_path = os.path.join(
            upload_dir, f"raw_{int(time.time())}_{filename}")
        file.save(temp_input_path)
        print(f"⬇️  Processing: {filename}")

        detections = []
        unique_animals = set()

        # --- VIDEO PROCESSING (WebM / VP8) ---
        if filename.endswith(('.mp4', '.avi', '.mov', '.mkv')):
            print("🎥 Generating WebM Video (Browser Safe)...")

            cap = cv2.VideoCapture(temp_input_path)

            # Validate Video Dimensions
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 30

            if width == 0 or height == 0:
                raise ValueError(
                    "Invalid video dimensions. File may be corrupt.")

            # [FIX] Use .webm container and 'vp80' codec
            # This works on Windows by default and plays in Chrome/Edge
            output_filename = f"processed_{int(time.time())}.webm"
            output_video_path = os.path.join(upload_dir, output_filename)

            fourcc = cv2.VideoWriter_fourcc(*'vp80')
            out = cv2.VideoWriter(
                output_video_path, fourcc, fps, (width, height))

            if not out.isOpened():
                print("❌ Error: Could not open video writer. Permission issue?")
                raise ValueError("Failed to initialize VideoWriter")

            frame_count = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Run Inference
                results = model.predict(
                    frame, conf=CONFIDENCE_THRESHOLD, imgsz=IMAGE_SIZE, verbose=False)

                for r in results:
                    annotated_frame = r.plot()
                    out.write(annotated_frame)

                    # Stats (Every 1 sec)
                    if frame_count % int(fps) == 0:
                        for box in r.boxes:
                            cls = model.names[int(box.cls[0])]
                            if cls.lower() in DANGEROUS_ANIMALS or cls not in unique_animals:
                                unique_animals.add(cls)
                                detections.append({
                                    "animal": cls,
                                    "confidence": float(box.conf[0]),
                                    "dangerous": cls.lower() in DANGEROUS_ANIMALS,
                                    "bbox": [0, 0, 0, 0]
                                })
                frame_count += 1

            cap.release()
            out.release()

            # UPLOAD WebM TO SUPABASE
            if os.path.exists(output_video_path):
                print("☁️  Uploading WebM to Supabase...")
                cloud_path = f"{user_id}/{output_filename}"

                with open(output_video_path, 'rb') as f:
                    file_bytes = f.read()

                supabase.storage.from_(BUCKET_NAME).upload(
                    path=cloud_path,
                    file=file_bytes,
                    file_options={"content-type": "video/webm"}
                )

                processed_url = supabase.storage.from_(
                    BUCKET_NAME).get_public_url(cloud_path)
                print(f"✅ Upload Complete: {processed_url}")

        # --- IMAGE PROCESSING ---
        else:
            results = model.predict(
                source=temp_input_path, save=False, conf=CONFIDENCE_THRESHOLD)
            for r in results:
                for box in r.boxes:
                    cls = model.names[int(box.cls[0])]
                    detections.append({
                        "animal": cls,
                        "confidence": float(box.conf[0]),
                        "dangerous": cls.lower() in DANGEROUS_ANIMALS,
                        "bbox": box.xyxy[0].tolist()
                    })

        # Cleanup
        try:
            if temp_input_path and os.path.exists(temp_input_path):
                os.remove(temp_input_path)
            if output_video_path and os.path.exists(output_video_path):
                os.remove(output_video_path)
        except:
            pass

        return jsonify({
            "message": "success",
            "detections": detections,
            "count": len(detections),
            "video_url": processed_url,
            "type": "video" if filename.endswith(('.mp4', '.avi')) else "image"
        })

    except Exception as e:
        print(f"❌ SERVER ERROR: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        gc.collect()

# ... (Keep existing live stream routes) ...


def generate_frames():
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        return
    while True:
        success, frame = camera.read()
        if not success:
            break
        frame = cv2.resize(frame, (640, 480))
        results = model(frame, stream=True, conf=0.5, verbose=False)
        for r in results:
            frame = r.plot()
        ret, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    print("🚀 Server Running on Port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False,
            use_reloader=False, threaded=True)
