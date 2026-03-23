"""
Image processing utilities for uploaded photos.

- Converts non-web-friendly formats (HEIC, HEIF, TIFF, BMP) to JPEG
- Fixes EXIF orientation (phone photos that display rotated)
- Passes through web-native formats (JPEG, PNG, WebP) as-is
"""

from __future__ import annotations

import io
import logging
from typing import Optional, Tuple
from PIL import Image, ImageOps

logger = logging.getLogger(__name__)

# Register HEIC/HEIF support
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    logger.info("HEIF/HEIC support registered")
except ImportError:
    logger.warning("pillow-heif not installed; HEIC uploads will fail")

# Formats detected by Pillow that need conversion to JPEG
PILLOW_FORMATS_CONVERT = {"HEIF", "HEIC", "TIFF", "BMP", "MPO"}

# Web-native Pillow format names
WEB_NATIVE = {"JPEG", "PNG", "WEBP"}

# All accepted MIME types (for API-level validation)
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "image/heic", "image/heif",
    "image/tiff", "image/bmp", "image/x-ms-bmp",
}


def process_image(file_bytes: bytes, content_type: Optional[str] = None) -> Tuple[bytes, str, str]:
    """
    Process an uploaded image file.

    Returns:
        (processed_bytes, new_content_type, file_extension)
    """
    # Let Pillow detect the actual format (more reliable than content_type)
    img = Image.open(io.BytesIO(file_bytes))
    detected_format = (img.format or "").upper()
    logger.info(f"Processing image: content_type={content_type}, detected_format={detected_format}, mode={img.mode}")

    # Fix EXIF orientation (handles rotated phone photos)
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass  # Some formats don't have EXIF data

    # Decide based on what Pillow actually detected, not the MIME type
    if detected_format in PILLOW_FORMATS_CONVERT or detected_format not in WEB_NATIVE:
        # Convert to JPEG
        if img.mode not in ("RGB",):
            img = img.convert("RGB")
        output = io.BytesIO()
        img.save(output, format="JPEG", quality=90, optimize=True)
        logger.info(f"Converted {detected_format} -> JPEG ({len(output.getvalue())} bytes)")
        return output.getvalue(), "image/jpeg", ".jpg"

    # Web-native formats: re-save to apply orientation fix
    output = io.BytesIO()

    if detected_format == "PNG":
        img.save(output, format="PNG", optimize=True)
        return output.getvalue(), "image/png", ".png"
    elif detected_format == "WEBP":
        img.save(output, format="WEBP", quality=90)
        return output.getvalue(), "image/webp", ".webp"
    else:
        # JPEG
        if img.mode not in ("RGB",):
            img = img.convert("RGB")
        img.save(output, format="JPEG", quality=90, optimize=True)
        return output.getvalue(), "image/jpeg", ".jpg"
