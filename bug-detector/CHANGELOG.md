# Changelog

## [Updated] - OCR Model Fix

### Fixed
- **OCR Model Updated**: Replaced deprecated `llama-3.2-11b-vision-preview` with new `meta-llama/llama-4-scout-17b-16e-instruct`
- **MIME Type Detection**: Added proper MIME type detection for different image formats (PNG, JPEG, GIF)
- **Temperature Control**: Set temperature to 0.1 for more consistent OCR results
- **Better Error Messages**: Improved error output formatting

### Added
- `test_groq_ocr.py` - Standalone OCR testing script
- `install.sh` - Automated installation script
- Better documentation in QUICKSTART.md about the new model

### Technical Details

**Old Model (Deprecated):**
```python
model="llama-3.2-11b-vision-preview"
```

**New Model:**
```python
model="meta-llama/llama-4-scout-17b-16e-instruct"
```

**Changes in `extract_patterns.py`:**
1. Updated model name to use Groq's Llama 4 Scout vision model
2. Added MIME type detection based on file extension
3. Changed `max_tokens` to `max_completion_tokens` (new API parameter name)
4. Added `temperature=0.1` for consistent results
5. Enhanced error message prompt for better extraction

### Usage

After updating, run:
```bash
# Test OCR
python3 test_groq_ocr.py

# Extract patterns with new model
python3 cli.py extract
```

### References
- [Groq Vision API Docs](https://console.groq.com/docs/vision)
- Model: `meta-llama/llama-4-scout-17b-16e-instruct`
- Alternative: `meta-llama/llama-4-maverick-17b-128e-instruct`
