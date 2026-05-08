

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=48&pause=1000&color=6366F1&center=true&vCenter=true&width=700&height=90&lines=VoiceScript+%F0%9F%8E%99%EF%B8%8F;Speech+Recognition%2C+Reimagined.;Built+for+the+Future." alt="VoiceScript" />

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/OpenAI-Whisper_Medium-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Facebook-Demucs-1877F2?style=for-the-badge&logo=meta&logoColor=white" />
  <br/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Live_&_Running-22C55E?style=for-the-badge" />
  <a href="https://huggingface.co/spaces/Tusharz/VoiceScript">
    <img src="https://img.shields.io/badge/🤗_Hugging_Face-Live_Demo-FF9D00?style=for-the-badge" />
  </a>
</p>

<br/>

<p align="center">
  <b>A production-grade, full-stack AI speech recognition system that transcribes any audio in any language — powered by a multi-stage AI pipeline combining vocal isolation, noise reduction, and transformer-based transcription.</b>
</p>

<br/>

<p align="center">
  <a href="https://huggingface.co/spaces/Tusharz/VoiceScript"><strong>🚀 Try Live Demo</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#-quick-start"><strong>⚡ Quick Start</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#-architecture"><strong>📐 Architecture</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#-features"><strong>✨ Features</strong></a>
</p>

<br/>

</div>

---

## 📸 Interface

<div align="center">

![VoiceScript UI](https://raw.githubusercontent.com/TUSHARTAMRAKAR/VoiceScript/main/docs/Screenshot.png)

</div>

---

## 🧠 The Problem VoiceScript Solves

Most speech recognition tools fail in the real world because they assume clean, perfect audio. They struggle with:

- 🎵 **Background music** underneath speech (YouTube videos, podcasts, interviews)
- 🌍 **Non-English languages** — or mixed language audio
- 🔊 **Crowd noise and ambient sound** degrading accuracy
- ⏱️ **Long audio files** hitting API rate limits and time restrictions

VoiceScript solves all of this through a **three-stage AI pipeline** that processes audio before a single word is transcribed.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core
- 🎤 **Live microphone recording** with real-time timer
- 📁 **File upload** — WAV, MP3, FLAC, OGG, WebM
- 🔄 **Any Language → English** in one click
- 🌐 **Auto language detection** badge
- ♾️ **No audio length limit** — auto-chunked

</td>
<td width="50%">

### 🚀 Advanced
- ⏱️ **Timestamped transcript** — every sentence tagged
- 🌍 **Translate to 55+ languages** via Google Translate
- 📄 **Export to TXT** — clean formatted file
- 🎬 **Export to SRT** — YouTube-ready subtitles
- 📑 **Export to PDF** — professional document

</td>
</tr>
<tr>
<td>

### 🔒 Privacy & Performance
- 🏠 **100% local processing** — audio never leaves your machine
- ⚡ **Whisper medium** — 769M params, optimized for CPU
- 🎵 **Demucs vocal isolation** — strips background music
- 🔧 **Auto cleanup** — temp files deleted after transcription

</td>
<td>

### 🎨 UI/UX
- 🌙 **Premium dark interface** — Space Grotesk + Inter
- ✨ **Smooth animations** — fade, slide, pulse, heartbeat
- 📱 **Fully responsive** — works on any screen size
- 🎭 **Animated background grid** + floating orbs
- 🏷️ **7 color-coded tech badges** in footer

</td>
</tr>
</table>

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | Core backend language |
| **Flask** | 3.0.3 | REST API server + frontend serving |
| **Flask-CORS** | 4.0.1 | Cross-origin request handling |
| **OpenAI Whisper** | medium | Primary speech-to-text AI (769M params) |
| **Facebook Demucs** | 4.0.1 | Neural source separation — vocal isolation |
| **pydub** | 0.25.1 | Audio format conversion + preprocessing |
| **deep-translator** | 1.11.4 | Google Translate integration (55+ languages) |
| **SpeechRecognition** | 3.11.0 | Fallback recognition engine |
| **NumPy** | 2.4.4 | Numerical processing for Whisper |
| **ffmpeg** | 8.1 | Low-level audio codec processing |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure |
| **CSS3** | Dark theme, keyframe animations, responsive grid |
| **Vanilla JavaScript ES6+** | MediaRecorder API, Fetch API, DOM manipulation |
| **Web Audio API** | Live microphone capture |
| **Google Fonts** | Space Grotesk + Inter typography |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Containerized deployment |
| **Hugging Face Spaces** | Production hosting (16GB RAM, free tier) |
| **GitHub** | Version control + CI |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│              HTML5  ·  CSS3  ·  Vanilla JS ES6+                │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────────┐   │
│  │   File Upload        │    │   Live Mic Recording         │   │
│  │   Drag & Drop        │    │   MediaRecorder API          │   │
│  │   MP3/WAV/FLAC/OGG  │    │   webm/ogg format            │   │
│  └──────────┬──────────┘    └──────────────┬───────────────┘   │
│             └──────────────┬───────────────┘                   │
│                            │ HTTP POST /transcribe              │
│                            │ multipart/form-data + mode         │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                       FLASK API                                 │
│                            ▼                                    │
│                  ┌──────────────────┐                          │
│                  │   app.py         │                          │
│                  │  POST /transcribe│                          │
│                  │  POST /translate │                          │
│                  │  GET  /languages │                          │
│                  │  GET  /health    │                          │
│                  └────────┬─────────┘                          │
│                           │                                     │
│              ┌────────────▼──────────────────────┐             │
│              │      BEAST MODE PIPELINE           │             │
│              │                                    │             │
│              │  STAGE 1 — pydub                   │             │
│              │  ├─ Any format → 16kHz mono WAV    │             │
│              │  ├─ Volume normalization            │             │
│              │  └─ Silence stripping              │             │
│              │              ↓                     │             │
│              │  STAGE 2 — Facebook Demucs         │             │
│              │  ├─ htdemucs model                 │             │
│              │  ├─ Neural source separation       │             │
│              │  ├─ Isolate vocal stem             │             │
│              │  └─ Discard music/noise/drums      │             │
│              │              ↓                     │             │
│              │  STAGE 3 — OpenAI Whisper Medium   │             │
│              │  ├─ 769M parameter transformer     │             │
│              │  ├─ beam_size=5  best_of=5         │             │
│              │  ├─ temperature=0  patience=2      │             │
│              │  ├─ condition_on_previous_text=True│             │
│              │  ├─ no_speech_threshold=0.25       │             │
│              │  ├─ word_timestamps=True           │             │
│              │  └─ Auto language detection        │             │
│              └────────────────────────────────────┘             │
│                           │                                     │
│           JSON response: { transcript, segments,                │
│                           detected_language, duration,          │
│                           word_count, engine }                  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │     FRONTEND RENDERS    │
              │  · Transcript text      │
              │  · Language badge       │
              │  · Timestamps view      │
              │  · Translation panel    │
              │  · Export buttons       │
              └─────────────────────────┘
```

---

## 📁 Project Structure

```
VoiceScript/
│
├── backend/
│   ├── app.py              # Flask server — all API routes
│   ├── transcriber.py      # Beast mode pipeline: pydub → Demucs → Whisper
│   └── translator.py       # Google Translate integration (55+ languages)
│
├── frontend/
│   ├── index.html          # App structure — all UI elements
│   ├── style.css           # Dark theme, keyframe animations, responsive layout
│   └── app.js              # MediaRecorder, Fetch API, all interactivity
│
├── uploads/                # Temp audio storage (auto-deleted after processing)
│   └── .gitkeep
│
├── docs/
│   └── Screenshot.png      # UI screenshot
│
├── Dockerfile              # Docker container config for HF Spaces
├── .gitignore              # Excludes venv, uploads, cache
├── requirements.txt        # All Python dependencies
└── README.md               # This file
```

---

## ⚡ Quick Start

### Prerequisites
- [Python 3.10+](https://python.org)
- [Git](https://git-scm.com)
- [ffmpeg](https://ffmpeg.org) — `winget install ffmpeg` on Windows
- Modern browser (Chrome, Edge, Firefox)

### 1 — Clone
```bash
git clone https://github.com/TUSHARTAMRAKAR/VoiceScript.git
cd VoiceScript
```

### 2 — Virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3 — Install dependencies
```bash
pip install -r requirements.txt
```

> ⚠️ **First run downloads:**
> - Whisper `medium` model — ~769MB (cached at `~/.cache/whisper/`)
> - Demucs `htdemucs` model — ~300MB (cached automatically)
>
> Both are one-time downloads. Every subsequent run loads instantly.

### 4 — Start the server
```bash
cd backend
python app.py
```

### 5 — Open the app
Open `http://localhost:7860` in your browser. VoiceScript is running.

---

## 🚀 Live Demo

<div align="center">

### 🔗 [huggingface.co/spaces/Tusharz/VoiceScript](https://huggingface.co/spaces/Tusharz/VoiceScript)

*Deployed on Hugging Face Spaces · Docker · CPU Basic · Always On*

</div>

---

## 🧪 How to Use

**Upload a file:**
1. Drop any audio file onto the upload zone
2. Choose mode — `Transcribe` or `Any Language → English`
3. Click **Transcribe File**
4. Get transcript + language badge + timestamps + export options

**Record live:**
1. Click **Start Recording** — allow mic access
2. Speak clearly
3. Click **Stop & Transcribe**
4. Transcript appears in seconds

**Translate:**
- After transcription, the Translate panel appears
- Pick any of 55+ languages from the dropdown
- Click **Translate** — Google Translate does the rest

**Export:**
- **TXT** — plain text file with metadata header
- **SRT** — subtitle file with timestamps, ready for YouTube/VLC
- **PDF** — opens a clean print-ready page, save as PDF

---

## ⚙️ Configuration

**Change Whisper model** in `backend/transcriber.py`:
```python
# tiny | base | small | medium | large-v3
# medium = best CPU balance (default)
# large-v3 = maximum accuracy (needs GPU for practical speed)
WHISPER_MODEL_SIZE = "medium"
```

**Change transcription language** in `backend/transcriber.py`:
```python
language = "en"   # en, hi, de, fr, es, ja, ko, zh...
# Remove language= entirely for auto-detection
```

---

## 🔮 Roadmap

- [ ] GPU acceleration (CUDA) for large-v3 model
- [ ] Real-time streaming transcription
- [ ] Speaker diarization (who said what)
- [ ] AI summarization of long transcripts
- [ ] Transcript history (localStorage)
- [ ] Docker compose for one-command setup
- [ ] REST API documentation (Swagger/OpenAPI)
- [ ] Chrome extension for transcribing browser audio

---

## 🤝 Contributing

```bash
# Fork → clone → create branch
git checkout -b feature/your-feature

# Make changes, then
git commit -m "feat: describe your change"
git push origin feature/your-feature

# Open a Pull Request
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## 👨‍💻 Author

<div align="center">

<img src="https://github.com/TUSHARTAMRAKAR.png" width="110" style="border-radius:50%;border:3px solid #6366f1;" />

### Tushar Tamrakar

**Full-Stack Developer · AI/ML Enthusiast · Builder**

[![GitHub](https://img.shields.io/badge/GitHub-TUSHARTAMRAKAR-181717?style=for-the-badge&logo=github)](https://github.com/TUSHARTAMRAKAR)
[![Email](https://img.shields.io/badge/Email-tushartamrakar2003%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:tushartamrakar2003@gmail.com)
[![HuggingFace](https://img.shields.io/badge/🤗_HuggingFace-Tusharz-FF9D00?style=for-the-badge)](https://huggingface.co/Tusharz)

*"Built with curiosity, powered by caffeine, debugged at 2AM."* ☕

</div>

---

## 📄 License

```
MIT License — Copyright (c) 2026 Tushar Tamrakar

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software to deal in the Software without restriction,
including the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=600&size=18&pause=1000&color=6366F1&center=true&vCenter=true&width=600&height=50&lines=If+VoiceScript+helped+you+%E2%80%94+drop+a+%E2%AD%90+it+means+everything!" alt="star" />

**Python · Flask · JavaScript · OpenAI Whisper · Facebook Demucs · pydub · ffmpeg · Docker · Hugging Face**

</div>
