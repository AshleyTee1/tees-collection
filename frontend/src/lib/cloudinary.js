// Auto-converts Cloudinary images to WebP and compresses them
export function imgUrl(url, width = 800) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
}
