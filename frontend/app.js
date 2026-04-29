/*
  app.js
  ---------------------------------------------------------
  UPDATED FOR HUGGING FACE DEPLOYMENT:

  When running locally:  API_URL = "http://localhost:7860"
  When running on HF:    API_URL = ""  (empty = same server)

  Because on HF Spaces, Flask serves BOTH the frontend HTML
  AND the /transcribe API from the same server. So we use
  a relative URL — no need to hardcode any domain.
  ---------------------------------------------------------
*/

// Empty string "" means "same server this page is served from"
// Works both locally (localhost:7860) and on HF Spaces URL
const API_URL = "";

// ── Variables to track recording state ────────────────────
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;
let secondsElapsed = 0;


// ═══════════════════════════════════════════════════════════
// SECTION 1: FILE UPLOAD
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
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an audio file first!");
    return;
  }

  const formData = new FormData();
  formData.append("audio", file);

  showLoading();

  try {
    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    handleResult(result);

  } catch (error) {
    showError("Could not connect to backend. Is the server running? (python backend/app.py)");
  }
}


// ═══════════════════════════════════════════════════════════
// SECTION 2: MICROPHONE RECORDING
// ═══════════════════════════════════════════════════════════

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/ogg";
    mediaRecorder = new MediaRecorder(stream, { mimeType });

    audioChunks = [];

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
    document.getElementById("stop-btn").disabled = false;

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
  document.getElementById("stop-btn").disabled = true;

  stopTimer();
  showLoading();
}

async function sendAudioToBackend(audioBlob) {
  const formData = new FormData();
  const ext = audioBlob.type.includes("ogg") ? "ogg" : "webm";
  formData.append("audio", audioBlob, `recording.${ext}`);

  try {
    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    handleResult(result);
  } catch (error) {
    showError("Could not connect to backend. Is the server running?");
  }

  document.getElementById("record-status").textContent = "Ready to record";
}


// ═══════════════════════════════════════════════════════════
// SECTION 3: SHOWING RESULTS
// ═══════════════════════════════════════════════════════════

function handleResult(result) {
  hideLoading();
  if (result.success) {
    showTranscript(result.transcript, result.duration, result.chunks);
  } else {
    showError(result.error);
  }
}

function showTranscript(text, duration, chunks) {
  document.getElementById("results-section").classList.add("visible");
  document.getElementById("result-box").classList.add("visible");
  document.getElementById("error-box").classList.remove("visible");
  document.getElementById("transcript-text").textContent = text;

  const wordCount = text.trim().split(/\s+/).length;
  let meta = `${wordCount} words`;
  if (duration) meta += ` · ${duration}s audio`;
  if (chunks && chunks > 1) meta += ` · ${chunks} chunks processed`;
  document.getElementById("word-count").textContent = meta;

  document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
}

function showError(message) {
  document.getElementById("results-section").classList.add("visible");
  document.getElementById("result-box").classList.remove("visible");
  const errorBox = document.getElementById("error-box");
  document.getElementById("error-text").textContent = message;
  errorBox.classList.add("visible");
  document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
}

function showLoading() {
  document.getElementById("results-section").classList.add("visible");
  document.getElementById("loading-state").classList.add("visible");
  document.getElementById("result-box").classList.remove("visible");
  document.getElementById("error-box").classList.remove("visible");
}

function hideLoading() {
  document.getElementById("loading-state").classList.remove("visible");
}

function clearResults() {
  document.getElementById("results-section").classList.remove("visible");
  document.getElementById("result-box").classList.remove("visible");
  document.getElementById("error-box").classList.remove("visible");
  document.getElementById("loading-state").classList.remove("visible");
  document.getElementById("transcript-text").textContent = "";
}


// ═══════════════════════════════════════════════════════════
// SECTION 4: UTILITIES
// ═══════════════════════════════════════════════════════════

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
  timerInterval = setInterval(() => {
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

// Drag and drop support
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
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    document.getElementById("audio-file-input").files = dataTransfer.files;
    document.getElementById("file-name-display").textContent = file.name;
    document.getElementById("drop-text").textContent = "File selected:";
  }
});
