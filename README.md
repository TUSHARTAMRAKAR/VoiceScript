---
title: VoiceScript
emoji: 🎙️
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: true
license: mit
short_description: AI Speech Recognition — OpenAI Whisper + Facebook Demucs
---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=42&pause=1000&color=6366F1&center=true&vCenter=true&width=600&height=80&lines=VoiceScript+%F0%9F%8E%99%EF%B8%8F;Speech+to+Text%2C+Reimagined." alt="VoiceScript" />

<p align="center">
  <strong>A full-stack AI-powered speech recognition system that converts any audio into precise text — powered by OpenAI Whisper and Facebook Demucs vocal isolation.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/OpenAI-Whisper-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Facebook-Demucs-1877F2?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" />
  <a href="https://huggingface.co/spaces/Tusharz/VoiceScript"><img src="https://img.shields.io/badge/🤗 Hugging Face-Live Demo-FF9D00?style=for-the-badge" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-22C55E?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-Welcome-6366F1?style=flat-square" />
  <img src="https://img.shields.io/github/stars/TUSHARTAMRAKAR/VoiceScript?style=flat-square&color=F59E0B" />
  <img src="https://img.shields.io/github/forks/TUSHARTAMRAKAR/VoiceScript?style=flat-square&color=6366F1" />
</p>

<br/>

[🚀 Live Demo](#-live-demo) · [✨ Features](#-features) · [🛠 Tech Stack](#-tech-stack) · [⚡ Quick Start](#-quick-start) · [📐 Architecture](#-architecture)

<br/>

</div>

---

## 📸 Screenshot

<div align="center">




![VoiceScript UI](https://raw.githubusercontent.com/TUSHARTAMRAKAR/VoiceScript/main/docs/Screenshot.png)

</div>

---

## 🎯 What VoiceScript Does

VoiceScript is not just another wrapper around a speech API. It is a complete **end-to-end audio intelligence pipeline** that processes, isolates, and transcribes audio with near-human accuracy — entirely on your local machine, with zero data leaving your device.

Most speech recognition tools fail when audio contains background music, crowd noise, or overlapping sounds. VoiceScript solves this by running audio through a **two-stage AI pipeline** before transcription even begins:

**Stage 1 — Acoustic Preprocessing**
Raw audio is ingested in any format (MP3, WAV, FLAC, WebM, OGG), converted to 16kHz mono, and volume-normalized using pydub. This ensures a clean, consistent signal regardless of input quality.

**Stage 2 — Neural Vocal Isolation**
Facebook's Demucs `htdemucs` model performs source separation — splitting the audio into vocal and non-vocal stems. Only the pure vocal track proceeds to transcription. Background music, ambient noise, and crowd sounds are permanently discarded.

**Stage 3 — Whisper Transcription**
OpenAI's Whisper medium model — trained on 680,000 hours of multilingual audio — transcribes the isolated vocals with `beam_size=5`, `best_of=5`, `temperature=0`, and full context conditioning. The result is a complete, punctuated transcript with no time limits.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 **Live Recording** | Record directly from your microphone with a real-time timer |
| 📁 **File Upload** | Drag & drop or browse — supports MP3, WAV, FLAC, OGG, WebM |
| 🧠 **Whisper AI** | OpenAI Whisper medium — 769M parameter transformer model |
| 🎵 **Vocal Isolation** | Facebook Demucs strips background music before transcription |
| ♾️ **No Length Limit** | Long audio auto-chunked — transcribe a 2-hour lecture if you want |
| 🔒 **100% Private** | Everything runs locally — your audio never leaves your machine |
| 📋 **One-click Copy** | Copy the full transcript to clipboard instantly |
| 📊 **Audio Metadata** | Word count and audio duration displayed with every result |
| 🌙 **Dark UI** | Sleek dark interface built with pure HTML, CSS, and JS |
| ⚡ **Auto Cleanup** | Temporary audio files deleted immediately after transcription |

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| **Python** | 3.10+ | Core backend language |
| **Flask** | 3.0.3 | Lightweight REST API server |
| **Flask-CORS** | 4.0.1 | Cross-origin request handling |
| **OpenAI Whisper** | medium | Primary speech-to-text AI model (769M params) |
| **Facebook Demucs** | 4.0.1 | Neural vocal isolation / source separation |
| **pydub** | 0.25.1 | Audio format conversion and preprocessing |
| **SpeechRecognition** | 3.11.0 | Fallback recognition engine |
| **NumPy** | 2.4.4 | Numerical processing for Whisper |
| **ffmpeg** | 8.1 | Low-level audio codec processing |

### Frontend
| Technology | Role |
|---|---|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Dark theme, animations, responsive grid |
| **Vanilla JavaScript (ES6+)** | MediaRecorder API, fetch, DOM manipulation |
| **Web Audio API** | Live microphone capture and streaming |
| **Google Fonts** | Space Grotesk + Inter typography |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   index.html · style.css · app.js                          │
│                                                             │
│   ┌──────────────┐         ┌──────────────────────┐        │
│   │  File Upload │         │  Live Mic Recording  │        │
│   │  Drag & Drop │         │  MediaRecorder API   │        │
│   └──────┬───────┘         └──────────┬───────────┘        │
│          └────────────┬───────────────┘                    │
│                       │ HTTP POST /transcribe               │
│                       │ multipart/form-data                 │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                    BACKEND                                   │
│                       ▼                                     │
│              ┌─────────────────┐                            │
│              │   Flask API     │  app.py                    │
│              │  POST /transcribe│                           │
│              └────────┬────────┘                            │
│                       │                                     │
│              ┌────────▼────────┐                            │
│              │  transcriber.py │                            │
│              └────────┬────────┘                            │
│                       │                                     │
│         ┌─────────────▼──────────────────┐                 │
│         │   BEAST MODE PIPELINE          │                 │
│         │                                │                 │
│         │  1. pydub                      │                 │
│         │     Any format → 16kHz WAV     │                 │
│         │     Normalize · Strip silence  │                 │
│         │            ↓                   │                 │
│         │  2. Demucs htdemucs            │                 │
│         │     Separate vocals from music │                 │
│         │     Keep only voice stem       │                 │
│         │            ↓                   │                 │
│         │  3. Whisper medium             │                 │
│         │     beam_size=5  best_of=5     │                 │
│         │     temperature=0  context=ON  │                 │
│         │     Full transcript returned   │                 │
│         └────────────────────────────────┘                 │
│                       │                                     │
│              JSON { success, transcript,                    │
│                    duration, word_count }                   │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
              Transcript displayed in UI
```

---

## 📁 Project Structure

```
VoiceScript/
│
├── backend/
│   ├── app.py              # Flask server — REST API routes
│   └── transcriber.py      # Beast mode pipeline: pydub → Demucs → Whisper
│
├── frontend/
│   ├── index.html          # App structure — all sections and elements
│   ├── style.css           # Dark theme, animations, responsive layout
│   └── app.js              # MediaRecorder, fetch API, UI state management
│
├── uploads/                # Temporary audio storage (auto-cleaned after use)
│   └── .gitkeep
│
├── docs/                   # Documentation assets
│   └── screenshot.png      # UI screenshot
│
├── .gitignore              # Excludes venv, uploads, cache from Git
├── requirements.txt        # All Python dependencies
└── README.md               # This file
```

---

## ⚡ Quick Start

### Prerequisites

Ensure you have the following installed:

- [Python 3.10+](https://python.org)
- [Git](https://git-scm.com)
- [ffmpeg](https://ffmpeg.org) — install via `winget install ffmpeg` on Windows
- A modern browser (Chrome, Edge, Firefox)

### 1. Clone the repository

```bash
git clone https://github.com/TUSHARTAMRAKAR/VoiceScript.git
cd VoiceScript
```

### 2. Create and activate virtual environment

```bash
# Create
python -m venv venv

# Activate — Windows
venv\Scriptsctivate

# Activate — Mac/Linux
source venv/bin/activate
```

### 3. Install all dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ First run will automatically download:
> - Whisper `medium` model — ~769MB (cached at `~/.cache/whisper/`)
> - Demucs `htdemucs` model — ~80MB (cached automatically)
>
> Both are one-time downloads. Every subsequent run is instant.

### 4. Start the backend server

```bash
cd backend
python app.py
```

You should see:
```
Starting Speech Recognition Server...
Open http://localhost:5000 in your browser
```

### 5. Open the frontend

Open `frontend/index.html` directly in your browser, or use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension.

> The frontend automatically connects to the backend at `http://localhost:5000`

---

## 🚀 Live Demo

🔗 **[VoiceScript — Live Demo](https://huggingface.co/spaces/Tusharz/VoiceScript)** — Live and running on Hugging Face Spaces

---

## 🧪 How to Use

**Option A — Upload Audio File**
1. Click the drop zone or drag any audio file onto it
2. Supported formats: `.wav` `.mp3` `.flac` `.ogg` `.webm`
3. Click **Transcribe File**
4. Wait for the pipeline to process (depends on file length)
5. Full transcript appears with word count and duration

**Option B — Live Microphone**
1. Click **Start Recording** — allow mic access if prompted
2. Speak clearly — the timer shows recording duration
3. Click **Stop & Transcribe**
4. Transcript appears within seconds

---

## ⚙️ Configuration

To change the Whisper model, edit `backend/transcriber.py`:

```python
# Options: "tiny" | "base" | "small" | "medium" | "large-v3"
# medium = best balance of accuracy and speed on CPU
# large-v3 = maximum accuracy (requires GPU for practical speed)
WHISPER_MODEL_SIZE = "medium"
```

To change transcription language:
```python
result = model.transcribe(wav_path, language="en")
# Change "en" to "hi" for Hindi, "fr" for French, etc.
# Or remove language= entirely for auto-detection
```

---

## 🔮 Roadmap

- [ ] GPU acceleration support (CUDA)
- [ ] Real-time streaming transcription
- [ ] Speaker diarization (who said what)
- [ ] Timestamped transcript export
- [ ] Multi-language auto-detection UI
- [ ] Export to PDF / DOCX / SRT subtitles
- [ ] Docker containerization
- [ ] REST API documentation (Swagger)

---

## 🤝 Contributing

Contributions are welcome and appreciated.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 👨‍💻 Author

<div align="center">

<img src="https://github.com/TUSHARTAMRAKAR.png" width="100" style="border-radius: 50%;" />

### Tushar Tamrakar

**Full-Stack Developer · AI/ML Enthusiast**

[![GitHub](https://img.shields.io/badge/GitHub-TUSHARTAMRAKAR-181717?style=for-the-badge&logo=github)](https://github.com/TUSHARTAMRAKAR)
[![Email](https://img.shields.io/badge/Email-tushartamrakar2003%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:tushartamrakar2003@gmail.com)

*Built with curiosity, caffeine, and a lot of debugging.* ☕

</div>

---

## 📄 License

```
MIT License

Copyright (c) 2026 Tushar Tamrakar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

**If VoiceScript was useful to you, please consider giving it a ⭐ — it means a lot!**

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=600&size=16&pause=1000&color=6366F1&center=true&vCenter=true&width=500&height=40&lines=Built+with+%E2%9D%A4%EF%B8%8F+by+Tushar+Tamrakar" alt="footer" />

</div>
