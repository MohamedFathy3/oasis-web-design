#!/usr/bin/env python3
"""Prepare portable, optimized local media for the Viral Zoom site."""
from __future__ import annotations

from pathlib import Path
import json
import re
import shutil
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
CAMPAIGN = PUBLIC / "media/campaign"
VIDEO = PUBLIC / "media/video/social-campaign-reel.mp4"
SOURCE = ROOT / "src/assets/Viral Zoom Creative Agency Banner.png"

CAMPAIGN_NAMES = [*(f"social-{i:02d}" for i in range(1, 9)), *(f"meta-sample-{i:02d}" for i in range(1, 4))]


def write_logo(path: Path, mark_path: str, *, white: bool) -> None:
    mark_color = "#ffffff" if white else "#69499e"
    text_color = "#ffffff" if white else "#21152d"
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 86" role="img" aria-labelledby="title">
  <title id="title">Viral Zoom</title>
  <svg x="0" y="2" width="82" height="82" viewBox="150 150 416 416" aria-hidden="true">
    <path d="{mark_path}" fill="{mark_color}"/>
  </svg>
  <text x="99" y="59" fill="{text_color}" font-family="Inter, Arial, sans-serif" font-size="43" font-weight="700" letter-spacing="-1.2">Viral Zoom</text>
</svg>
'''
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(svg, encoding="utf-8")


def make_client_placeholders() -> None:
    directory = PUBLIC / "media/clients"
    directory.mkdir(parents=True, exist_ok=True)
    colors = ["#6b46a7", "#4b2b77", "#7b54ae", "#43255f", "#8c6bc0"]
    for index in range(10):
        color = colors[index % len(colors)]
        n = index + 1
        # These are explicitly numbered sample placeholders, not claimed client brands.
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120" role="img" aria-label="Sample client {n}">
  <rect x="1" y="1" width="298" height="118" rx="18" fill="#fff" stroke="#eeeaf3" stroke-width="2"/>
  <circle cx="60" cy="60" r="35" fill="{color}" opacity=".12"/>
  <path d="M43 69 59 37l17 32H62l-3-7-4 7z" fill="{color}"/>
  <text x="112" y="69" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#6c6575">Client {n:02d}</text>
</svg>
'''
        (directory / f"client-{index}.svg").write_text(svg, encoding="utf-8")


def set_manifest(name: str, url: str, content_type: str | None = None) -> None:
    path = ROOT / "src/assets" / f"{name}.asset.json"
    doc = json.loads(path.read_text(encoding="utf-8"))
    doc["url"] = url
    if content_type:
        doc["content_type"] = content_type
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if not VIDEO.is_file():
        raise SystemExit(f"Generated video is missing: {VIDEO}")
    if not SOURCE.is_file():
        raise SystemExit(f"Brand reference is missing: {SOURCE}")
    CAMPAIGN.mkdir(parents=True, exist_ok=True)

    # The original model PNGs are kept as local source assets; only WebP is served publicly.
    source_dir = ROOT / "media-source/campaign"
    source_dir.mkdir(parents=True, exist_ok=True)
    for name in CAMPAIGN_NAMES:
        png_public = CAMPAIGN / f"{name}.png"
        png_source = source_dir / f"{name}.png"
        if png_public.is_file() and not png_source.exists():
            shutil.move(str(png_public), str(png_source))
        if not png_source.is_file():
            raise SystemExit(f"Generated source image is missing: {png_source}")
        with Image.open(png_source) as image:
            image.convert("RGB").save(CAMPAIGN / f"{name}.webp", "WEBP", quality=85, method=6)

    # Build a crisp, transparent wordmark using the exact mark embedded in the supplied brand banner.
    raw = SOURCE.read_bytes()
    svg_start = raw.find(b"<svg")
    svg_end = raw.find(b"</svg>", svg_start)
    if svg_start < 0 or svg_end < 0:
        raise SystemExit("The supplied brand banner does not contain the original vector mark.")
    embedded = raw[svg_start : svg_end + len(b"</svg>")].decode("utf-8", "replace")
    match = re.search(r'<path[^>]*d="([^"]+)"', embedded)
    if not match:
        raise SystemExit("Could not extract the supplied vector mark.")
    write_logo(PUBLIC / "media/viral-zoom-logo.svg", match.group(1), white=False)
    write_logo(PUBLIC / "media/viral-zoom-logo-white.svg", match.group(1), white=True)
    make_client_placeholders()

    silent_video = VIDEO.with_name("social-campaign-reel.silent.mp4")
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(VIDEO), "-c:v", "copy", "-an", "-movflags", "+faststart", str(silent_video)],
        check=True,
    )
    silent_video.replace(VIDEO)

    # A representative frame becomes the poster; the original MP4 remains editable in the CMS.
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", "0.5", "-i", str(VIDEO), "-frames:v", "1", "-q:v", "2", str(PUBLIC / "media/video/social-campaign-poster.jpg")],
        check=True,
    )
    webm = PUBLIC / "media/video/social-campaign-reel.webm"
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(VIDEO), "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", str(webm)],
        check=True,
    )

    for index in range(10):
        set_manifest(f"client-{index}.jpg", f"/media/clients/client-{index}.svg", "image/svg+xml")
    for index in range(6):
        set_manifest(f"portfolio-{index}.jpg", f"/media/campaign/social-{index + 1:02d}.webp", "image/webp")
    for name, url in {
        "logo.png": "/media/viral-zoom-logo.svg",
        "logo-white.png": "/media/viral-zoom-logo-white.svg",
        "hero.mp4": "/media/video/social-campaign-reel.mp4",
        "hero.webm": "/media/video/social-campaign-reel.webm",
        "poster.jpg": "/media/video/social-campaign-poster.jpg",
        "social.jpg": "/media/campaign/social-07.webp",
        "events.jpg": "/media/campaign/social-08.webp",
        "animation.jpg": "/media/campaign/social-03.webp",
        "printing.jpg": "/media/campaign/social-05.webp",
        "seo.jpg": "/media/campaign/meta-sample-01.webp",
        "video.jpg": "/media/video/social-campaign-poster.jpg",
        "website.jpg": "/media/campaign/social-02.webp",
    }.items():
        suffix = ".svg" if "logo" in name else ".webp" if url.endswith(".webp") else ".webm" if url.endswith(".webm") else ".mp4" if url.endswith(".mp4") else ".jpg"
        media_type = {".svg": "image/svg+xml", ".webp": "image/webp", ".webm": "video/webm", ".mp4": "video/mp4", ".jpg": "image/jpeg"}[suffix]
        set_manifest(name, url, media_type)

    print("Prepared local media:")
    for path in [PUBLIC / "media/viral-zoom-logo.svg", PUBLIC / "media/viral-zoom-logo-white.svg", PUBLIC / "media/video/social-campaign-poster.jpg", webm]:
        print(f"- {path.relative_to(ROOT)} ({path.stat().st_size:,} bytes)")
    print(f"- {len(CAMPAIGN_NAMES)} optimized campaign WebP images")
    print("- 10 numbered, clearly marked client placeholders")
    print("- all legacy asset manifests now point to local URLs")


if __name__ == "__main__":
    main()
