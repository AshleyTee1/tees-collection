import fitz
doc = fitz.open(r"C:\Users\USER\Documents\Tee's collection\Tees Collection Catalog.pdf")
page = doc[8]  # page 9 (0-indexed)
imgs = page.get_images(full=True)
print(f'Page 9 has {len(imgs)} raw images:')
for i in imgs:
    xref = i[0]
    b = doc.extract_image(xref)
    print(f'  xref={xref} size={b["width"]}x{b["height"]} ext={b["ext"]}')
doc.close()
