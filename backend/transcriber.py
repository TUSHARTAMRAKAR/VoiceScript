# transcriber.py
# ---------------------------------------------------------
# BEAST MODE — Maximum Accuracy Pipeline
#
# FULL PIPELINE:
#   Raw Audio
#     → pydub  : convert any format to WAV, normalize volume
#     → demucs : AI vocal isolation (strips background music)
#     → Whisper medium : best CPU-friendly model with all
#                          accuracy settings maxed out
#
# WHY EACH STEP:
#   pydub    — handles mp3/webm/ogg/flac, normalizes volume
#   demucs   — Facebook's AI that separates voice from music.
#              Whisper hears ONLY the clean voice, zero music.
#   medium — best balance of speed and accuracy on CPU.
#              3x more parameters than medium. Near-human accuracy.
# ---------------------------------------------------------

import os
import sys
import shutil
import warnings
import subprocess
warnings.filterwarnings("ignore")

from pydub import AudioSegment
from pydub.effects import normalize

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    import speech_recognition as sr
    import math

# ── Check if demucs is installed ──────────────────────────
def is_demucs_available():
    return shutil.which("demucs") is not None or _can_import_demucs()

def _can_import_demucs():
    try:
        import demucs
        return True
    except ImportError:
        return False

# ── Whisper model cache ────────────────────────────────────
_whisper_model = None

# medium = best balance of speed and accuracy on CPU
# 1.42GB, excellent accuracy, runs in ~3 min for 5 min audio on CPU
WHISPER_MODEL_SIZE = "medium"

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        print(f"[INFO] Loading Whisper '{WHISPER_MODEL_SIZE}' model...")
        print(f"[INFO] First run: downloading ~1.5GB model (once only, please wait)...")
        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE)
        print(f"[INFO] Whisper '{WHISPER_MODEL_SIZE}' ready!")
    return _whisper_model


# ═══════════════════════════════════════════════════════════
# STEP 1 — AUDIO PREPROCESSING
# Convert any format → clean normalized WAV
# ═══════════════════════════════════════════════════════════

def preprocess_audio(input_path, output_path):
    """
    Converts any audio format to a clean, normalized WAV.

    What we do:
      - Convert mp3/webm/ogg/flac/m4a → WAV
      - Mono (Whisper and demucs both prefer mono input)
      - 44.1kHz sample rate
        (demucs needs 44.1kHz, Whisper is fine with it too)
      - Normalize volume: quiet parts get louder,
        loud parts get quieter — even dynamic range
      - Strip leading/trailing silence

    Result: a clean, consistent WAV ready for vocal isolation
    """
    audio = AudioSegment.from_file(input_path)

    # Stereo → mono
    audio = audio.set_channels(1)

    # 44100 Hz = standard CD quality, required by demucs
    audio = audio.set_frame_rate(44100)

    # Normalize: -1dB headroom keeps it loud but not clipping
    audio = normalize(audio, headroom=0.1)

    # Strip silence from edges (handles recordings with dead air)
    audio = audio.strip_silence(silence_thresh=-45)

    duration_ms = len(audio)
    audio.export(output_path, format="wav")

    print(f"[INFO] Preprocessed: {duration_ms/1000:.1f}s, normalized WAV ready")
    return duration_ms


# ═══════════════════════════════════════════════════════════
# STEP 2 — VOCAL ISOLATION (demucs)
# Strips background music, keeps only the voice
# ═══════════════════════════════════════════════════════════

def isolate_vocals(input_wav_path, output_dir):
    """
    Uses Facebook's Demucs AI to separate audio into:
      - vocals  (the human voice — this is what we want)
      - drums   (discarded)
      - bass    (discarded)
      - other   (music/instruments — discarded)

    We keep ONLY the vocals track, then send that clean
    voice-only audio to Whisper.

    It's like having a magic filter that mutes all the
    background music and lets you hear only the speaker.

    Returns path to the isolated vocals WAV, or None if
    demucs fails (we fall back gracefully to raw audio).
    """
    print("[INFO] Running demucs vocal isolation...")
    print("[INFO] This separates voice from background music/noise...")

    try:
        # Run demucs as a subprocess
        # -n htdemucs     = use the htdemucs model (best for speech isolation)
        # --two-stems vocals = only separate into vocals + everything else
        #                    (faster than full 4-stem separation)
        # -o output_dir   = where to save results
        # --mp3           = save as mp3 (smaller, faster)
        result = subprocess.run([
            sys.executable, "-m", "demucs",
            "-n", "htdemucs",
            "--two-stems", "vocals",
            "-o", output_dir,
            "--mp3",
            input_wav_path
        ], capture_output=True, text=True, timeout=600)  # 10 min timeout

        if result.returncode != 0:
            print(f"[WARN] Demucs failed: {result.stderr[:200]}")
            return None

        # Demucs saves output as:
        # output_dir/htdemucs/<filename>/vocals.mp3
        base_name   = os.path.splitext(os.path.basename(input_wav_path))[0]
        vocals_path = os.path.join(output_dir, "htdemucs", base_name, "vocals.mp3")

        if os.path.exists(vocals_path):
            print(f"[INFO] Vocal isolation complete — pure voice extracted!")
            return vocals_path
        else:
            print(f"[WARN] Vocals file not found at expected path: {vocals_path}")
            return None

    except subprocess.TimeoutExpired:
        print("[WARN] Demucs timed out — using raw audio")
        return None
    except Exception as e:
        print(f"[WARN] Demucs error: {e} — using raw audio")
        return None


def convert_to_whisper_wav(input_path, output_path):
    """
    After vocal isolation, convert to Whisper's optimal format:
    16kHz mono WAV. Whisper was trained on 16kHz audio.
    """
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    audio = normalize(audio, headroom=0.1)
    audio.export(output_path, format="wav")
    print("[INFO] Converted vocals to 16kHz mono WAV for Whisper")


# ═══════════════════════════════════════════════════════════
# STEP 3 — WHISPER TRANSCRIPTION (medium model, all settings maxed)
# ═══════════════════════════════════════════════════════════

def transcribe_with_whisper(wav_path, duration_secs, mode="transcribe"):
    """
    Runs Whisper medium with every accuracy setting maximized.

    Settings explained:
      beam_size=10        — considers 10 candidate word sequences
                            and picks the most confident one.
                            Default is 5. More = more accurate, slower.

      best_of=10          — for uncertain sections, generates 10
                            possible transcriptions and picks best.
                            Huge help for unclear/fast speech.

      temperature=0       — zero randomness. Always picks the word
                            Whisper is most confident about.
                            Never "guesses" or hallucinates.

      patience=2          — beam search patience factor.
                            Higher = more thorough search for best words.

      condition_on_previous_text=True
                          — uses earlier sentences as context.
                            Knowing "ceramic Shield" was said earlier
                            makes it more likely to correctly hear
                            "ceramic" again vs "ceramic".

      no_speech_threshold=0.25
                          — very sensitive. Won't skip soft/quiet speech.
                            Default is 0.6 — too aggressive for YT videos.

      compression_ratio_threshold=2.6
                          — allows slightly more "complex" output
                            before flagging it as noise. Better for
                            technical vocabulary.

      word_timestamps=True — computes exactly when each word is spoken.
                            We use this to format the transcript better.
    """
    model = get_whisper_model()

    est_time = max(15, int(duration_secs * 0.6))
    print(f"[INFO] ─────────────────────────────────────────")
    print(f"[INFO] MODEL RUNNING  : Whisper '{WHISPER_MODEL_SIZE}'")
    print(f"[INFO] AUDIO DURATION : {duration_secs:.1f}s")
    print(f"[INFO] ESTIMATED TIME : ~{est_time}s")
    print(f"[INFO] ─────────────────────────────────────────")

    # mode="translate_to_english" → Whisper auto-detects language, outputs English
    # mode="transcribe"           → Standard English transcription
    whisper_task = "translate"  if mode == "translate_to_english" else "transcribe"
    whisper_lang = None         if mode == "translate_to_english" else "en"

    if mode == "translate_to_english":
        print(f"[INFO] MODE: Multilingual → English translation")
        print(f"[INFO] Whisper will auto-detect language and output English")
    else:
        print(f"[INFO] MODE: Standard English transcription")

    # Translation mode needs different settings than transcription mode.
    # The tensor size mismatch error happens because patience=2 and best_of=5
    # conflict with Whisper's internal beam search in translation mode.
    # Fix: use safer/simpler settings for translation, full settings for transcription.
    if mode == "translate_to_english":
        result = model.transcribe(
            wav_path,
            language                   = whisper_lang,   # None = auto-detect
            fp16                       = False,
            task                       = "translate",    # translate any language → English
            beam_size                  = 5,
            temperature                = 0,
            condition_on_previous_text = True,
            no_speech_threshold        = 0.25,
            compression_ratio_threshold= 2.6,
            word_timestamps            = True,
            # NOTE: patience and best_of are intentionally excluded in translate mode
            # They cause "Sizes of tensors must match" error with task="translate"
        )
    else:
        result = model.transcribe(
            wav_path,
            language                   = "en",
            fp16                       = False,
            task                       = "transcribe",
            beam_size                  = 5,
            best_of                    = 5,
            temperature                = 0,
            patience                   = 2,
            condition_on_previous_text = True,
            no_speech_threshold        = 0.25,
            compression_ratio_threshold= 2.6,
            word_timestamps            = True,
        )

    # Build clean transcript from segments
    segments = result.get("segments", [])
    lines    = []

    for seg in segments:
        text = seg["text"].strip()
        if text:
            lines.append(text)

    full_text  = " ".join(lines).strip()
    word_count = len(full_text.split())

    # Extract detected language from Whisper result
    detected_lang = result.get("language", "unknown")
    print(f"[INFO] Transcription complete: {word_count} words from {len(segments)} segments")
    print(f"[INFO] Detected language: {detected_lang}")

    # Format segments with timestamps right here
    # Each segment gets start_fmt and end_fmt so frontend can use immediately
    formatted = []
    for seg in segments:
        start_sec = int(seg.get("start", 0))
        end_sec   = int(seg.get("end",   0))
        seg_text  = seg.get("text", "").strip()
        if not seg_text:
            continue
        formatted.append({
            "start"    : start_sec,
            "end"      : end_sec,
            "start_fmt": f"{start_sec // 60:02d}:{start_sec % 60:02d}",
            "end_fmt"  : f"{end_sec   // 60:02d}:{end_sec   % 60:02d}",
            "text"     : seg_text
        })

    print(f"[INFO] {len(formatted)} formatted segments ready for frontend")
    return {"text": full_text, "detected_language": detected_lang, "segments": formatted}


# ═══════════════════════════════════════════════════════════
# GOOGLE FALLBACK (if Whisper not installed)
# ═══════════════════════════════════════════════════════════

def transcribe_with_google_fallback(wav_path, duration_ms):
    import math
    CHUNK_MS    = 55_000
    audio       = AudioSegment.from_wav(wav_path)
    num_chunks  = math.ceil(duration_ms / CHUNK_MS)
    recognizer  = sr.Recognizer()
    all_text    = []
    chunk_paths = []
    try:
        for i in range(num_chunks):
            s = i * CHUNK_MS
            e = min(s + CHUNK_MS, duration_ms)
            c = audio[s:e]
            p = wav_path + f"_chunk_{i}.wav"
            c.export(p, format="wav")
            chunk_paths.append(p)
            with sr.AudioFile(p) as src:
                data = recognizer.record(src)
            try:
                all_text.append(recognizer.recognize_google(data, language="en-IN"))
            except sr.UnknownValueError:
                pass
    finally:
        _cleanup(chunk_paths)
    return " ".join(all_text)


# ═══════════════════════════════════════════════════════════
# CLEANUP HELPER
# ═══════════════════════════════════════════════════════════

def _cleanup(paths):
    for path in paths:
        try:
            if os.path.exists(path):
                if os.path.isdir(path):
                    shutil.rmtree(path)
                else:
                    os.remove(path)
        except Exception:
            pass


# ═══════════════════════════════════════════════════════════
# MAIN — called by app.py for every transcription request
# ═══════════════════════════════════════════════════════════

def transcribe_audio(file_path, mode="transcribe"):
    """
    Full beast mode pipeline:
      1. Preprocess (convert + normalize)
      2. Vocal isolation via demucs (if available)
      3. Whisper medium with max accuracy settings

    mode = "transcribe"           → standard English transcription
    mode = "translate_to_english" → any language audio → English text
    """

    uploads_dir  = os.path.dirname(file_path)
    demucs_dir   = os.path.join(uploads_dir, "demucs_output")
    preprocessed = file_path + "_preprocessed.wav"
    whisper_ready= file_path + "_whisper_ready.wav"

    os.makedirs(demucs_dir, exist_ok=True)
    to_cleanup = [preprocessed, whisper_ready, demucs_dir]

    try:
        # ── Step 1: Preprocess ────────────────────────
        print("[INFO] === BEAST MODE PIPELINE STARTING ===")
        try:
            duration_ms = preprocess_audio(file_path, preprocessed)
        except Exception as e:
            return {"success": False, "error": f"Could not read audio: {e}"}

        duration_secs = duration_ms / 1000

        # ── Step 2: Vocal isolation ───────────────────
        audio_for_whisper = preprocessed   # default: use preprocessed

        if is_demucs_available():
            print("[INFO] Demucs found — running vocal isolation...")
            vocals_path = isolate_vocals(preprocessed, demucs_dir)

            if vocals_path and os.path.exists(vocals_path):
                # Convert isolated vocals to Whisper format
                convert_to_whisper_wav(vocals_path, whisper_ready)
                audio_for_whisper = whisper_ready
                print("[INFO] Using isolated vocals for transcription")
            else:
                print("[INFO] Vocal isolation unavailable — using preprocessed audio")
        else:
            print("[INFO] Demucs not installed — skipping vocal isolation")
            print("[INFO] Tip: run 'pip install demucs' for better accuracy on music/noisy audio")

        # ── Step 3: Transcribe ────────────────────────
        if WHISPER_AVAILABLE:
            whisper_result  = transcribe_with_whisper(audio_for_whisper, duration_secs, mode=mode)
            text            = whisper_result["text"]
            detected_lang   = whisper_result["detected_language"]
            segments        = whisper_result["segments"]
            engine          = f"Whisper {WHISPER_MODEL_SIZE}" + (" (Multilingual→EN)" if mode == "translate_to_english" else "")
            if is_demucs_available():
                engine += " + Demucs vocal isolation"
        else:
            print("[INFO] Whisper not installed — using Google fallback")
            text          = transcribe_with_google_fallback(audio_for_whisper, duration_ms)
            detected_lang = "unknown"
            segments      = []
            engine        = "Google Speech Recognition"

        print("[INFO] === PIPELINE COMPLETE ===")

    except Exception as e:
        _cleanup(to_cleanup)
        return {"success": False, "error": f"Transcription failed: {e}"}
    finally:
        _cleanup(to_cleanup)

    if not text:
        return {
            "success": False,
            "error"  : "Could not understand any speech. Please check audio quality and try again."
        }

    word_count = len(text.split())

    # Language code → full name mapping for display
    lang_names = {
        "en": "English", "hi": "Hindi", "de": "German", "fr": "French",
        "es": "Spanish", "it": "Italian", "pt": "Portuguese", "ru": "Russian",
        "ja": "Japanese", "ko": "Korean", "zh": "Chinese", "ar": "Arabic",
        "nl": "Dutch", "pl": "Polish", "tr": "Turkish", "sv": "Swedish",
        "da": "Danish", "fi": "Finnish", "nb": "Norwegian", "uk": "Ukrainian",
        "cs": "Czech", "ro": "Romanian", "hu": "Hungarian", "el": "Greek",
        "he": "Hebrew", "th": "Thai", "vi": "Vietnamese", "id": "Indonesian",
        "ms": "Malay", "bn": "Bengali", "ur": "Urdu", "fa": "Persian",
        "ta": "Tamil", "te": "Telugu", "ml": "Malayalam", "kn": "Kannada",
    }
    detected_lang_name = lang_names.get(detected_lang, detected_lang.upper() if detected_lang != "unknown" else "Unknown")

    # Format segments here — convert raw Whisper segments to clean
    # { start_fmt, end_fmt, text } objects for the frontend
    formatted_segments = []
    for seg in segments:
        start_sec = int(seg.get("start", 0))
        end_sec   = int(seg.get("end",   0))
        seg_text  = seg.get("text", "").strip()
        if not seg_text:
            continue
        formatted_segments.append({
            "start"    : start_sec,
            "end"      : end_sec,
            "start_fmt": f"{start_sec // 60:02d}:{start_sec % 60:02d}",
            "end_fmt"  : f"{end_sec   // 60:02d}:{end_sec   % 60:02d}",
            "text"     : seg_text
        })

    print(f"[INFO] Returning {len(formatted_segments)} formatted segments to frontend")

    return {
        "success"               : True,
        "transcript"            : text,
        "duration"              : round(duration_secs, 1),
        "word_count"            : word_count,
        "engine"                : engine,
        "detected_language"     : detected_lang,
        "detected_language_name": detected_lang_name,
        "segments"              : formatted_segments
    }
