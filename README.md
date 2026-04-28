# 🎙️ Speech Recognition System

> A full-stack web application that converts spoken audio into text using AI-powered speech recognition.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## What This Project Does

This app lets you:
- **Upload an audio file** (WAV, MP3, FLAC) and get a text transcript instantly
- **Record live from your microphone** and transcribe in real time
- **Copy the transcript** to your clipboard with one click

The AI engine uses Google's Speech Recognition API via the `SpeechRecognition` Python library — no paid API key needed for basic usage.

---

## Live Demo

🔗 **[View Live Demo](https://your-demo-link-here.onrender.com)**

> *(Deploy instructions below — replace this link after deployment)*

---

## Screenshots

### Main Interface
The clean, dark UI with two input modes — file upload and live recording.

```
[Screenshot of the app goes here]
```

---

## Tech Stack

| Layer      | Technology                          | Purpose                              |
|------------|-------------------------------------|--------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript     | UI — what the user sees              |
| Backend    | Python 3, Flask                     | Server — processes requests          |
| AI Engine  | SpeechRecognition (Google API)      | Converts audio → text                |
| CORS       | flask-cors                          | Allows frontend to call backend      |
| Deployment | Render (backend) + GitHub Pages     | Hosting                              |

---

## Project Structure

```
speech-recognition-system/
│
├── backend/
│   ├── app.py              # Flask server — API routes
│   └── transcriber.py      # Speech-to-text AI logic
│
├── frontend/
│   ├── index.html          # Webpage structure
│   ├── style.css           # All styling
│   └── app.js              # Interactivity + API calls
│
├── uploads/                # Temp audio storage (auto-cleaned)
│   └── .gitkeep
│
├── .gitignore              # Files excluded from Git
├── requirements.txt        # Python dependencies
└── README.md               # This file
```

---

## How It Works

```
User speaks / uploads file
         ↓
   Browser (JavaScript)
   Records / reads file
         ↓
   HTTP POST to Flask API
   /transcribe endpoint
         ↓
   transcriber.py receives
   audio, sends to Google
   Speech Recognition
         ↓
   Text returned as JSON
         ↓
   JavaScript displays
   transcript on screen
```

---

## Getting Started (Run Locally)

### Prerequisites

Make sure you have these installed:
- [Python 3.10+](https://python.org)
- [Git](https://git-scm.com)
- A modern browser (Chrome, Firefox, Edge)

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/speech-recognition-system.git
cd speech-recognition-system
```

### Step 2 — Set up Python environment

```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate
```

### Step 3 — Install dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Run the backend server

```bash
cd backend
python app.py
```

You should see:
```
Starting Speech Recognition Server...
Open http://localhost:5000 in your browser
```

### Step 5 — Open the frontend

Open `frontend/index.html` in your browser directly, or use VS Code's Live Server extension.

> The frontend will connect to the backend at `http://localhost:5000` automatically.

---

## Usage

### Option A — Upload an audio file
1. Click the drop zone or drag an audio file onto it
2. Select a `.wav`, `.mp3`, or `.flac` file
3. Click **Transcribe File**
4. Read the transcript below

### Option B — Record from microphone
1. Click **Start Recording**
2. Allow microphone access when prompted
3. Speak clearly into your mic
4. Click **Stop & Transcribe**
5. Read the transcript below

---

## Deployment

### Deploy backend to Render (free)
1. Push this project to GitHub (instructions below)
2. Go to [render.com](https://render.com) and sign up
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Set:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `cd backend && python app.py`
6. Click **Deploy** — Render gives you a live URL

### Update the frontend API URL
In `frontend/app.js`, change:
```javascript
const API_URL = "http://localhost:5000";
```
to your Render URL:
```javascript
const API_URL = "https://your-app-name.onrender.com";
```

---

## Known Limitations

- Requires an internet connection (uses Google's cloud API)
- Audio must be clear — background noise reduces accuracy
- Long audio files (>60 seconds) may timeout
- Free Google API has daily usage limits

---

## Future Improvements

- [ ] Add support for Whisper (offline AI model)
- [ ] Add language selection dropdown
- [ ] Add timestamp markers in transcript
- [ ] Add speaker diarization (who said what)
- [ ] Add export to PDF / Word

---

## Author

**Your Name**
- GitHub: [@your_username](https://github.com/your_username)
- Project built as part of learning full-stack web development

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

*Built with Python · Flask · JavaScript · SpeechRecognition*
