import json
import base64
import os

JSONL = r"C:\Users\USER\.claude\projects\C--Users-USER-Tee-s-collection\df2ed69b-430d-4892-8a84-ddb46a723502.jsonl"
OUT_DIR = r"C:\Users\USER\Documents\Tee's collection\watches"
os.makedirs(OUT_DIR, exist_ok=True)

images = []

with open(JSONL, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except:
            continue

        msg = obj.get('message', {})
        content = msg.get('content', [])
        if not isinstance(content, list):
            continue

        for block in content:
            if isinstance(block, dict) and block.get('type') == 'image':
                source = block.get('source', {})
                if source.get('type') == 'base64':
                    images.append({
                        'data': source.get('data', ''),
                        'media_type': source.get('media_type', 'image/jpeg'),
                    })

print(f"Found {len(images)} images in conversation")

# The watch images are the last 5 images in the conversation
watch_images = images[-5:]

ext_map = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'}

for i, img in enumerate(watch_images):
    ext = ext_map.get(img['media_type'], 'jpg')
    filename = f"watch{i+1}.{ext}"
    filepath = os.path.join(OUT_DIR, filename)
    data = base64.b64decode(img['data'])
    with open(filepath, 'wb') as f:
        f.write(data)
    print(f"Saved {filename} ({len(data):,} bytes)")

print("Done")
