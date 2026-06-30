"""
Extract product images from Tees Collection Catalog.pdf
Each product listing has a photo on the left side of its row.
We render each page at high resolution and crop out product image regions.
"""
import fitz  # PyMuPDF
import os
import json

PDF_PATH = r"C:\Users\USER\Documents\Tee's collection\Tees Collection Catalog.pdf"
OUT_DIR = r"C:\Users\USER\Documents\Tee's collection\cosmetics_images"

os.makedirs(OUT_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
print(f"PDF has {len(doc)} pages")

# We'll render each page and extract images from the PDF's embedded image list
# Products appear as embedded images in the PDF

extracted = []
img_index = 0

for page_num in range(len(doc)):
    page = doc[page_num]
    image_list = page.get_images(full=True)

    for img_info in image_list:
        xref = img_info[0]
        base_image = doc.extract_image(xref)
        img_bytes = base_image["image"]
        img_ext = base_image["ext"]
        width = base_image["width"]
        height = base_image["height"]

        # Skip very small images (icons, backgrounds) and very large ones (full page backgrounds)
        if width < 80 or height < 80:
            continue
        if width > 2000 and height > 2000:
            continue
        # Skip very wide/thin banners (section headers)
        aspect = width / height
        if aspect > 6 or aspect < 0.15:
            continue

        filename = f"img_{img_index:03d}_p{page_num+1}_{width}x{height}.{img_ext}"
        filepath = os.path.join(OUT_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(img_bytes)

        extracted.append({
            "index": img_index,
            "page": page_num + 1,
            "file": filename,
            "width": width,
            "height": height,
        })
        img_index += 1

doc.close()

print(f"\nExtracted {len(extracted)} images to {OUT_DIR}")
print("\nImage list:")
for e in extracted:
    print(f"  [{e['index']:03d}] page {e['page']} — {e['file']}")

# Save manifest
with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
    json.dump(extracted, f, indent=2)
print("\nManifest saved to manifest.json")
