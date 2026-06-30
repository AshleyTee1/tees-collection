require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const DIR = 'C:\\Users\\USER\\Downloads\\homepage-pics'

const FILES = [
  { file: 'WhatsApp Image 2026-06-26 at 1.18.48 PM.jpeg', id: 'homepage-cosmetics', label: 'Cosmetics' },
  { file: 'WhatsApp Image 2026-06-26 at 1.24.30 PM.jpeg', id: 'homepage-shoes',     label: 'Shoes' },
  { file: 'WhatsApp Image 2026-06-26 at 1.37.45 PM.jpeg', id: 'homepage-handbags',  label: 'Handbags' },
  { file: 'WhatsApp Image 2026-06-26 at 1.37.46 PM.jpeg', id: 'homepage-jewellery', label: 'Jewellery' },
]

function upload(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'tees-collection/homepage', overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result.secure_url) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  const urls = {}
  for (const { file, id, label } of FILES) {
    process.stdout.write(`Uploading ${label}... `)
    const buffer = fs.readFileSync(path.join(DIR, file))
    const url = await upload(buffer, id)
    urls[label] = url
    console.log('✓')
    console.log(`  ${url}`)
  }
  console.log('\nAll done! URLs:')
  console.log(JSON.stringify(urls, null, 2))
}

main().catch(console.error)
