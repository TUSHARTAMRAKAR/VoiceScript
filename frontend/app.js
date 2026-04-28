/*
  app.js
  ─────────────────────────────────────────────────────────
  THIS FILE CONTROLS ALL THE INTERACTIVITY ON THE PAGE.

  It does 3 main things:
    1. Handles file upload → sends to backend → shows result
    2. Records mic audio → sends to backend → shows result
    3. Utility functions (copy, clear, timer, etc.)

  The backend is running at localhost:5000
  We send audio to it using "fetch()" — like a text message
  to the server.
  ─────────────────────────────────────────────────────────
*/

// The URL of our backend server
// When you run python app.py, it starts at this address
const API_URL = "http://localhost:5000";

// ── Variables to track recording state ────────────────────
let mediaRecorder = null;   // The object that records audio
let audioChunks = [];       // Pieces of audio collected while recording
let timerInterval = null;   // The countdown timer
let secondsElapsed = 0;     // How many seconds we've recorded


// ═══════════════════════════════════════════════════════════
// SECTION 1: FILE UPLOAD
// ═══════════════════════════════════════════════════════════

// This runs when a user picks a file from the file picker
// We listen for the "change" event on the hidden file input
document.getElementById("audio-file-input").addEventListener("change", function () {
  const file = this.files[0];  // Get the first selected file
  if (file) {
    // Show the file name in the drop zone
    document.getElementById("file-name-display").textContent = file.name;
    document.getElementById("drop-text").textContent = "File selected:";
  }
});

// Called when user clicks "Transcribe File" button
async function uploadAndTranscribe() {
  // Get the file from the input
  const fileInput = document.getElementById("audio-file-input");
  const file = fileInput.files[0];

  // If no file was picked, alert the user
  if (!file) {
    alert("Please select an audio file first!");
    return;
  }

  // Build a FormData object — this is how we package a file
  // to send over HTTP, like putting it in an envelope
  const formData = new FormData();
  formData.append("audio", file);  // "audio" matches what backend expects

  // Show the loading spinner while we wait
  showLoading();

  try {
    // fetch() sends an HTTP request to our backend
    // It's like sending a message and waiting for a reply
    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",       // POST = we're sending data
      body: formData,       // The audio file package
    });

    // Parse the response — the backend sends back JSON
    const result = await response.json();

    // Show the result on screen
    handleResult(result);

  } catch (error) {
    // This catches network errors (e.g. backend not running)
    showError("Could not connect to backend. Is the server running? (python app.py)");
  }
}


// ═══════════════════════════════════════════════════════════
// SECTION 2: MICROPHONE RECORDING
// ═══════════════════════════════════════════════════════════

async function startRecording() {
  try {
    // Ask the browser for permission to use the microphone
    // getUserMedia() returns a "stream" of audio data
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create a MediaRecorder attached to the mic stream
    // WHY THIS FIX: Browsers don't record in WAV — they use "webm" or "ogg".
    // We detect which one this browser supports and use that.
    // The backend (pydub) will convert it to WAV before transcribing.
    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/ogg";
    mediaRecorder = new MediaRecorder(stream, { mimeType });

    // Reset our audio collection
    audioChunks = [];

    // Every time a new chunk of audio is ready, add it to our array
    // This fires every few hundred milliseconds while recording
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    // When recording stops, this fires
    mediaRecorder.onstop = async () => {
      // Combine all the chunks into one audio Blob
      // We use the actual mimeType the browser used (not hardcoded wav)
      const audioBlob = new Blob(audioChunks, { type: mimeType });

      // Send it to the backend
      await sendAudioToBackend(audioBlob);

      // Stop all microphone tracks (releases the mic)
      stream.getTracks().forEach(track => track.stop());
    };

    // Start recording!
    mediaRecorder.start();

    // Update the UI to show "recording" state
    document.body.classList.add("recording");
    document.getElementById("record-status").textContent = "Recording...";
    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled = false;

    // Start the timer display
    startTimer();

  } catch (error) {
    // If mic permission was denied
    showError("Microphone access denied. Please allow mic access in your browser.");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();   // This triggers the onstop event above
  }

  // Reset the UI
  document.body.classList.remove("recording");
  document.getElementById("record-status").textContent = "Processing...";
  document.getElementById("start-btn").disabled = false;
  document.getElementById("stop-btn").disabled = true;

  stopTimer();
  showLoading();
}

// Sends the recorded audio blob to the backend
// The filename extension tells the backend what format it is
async function sendAudioToBackend(audioBlob) {
  const formData = new FormData();

  // Pick the right file extension based on what the browser recorded
  // .webm for Chrome/Edge, .ogg for Firefox
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

  // Reset record status label
  document.getElementById("record-status").textContent = "Ready to record";
}


// ═══════════════════════════════════════════════════════════
// SECTION 3: SHOWING RESULTS
// ═══════════════════════════════════════════════════════════

// Takes the result object from backend and shows it on screen
function handleResult(result) {
  // Now result also contains duration, chunks, word_count from backend
  hideLoading();

  if (result.success) {
    showTranscript(result.transcript, result.duration, result.chunks);
  } else {
    showError(result.error);
  }
}

function showTranscript(text, duration, chunks) {
  // Make the results section visible
  document.getElementById("results-section").classList.add("visible");

  // Show the result box, hide error
  document.getElementById("result-box").classList.add("visible");
  document.getElementById("error-box").classList.remove("visible");

  // Set the transcript text
  document.getElementById("transcript-text").textContent = text;

  // Calculate and show word count
  const wordCount = text.trim().split(/\s+/).length;
  let meta = `${wordCount} words`;
  if (duration) meta += ` · ${duration}s audio`;
  if (chunks && chunks > 1) meta += ` · ${chunks} chunks processed`;
  document.getElementById("word-count").textContent = meta;

  // Scroll down to show the result
  document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
}

function showError(message) {
  document.getElementById("results-section").classList.add("visible");
  document.getElementById("error-box").classList.add("visible");
  document.getElementById("error-box").classList.remove("visible"); // reset
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

// Copy transcript to clipboard
function copyTranscript() {
  const text = document.getElementById("transcript-text").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copy-btn");
    btn.textContent = "Copied!";
    setTimeout(() => btn.textContent = "Copy Text", 2000); // Reset after 2s
  });
}

// Timer functions — shows how long you've been recording
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

// Drag and drop support for the drop zone
const dropZone = document.getElementById("drop-zone");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();   // Prevent browser from opening the file
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
    // Programmatically set the file on the input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    document.getElementById("audio-file-input").files = dataTransfer.files;
    document.getElementById("file-name-display").textContent = file.name;
    document.getElementById("drop-text").textContent = "File selected:";
  }
});
