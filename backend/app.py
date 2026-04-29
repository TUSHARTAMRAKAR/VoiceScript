# app.py
# ---------------------------------------------------------
# THE SERVER — manages all API routes
#
# Changes for HF Spaces deployment:
#   - Port changed from 5000 to 7860 (HF requirement)
#   - HOST set to 0.0.0.0 (accepts external connections)
#   - Added /health endpoint for HF to check app is alive
#   - Serves frontend files directly from Flask
#     (no separate frontend server needed on HF)
# ---------------------------------------------------------

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from transcriber import transcribe_audio

app = Flask(__name__)
CORS(app)

# Paths
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
FRONTEND_DIR  = os.path.join(BASE_DIR, "frontend")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ── Serve frontend files ───────────────────────────────────
# On HF Spaces, Flask serves both the API AND the frontend HTML
# So visiting the Space URL shows the VoiceScript UI directly

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)


# ── Health check — HF uses this to verify app is running ──
@app.route("/health")
def health():
    return jsonify({"status": "ok", "app": "VoiceScript"})


# ── Main transcription endpoint ────────────────────────────
@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"success": False, "error": "No audio file received."}), 400

    audio_file = request.files["audio"]

    if audio_file.filename == "":
        return jsonify({"success": False, "error": "Empty filename."}), 400

    file_path = os.path.join(UPLOAD_FOLDER, "temp_audio")
    audio_file.save(file_path)

    result = transcribe_audio(file_path)

    if os.path.exists(file_path):
        os.remove(file_path)

    return jsonify(result)


# ── Start server ───────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print(f"Starting VoiceScript Server on port {port}...")
    print(f"Visit: http://localhost:{port}")
    app.run(debug=False, host="0.0.0.0", port=port)
