# app.py
# ---------------------------------------------------------
# THE SERVER — manages all API routes
#
# Routes:
#   GET  /              → serves frontend index.html
#   GET  /health        → health check
#   POST /transcribe    → audio → text (any language)
#   POST /translate     → text → translated text
#   GET  /languages     → returns all supported languages
# ---------------------------------------------------------

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from transcriber import transcribe_audio
from translator import translate_text, get_supported_languages

app = Flask(__name__)
CORS(app)

BASE_DIR      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
FRONTEND_DIR  = os.path.join(BASE_DIR, "frontend")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ── Serve frontend ─────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)


# ── Health check ───────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({"status": "ok", "app": "VoiceScript"})


# ── Get supported languages ────────────────────────────────
# Frontend calls this on load to populate the language dropdown
@app.route("/languages", methods=["GET"])
def languages():
    return jsonify({
        "success": True,
        "languages": get_supported_languages()
    })


# ── Transcribe audio ───────────────────────────────────────
# mode = "transcribe"  → transcribe in original language
# mode = "translate"   → transcribe ANY language → English
@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"success": False, "error": "No audio file received."}), 400

    audio_file = request.files["audio"]
    if audio_file.filename == "":
        return jsonify({"success": False, "error": "Empty filename."}), 400

    # Get mode from form data — default is "transcribe"
    # "translate_to_english" mode tells Whisper to output English
    # regardless of what language was spoken
    mode = request.form.get("mode", "transcribe")

    file_path = os.path.join(UPLOAD_FOLDER, "temp_audio")
    audio_file.save(file_path)

    result = transcribe_audio(file_path, mode=mode)

    if os.path.exists(file_path):
        os.remove(file_path)

    # Format segments into clean timestamped lines for frontend
    # Each segment: { start, end, text }
    # We convert seconds → [MM:SS] format here in backend
    if result.get("success") and result.get("segments"):
        timestamped = []
        for seg in result["segments"]:
            start_sec = int(seg.get("start", 0))
            end_sec   = int(seg.get("end", 0))
            text      = seg.get("text", "").strip()
            if text:
                start_fmt = f"{start_sec // 60:02d}:{start_sec % 60:02d}"
                end_fmt   = f"{end_sec   // 60:02d}:{end_sec   % 60:02d}"
                timestamped.append({
                    "start"     : start_sec,
                    "end"       : end_sec,
                    "start_fmt" : start_fmt,
                    "end_fmt"   : end_fmt,
                    "text"      : text
                })
        result["timestamped"] = timestamped
        # Remove raw segments from response (too heavy)
        del result["segments"]

    return jsonify(result)


# ── Translate transcript ───────────────────────────────────
# Takes existing transcript text + target language code
# Returns translated text
@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data received."}), 400

    text = data.get("text", "").strip()
    target_lang = data.get("target_language", "")

    if not text:
        return jsonify({"success": False, "error": "No text to translate."}), 400

    if not target_lang:
        return jsonify({"success": False, "error": "No target language specified."}), 400

    result = translate_text(text, target_lang)
    return jsonify(result)


# ── Start server ───────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print(f"Starting VoiceScript Server on port {port}...")
    print(f"Visit: http://localhost:{port}")
    app.run(debug=False, host="0.0.0.0", port=port)
