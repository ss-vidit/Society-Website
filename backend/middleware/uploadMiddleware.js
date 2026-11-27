const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const fileFilter = (_req, file, callback) => {
  if (!acceptedTypes.has(file.mimetype)) {
    const error = new Error('Only JPG, PNG, and WebP images are allowed.');
    error.status = 400;
    return callback(error);
  }
  callback(null, true);
};

class CloudinaryStreamStorage {
  _handleFile(_req, file, callback) {
    let complete = false;
    const finish = (error, result) => {
      if (complete) return;
      complete = true;
      if (error) return callback(error);
      callback(null, {
        path: result.secure_url,
        filename: result.public_id,
        size: result.bytes
      });
    };

    const uploadStream = cloudinary.uploader.upload_stream({
      folder: 'binary-boppers',
      public_id: crypto.randomUUID(),
      resource_type: 'image',
      overwrite: false
    }, finish);

    file.stream.once('error', (error) => uploadStream.destroy(error));
    uploadStream.once('error', (error) => finish(error));
    file.stream.pipe(uploadStream);
  }

  _removeFile(_req, file, callback) {
    cloudinary.uploader.destroy(file.filename, { resource_type: 'image' })
      .then(() => callback(null))
      .catch(callback);
  }
}

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Cloudinary receives files as streams. The local fallback is deliberately
// smaller because Multer keeps each uploaded file in process memory.
const maxFileSize = hasCloudinary ? 5 * 1024 * 1024 : 1 * 1024 * 1024;
const storage = hasCloudinary ? new CloudinaryStreamStorage() : multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 10,
    fields: 20,
    fieldSize: 64 * 1024,
    parts: 32,
    headerPairs: 100
  }
});

const getUploadedImageUrl = (file) => {
  if (!file) return null;
  if (file.path) return file.path;
  if (file.buffer) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
  return null;
};

module.exports = { upload, getUploadedImageUrl, hasCloudinary, maxFileSize };
