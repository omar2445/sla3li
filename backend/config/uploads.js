// Shared image upload handling.
// - Cloudinary when CLOUDINARY_URL is set — Render's disk is wiped on every
//   deploy/restart, so files must live in external storage
// - Local disk (uploadsDir) otherwise — zero-setup local dev
//
// storeFile/storeFiles return the public path or URL to persist in the db.
// The frontend's imgUrl() passes through absolute http(s) URLs unchanged.
const multer = require('multer');
const path = require('path');
const { uploadsDir } = require('./paths');

const useCloudinary = !!process.env.CLOUDINARY_URL;

// cloudinary v2 configures itself from the CLOUDINARY_URL env var
const cloudinary = useCloudinary ? require('cloudinary').v2 : null;

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname)),
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

async function storeFile(file) {
  if (!file) return '';
  if (!useCloudinary) return `/uploads/${file.filename}`;
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sla3li', resource_type: 'image' },
      (err, res) => err ? reject(err) : resolve(res)
    );
    stream.end(file.buffer);
  });
  return result.secure_url;
}

const storeFiles = (files) => Promise.all((files || []).map(storeFile));

module.exports = { upload, storeFile, storeFiles };
