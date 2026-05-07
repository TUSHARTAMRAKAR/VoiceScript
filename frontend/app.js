/*
  app.js — VoiceScript
  Full frontend logic: upload, record, transcribe, translate, timestamps
*/

const API_URL = "";

// ── Global state ───────────────────────────────────────────
let mediaRecorder    = null;
let audioChunks      = [];
let timerInterval    = null;
let secondsElapsed   = 0;
let currentMode      = "transcribe";
let lastTranscript   = "";
let lastSegments     = [];
let timestampsShowing = false;

// Loading messages that rotate while processing
const loadingMessages = [
  "Starting beast mode pipeline...",
  "Converting audio format...",
  "Demucs isolating vocals from background...",
  "Whisper AI transcribing clean vocals...",
  "Almost there — processing final segments...",
  "Finalizing transcript..."
];
let loadingMsgInterval = null;


// ═══════════════════════════════════════════════════════════
// INIT — runs on page load
// ═══════════════════════════════════════════════════════════

async function loadLanguages() {
  try {
    const response = await fetch(`${API_URL}/languages`);
    const data     = await response.json();
    if (data.success) {
      const select = document.getElementById("lang-select");
      const sorted = Object.entries(data.languages).sort((a, b) => a[1].localeCompare(b[1]));
      sorted.forEach(([code, name]) => {
        const opt   = document.createElement("option");
        opt.value   = code;
        opt.textContent = name;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    console.log("Languages not loaded yet — server may be starting");
  }
}

loadLanguages();


// ═══════════════════════════════════════════════════════════
// MODE TOGGLE (Transcribe / Any Language → English)
// ═══════════════════════════════════════════════════════════

function setMode(mode) {
  currentMode = mode;
  document.getElementById("mode-transcribe").classList.toggle("active", mode === "transcribe");
  document.getElementById("mode-translate").classList.toggle("active", mode === "translate_to_english");
}


// ═══════════════════════════════════════════════════════════
// FILE UPLOAD
// ═══════════════════════════════════════════════════════════

document.getElementById("audio-file-input").addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    document.getElementById("file-name-display").textContent = file.name;
    document.getElementById("drop-text").textContent = "File selected:";
  }
});

async function uploadAndTranscribe() {
  const fileInput = document.getElementById("audio-file-input");
  const file      = fileInput.files[0];

  if (!file) {
    alert("Please select an audio file first!");
    return;
  }

  const formData = new FormData();
  formData.append("audio", file);
  formData.append("mode",  currentMode);

  showLoading();

  try {
    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",
      body:   formData,
    });
    const result = await response.json();
    handleResult(result);
  } catch (error) {
    showError("Could not connect to backend. Is the server running? (python backend/app.py)");
  }
}


// ═══════════════════════════════════════════════════════════
// MICROPHONE RECORDING
// ═══════════════════════════════════════════════════════════

async function startRecording() {
  try {
    const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
    mediaRecorder  = new MediaRecorder(stream, { mimeType });
    audioChunks    = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      await sendAudioToBackend(audioBlob);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    document.body.classList.add("recording");
    document.getElementById("record-status").textContent = "Recording...";
    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled  = false;
    startTimer();

  } catch (error) {
    showError("Microphone access denied. Please allow mic access in your browser.");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  document.body.classList.remove("recording");
  document.getElementById("record-status").textContent = "Processing...";
  document.getElementById("start-btn").disabled = false;
  document.getElementById("stop-btn").disabled  = true;
  stopTimer();
  showLoading();
}

async function sendAudioToBackend(audioBlob) {
  const formData = new FormData();
  const ext      = audioBlob.type.includes("ogg") ? "ogg" : "webm";
  formData.append("audio", audioBlob, `recording.${ext}`);
  formData.append("mode",  currentMode);

  try {
    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",
      body:   formData,
    });
    const result = await response.json();
    handleResult(result);
  } catch (error) {
    showError("Could not connect to backend. Is the server running?");
  }

  document.getElementById("record-status").textContent = "Ready to record";
}


// ═══════════════════════════════════════════════════════════
// RESULT HANDLING
// ═══════════════════════════════════════════════════════════

function handleResult(result) {
  hideLoading();
  if (result.success) {
    lastSegments = result.segments || [];
    showTranscript(
      result.transcript,
      result.duration,
      result.word_count,
      result.detected_language_name
    );
  } else {
    showError(result.error);
  }
}

function showTranscript(text, duration, wordCount, detectedLang) {
  // Show result section
  document.getElementById("results-section").classList.add("visible");
  document.getElementById("result-box").classList.add("visible");
  document.getElementById("error-box").classList.remove("visible");

  // Set plain transcript text
  document.getElementById("transcript-text").textContent = text;
  document.getElementById("transcript-text").style.display = "block";

  // Reset timestamps view
  document.getElementById("timestamps-view").style.display = "none";
  timestampsShowing = false;

  // Word count + duration meta
  let meta = `${wordCount || text.trim().split(/\s+/).length} words`;
  if (duration) meta += ` · ${duration}s audio`;
  document.getElementById("word-count").textContent = meta;

  // Language badge
  const langBadge = document.getElementById("lang-badge");
  if (detectedLang && detectedLang !== "Unknown") {
    langBadge.textContent    = "🌐 " + detectedLang + " detected";
    langBadge.style.display  = "inline-block";
  } else {
    langBadge.style.display  = "none";
  }

  // Timestamps button — show only if we have segments
  const tsBtn = document.getElementById("timestamps-btn");
  if (lastSegments.length > 0) {
    tsBtn.style.display = "inline-block";
    tsBtn.textContent   = "Show Timestamps";
    tsBtn.classList.remove("active");
  } else {
    tsBtn.style.display = "none";
  }

  // Store for translation
  lastTranscript = text;
  document.getElementById("translated-box").classList.remove("visible");
  document.getElementById("translate-panel").classList.add("visible");

  document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
}

function showError(message) {
  document.getElementById("results-section").classList.add("visible");
  document.getElementById("result-box").classList.remove("visible");
  document.getElementById("error-text").textContent = message;
  document.getElementById("error-box").classList.add("visible");
  document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
}

function showLoading() {
  document.getElementById("results-section").classList.add("visible");
  document.getElementById("loading-state").classList.add("visible");
  document.getElementById("result-box").classList.remove("visible");
  document.getElementById("error-box").classList.remove("visible");

  let msgIndex = 0;
  const msgEl  = document.getElementById("loading-msg");
  if (msgEl) msgEl.textContent = loadingMessages[0];
  loadingMsgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % loadingMessages.length;
    if (msgEl) msgEl.textContent = loadingMessages[msgIndex];
  }, 4000);
}

function hideLoading() {
  document.getElementById("loading-state").classList.remove("visible");
  if (loadingMsgInterval) {
    clearInterval(loadingMsgInterval);
    loadingMsgInterval = null;
  }
}

function clearResults() {
  document.getElementById("results-section").classList.remove("visible");
  document.getElementById("result-box").classList.remove("visible");
  document.getElementById("error-box").classList.remove("visible");
  document.getElementById("loading-state").classList.remove("visible");
  document.getElementById("transcript-text").textContent = "";
  document.getElementById("translate-panel").classList.remove("visible");
  document.getElementById("translated-box").classList.remove("visible");
  document.getElementById("timestamps-view").innerHTML = "";
  lastTranscript  = "";
  lastSegments    = [];
  timestampsShowing = false;
}


// ═══════════════════════════════════════════════════════════
// TIMESTAMPS
// ═══════════════════════════════════════════════════════════

function toggleTimestamps() {
  timestampsShowing = !timestampsShowing;
  const btn       = document.getElementById("timestamps-btn");
  const plainView = document.getElementById("transcript-text");
  const tsView    = document.getElementById("timestamps-view");

  if (timestampsShowing) {
    // Build the timestamped lines
    tsView.innerHTML = "";
    lastSegments.forEach(seg => {
      const line       = document.createElement("div");
      line.className   = "ts-line";
      line.innerHTML   = `<span class="ts-badge">${seg.start_fmt}</span><span class="ts-text">${seg.text}</span>`;
      tsView.appendChild(line);
    });

    plainView.style.display = "none";
    tsView.style.display    = "flex";
    btn.textContent         = "Hide Timestamps";
    btn.classList.add("active");
  } else {
    plainView.style.display = "block";
    tsView.style.display    = "none";
    btn.textContent         = "Show Timestamps";
    btn.classList.remove("active");
  }
}


// ═══════════════════════════════════════════════════════════
// TRANSLATION
// ═══════════════════════════════════════════════════════════

async function translateTranscript() {
  const langSelect = document.getElementById("lang-select");
  const targetLang = langSelect.value;

  if (!targetLang) {
    alert("Please select a language first!");
    return;
  }
  if (!lastTranscript) {
    alert("No transcript to translate. Please transcribe audio first.");
    return;
  }

  const btn      = document.getElementById("translate-btn");
  btn.textContent = "Translating...";
  btn.disabled    = true;

  try {
    const response = await fetch(`${API_URL}/translate`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ text: lastTranscript, target_language: targetLang })
    });
    const result = await response.json();

    if (result.success) {
      document.getElementById("translated-text").textContent      = result.translated;
      document.getElementById("translated-lang-label").textContent = "Translated to " + result.language;
      document.getElementById("translated-box").classList.add("visible");
      document.getElementById("translated-box").scrollIntoView({ behavior: "smooth" });
    } else {
      alert("Translation failed: " + result.error);
    }
  } catch (error) {
    alert("Could not connect to translation service. Is the server running?");
  }

  btn.textContent = "Translate";
  btn.disabled    = false;
}

function copyTranslation() {
  const text = document.getElementById("translated-text").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btns = document.querySelectorAll(".btn-copy");
    if (btns[1]) {
      btns[1].textContent = "Copied!";
      setTimeout(() => btns[1].textContent = "Copy", 2000);
    }
  });
}


// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// EXPORT FUNCTIONS — TXT, SRT, PDF
// ═══════════════════════════════════════════════════════════

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportTXT() {
  if (!lastTranscript) { alert("No transcript to export!"); return; }
  const now     = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  const words   = lastTranscript.trim().split(/\s+/).length;
  const content = [
    "VoiceScript — Transcript Export",
    "================================",
    "Date  : " + dateStr,
    "Words : " + words,
    "",
    "TRANSCRIPT",
    "----------",
    lastTranscript,
    "",
    "--------------------------------",
    "Exported by VoiceScript · AI Speech Recognition",
    "https://huggingface.co/spaces/Tusharz/VoiceScript"
  ].join("\n");
  downloadFile("VoiceScript_Transcript.txt", content, "text/plain");
}

function secondsToSRT(totalSeconds) {
  const h  = Math.floor(totalSeconds / 3600);
  const m  = Math.floor((totalSeconds % 3600) / 60);
  const s  = Math.floor(totalSeconds % 60);
  return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0") + ",000";
}

function exportSRT() {
  if (!lastTranscript) { alert("No transcript to export!"); return; }
  let srtContent = "";

  if (lastSegments && lastSegments.length > 0) {
    lastSegments.forEach(function(seg, i) {
      srtContent += (i + 1) + "\n" + secondsToSRT(seg.start) + " --> " + secondsToSRT(seg.end) + "\n" + seg.text + "\n\n";
    });
  } else {
    const words = lastTranscript.trim().split(/\s+/);
    const size  = 10;
    let idx = 1;
    for (let i = 0; i < words.length; i += size) {
      const chunk = words.slice(i, i + size).join(" ");
      srtContent += idx + "\n" + secondsToSRT((idx-1)*5) + " --> " + secondsToSRT(idx*5) + "\n" + chunk + "\n\n";
      idx++;
    }
  }
  downloadFile("VoiceScript_Subtitles.srt", srtContent, "text/plain");
}

function exportPDF() {
  if (!lastTranscript) { alert("No transcript to export!"); return; }
  const now     = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  const words   = lastTranscript.trim().split(/\s+/).length;

  const printHTML = "<!DOCTYPE html><html><head><meta charset='UTF-8'/><title>VoiceScript Transcript</title>"
    + "<style>"
    + "body{font-family:Georgia,serif;color:#1a1a2e;padding:60px;max-width:800px;margin:0 auto;line-height:1.8}"
    + ".brand{font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6366f1;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}"
    + "h1{font-size:28px;color:#1a1a2e;margin-bottom:8px}"
    + ".header{border-bottom:3px solid #6366f1;padding-bottom:20px;margin-bottom:32px}"
    + ".meta{font-size:13px;color:#666;font-family:Arial,sans-serif}"
    + ".body{font-size:16px;line-height:2;text-align:justify;margin-bottom:40px}"
    + ".footer{border-top:1px solid #ddd;padding-top:16px;font-size:12px;color:#999;font-family:Arial,sans-serif;text-align:center}"
    + "</style></head><body>"
    + "<div class='header'><div class='brand'>VoiceScript — AI Speech Recognition</div>"
    + "<h1>Transcript</h1>"
    + "<div class='meta'>Generated on " + dateStr + " &nbsp;·&nbsp; " + words + " words</div></div>"
    + "<div class='body'>" + lastTranscript.replace(/\n/g, "<br/>") + "</div>"
    + "<div class='footer'>Transcribed by VoiceScript · Powered by OpenAI Whisper + Facebook Demucs<br/>"
    + "huggingface.co/spaces/Tusharz/VoiceScript</div>"
    + "</body></html>";

  const win = window.open("", "_blank");
  win.document.write(printHTML);
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 600);
}

function copyTranscript() {
  const text = document.getElementById("transcript-text").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copy-btn");
    btn.textContent = "Copied!";
    setTimeout(() => btn.textContent = "Copy Text", 2000);
  });
}

function startTimer() {
  secondsElapsed = 0;
  timerInterval  = setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
    const secs = String(secondsElapsed % 60).padStart(2, "0");
    document.getElementById("record-timer").textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("record-timer").textContent = "00:00";
  secondsElapsed = 0;
}

// Drag and drop
const dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#6366f1";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "";
  const file = e.dataTransfer.files[0];
  if (file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById("audio-file-input").files = dt.files;
    document.getElementById("file-name-display").textContent = file.name;
    document.getElementById("drop-text").textContent = "File selected:";
  }
});
