import json
import re
import shutil
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    Image = None

BASE = Path(__file__).parent
INBOX = BASE / "inbox"
DONE = INBOX / "done"
OUT = BASE / "photos"
DATA = BASE / "photos.js"
EXTS = {".jpg", ".jpeg", ".png"}
MAX_SIDE = 1600


def load():
    if not DATA.exists():
        return []
    text = DATA.read_text(encoding="utf-8")
    text = text[text.index("=") + 1:].strip().rstrip(";")
    return json.loads(text)


def save(photos):
    body = json.dumps(photos, indent=1, ensure_ascii=False)
    DATA.write_text("var photos = " + body + ";\n", encoding="utf-8")


def slug(text):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "photo"


def nice_title(filename):
    return re.sub(r"[-_]+", " ", Path(filename).stem).strip().title()


def main():
    for folder in (INBOX, DONE, OUT):
        folder.mkdir(exist_ok=True)

    files = sorted(f for f in INBOX.iterdir()
                   if f.is_file() and f.suffix.lower() in EXTS)
    if not files:
        print("No photos found in the inbox folder.")
        return
    if Image is None:
        print("Pillow is not installed, so photos will be copied without resizing.")

    category = input("Category for this batch (Enter = Photos): ").strip() or "Photos"
    photos = load()

    for f in files:
        default = nice_title(f.name)
        title = input("Title for " + f.name + " (Enter = " + default + "): ").strip() or default

        ext = ".jpg" if Image else f.suffix.lower()
        name = slug(title)
        target = OUT / (name + ext)
        n = 2
        while target.exists():
            target = OUT / (name + "-" + str(n) + ext)
            n += 1

        if Image:
            img = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
            img.thumbnail((MAX_SIDE, MAX_SIDE))
            img.save(target, "JPEG", quality=85)
        else:
            shutil.copy(f, target)

        photos.append({"t": title, "c": category, "src": "photos/" + target.name})
        shutil.move(str(f), str(DONE / f.name))
        print("Added", target.name)

    save(photos)
    print("Done. " + str(len(files)) + " photo(s) added to photos.js")


main()