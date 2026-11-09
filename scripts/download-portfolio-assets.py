#!/usr/bin/env python3
"""Mirror the portfolio thumbnails already referenced by starplus-projects.ts."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import re
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/lib/starplus-projects.ts"
DEST = ROOT / "public/media/portfolio"
BASE = "https://starplus.agency/storage/images/portfolios/"
NAMES = list(dict.fromkeys(re.findall(r'image\("([^\"]+)"\)', SOURCE.read_text(encoding="utf-8"))))
DEST.mkdir(parents=True, exist_ok=True)


def fetch(name: str) -> tuple[str, bool, str]:
    target = DEST / name
    if target.exists() and target.stat().st_size > 1024:
        return name, True, "already present"
    request = urllib.request.Request(BASE + name, headers={"User-Agent": "ViralZoomPortfolioMirror/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            content_type = response.headers.get_content_type()
            data = response.read(25 * 1024 * 1024 + 1)
        if len(data) > 25 * 1024 * 1024:
            return name, False, "file exceeded 25 MiB limit"
        valid = data.startswith(b"\xff\xd8\xff") or data.startswith(b"\x89PNG\r\n\x1a\n")
        if not valid or content_type not in {"image/jpeg", "image/png", "application/octet-stream"}:
            return name, False, f"unexpected payload: {content_type}, {len(data)} bytes"
        with tempfile.NamedTemporaryFile(dir=DEST, prefix=f".{name}.", delete=False) as temporary:
            temporary.write(data)
            temp_path = Path(temporary.name)
        temp_path.replace(target)
        return name, True, f"{len(data)} bytes"
    except Exception as error:  # report all failures; the caller decides how to handle them
        return name, False, str(error)


if __name__ == "__main__":
    failures = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(fetch, name) for name in NAMES]
        for future in as_completed(futures):
            name, ok, detail = future.result()
            print(f"{'OK' if ok else 'FAIL'} {name}: {detail}")
            if not ok:
                failures.append(name)
    print(f"Mirrored {len(NAMES) - len(failures)}/{len(NAMES)} portfolio images.")
    if failures:
        raise SystemExit(f"Missing portfolio thumbnails: {', '.join(failures)}")
