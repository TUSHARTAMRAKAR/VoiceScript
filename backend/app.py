# app.py
# ---------------------------------------------------------
# THIS FILE IS THE SERVER — THE BRAIN OF THE BACKEND
#
# Flask is a Python library that lets us create a web server
# in just a few lines. It listens for requests from the
# frontend (the webpage) and sends back responses.
# ---------------------------------------------------------

import os                          # For working with files and folders
from flask import Flask, request, jsonify  # Flask is our web framework
from flask_cors import CORS        # Allows frontend to talk to backend
from transcriber import transcribe_audio   # Our own file we just wrote

# ── Create the Flask app ──────────────────────────────────
# Flask(__name__) creates a new web application
# __name__ tells Flask where to find files relative to this script
app = Flask(__name__)

# ── Allow Cross-Origin Requests ───────────────────────────
# By default, browsers block a webpage from calling a different server.
# CORS(app) removes that block so our frontend can call our backend.
CORS(app)

# ── Set up the uploads folder ─────────────────────────────
# os.path.dirname(__file__) = the folder this file is in (backend/)
# os.path.join() builds the path: backend/../uploads = uploads/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# Create the uploads folder if it doesn't already exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ── Route 1: Home — just to check server is running ──────
# A "route" is a URL path. When someone visits /, this runs.
@app.route("/")
def home():
    return jsonify({"message": "Speech Recognition API is running!"})


# ── Route 2: Transcribe — the main feature ────────────────
# When the frontend sends an audio file to /transcribe,
# this function runs and returns the text.
# methods=["POST"] means this only accepts POST requests (sending data)
@app.route("/transcribe", methods=["POST"])
def transcribe():

    # Step 1: Check if a file was actually sent
    if "audio" not in request.files:
        return jsonify({"success": False, "error": "No audio file received."}), 400

    # Step 2: Get the file from the request
    audio_file = request.files["audio"]

    # Step 3: Check the file isn't empty
    if audio_file.filename == "":
        return jsonify({"success": False, "error": "Empty filename."}), 400

    # Step 4: Save the file temporarily to the uploads/ folder
    file_path = os.path.join(UPLOAD_FOLDER, "temp_audio.wav")
    audio_file.save(file_path)

    # Step 5: Call our transcriber to convert audio → text
    result = transcribe_audio(file_path)

    # Step 6: Delete the temp file after transcription (clean up)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Step 7: Send the result back to the frontend as JSON
    # JSON is like a structured text format — {"key": "value"}
    return jsonify(result)


# ── Start the server ──────────────────────────────────────
# This only runs when you directly run: python app.py
# debug=True means it auto-restarts when you change code
if __name__ == "__main__":
    print("Starting Speech Recognition Server...")
    print("Open http://localhost:5000 in your browser")
    app.run(debug=True, port=5000)
