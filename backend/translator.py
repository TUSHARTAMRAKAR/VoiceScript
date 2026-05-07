# translator.py
# ---------------------------------------------------------
# THIS FILE HAS ONE JOB:
#   Take a text + target language → return translated text
#
# We use deep-translator library which is:
#   - 100% free, no API key needed
#   - Supports 100+ languages
#   - Uses Google Translate engine under the hood
#   - Simple and reliable
# ---------------------------------------------------------

from deep_translator import GoogleTranslator

# All supported languages with their display names and codes
# Code is what Google Translate uses internally
SUPPORTED_LANGUAGES = {
    "af": "Afrikaans",
    "sq": "Albanian",
    "ar": "Arabic",
    "bn": "Bengali",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "et": "Estonian",
    "fi": "Finnish",
    "fr": "French",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "hi": "Hindi",
    "hu": "Hungarian",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "kn": "Kannada",
    "ko": "Korean",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "ms": "Malay",
    "ml": "Malayalam",
    "mr": "Marathi",
    "ne": "Nepali",
    "no": "Norwegian",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "ro": "Romanian",
    "ru": "Russian",
    "sr": "Serbian",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "es": "Spanish",
    "sw": "Swahili",
    "sv": "Swedish",
    "tl": "Filipino",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "cy": "Welsh",
}


def translate_text(text, target_language_code):
    """
    Translates text to the target language.

    text                — the transcript string to translate
    target_language_code — e.g. "hi" for Hindi, "fr" for French

    Returns a dict with success status and translated text.
    """

    # Validate the language code
    if target_language_code not in SUPPORTED_LANGUAGES:
        return {
            "success": False,
            "error": f"Unsupported language code: {target_language_code}"
        }

    try:
        print(f"[INFO] Translating to {SUPPORTED_LANGUAGES[target_language_code]}...")

        # GoogleTranslator takes source and target language
        # source="auto" means it detects the input language automatically
        translator = GoogleTranslator(
            source="auto",
            target=target_language_code
        )

        # Google Translate has a ~5000 character limit per request
        # For long transcripts we split into chunks and translate each
        if len(text) <= 4500:
            translated = translator.translate(text)
        else:
            translated = translate_long_text(text, target_language_code)

        print(f"[INFO] Translation complete!")

        return {
            "success": True,
            "translated": translated,
            "language": SUPPORTED_LANGUAGES[target_language_code],
            "language_code": target_language_code
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Translation failed: {str(e)}"
        }


def translate_long_text(text, target_language_code):
    """
    Splits long text into chunks of ~4500 chars,
    translates each chunk, then joins them back together.
    """
    # Split by sentences (periods) to avoid cutting mid-sentence
    sentences = text.replace(". ", ".|").split("|")
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) < 4500:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    # Translate each chunk
    translator = GoogleTranslator(source="auto", target=target_language_code)
    translated_chunks = []

    for i, chunk in enumerate(chunks):
        print(f"[INFO] Translating chunk {i+1}/{len(chunks)}...")
        translated_chunks.append(translator.translate(chunk))

    return " ".join(translated_chunks)


def get_supported_languages():
    """Returns the full list of supported languages for the frontend."""
    return SUPPORTED_LANGUAGES
