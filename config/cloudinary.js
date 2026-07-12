const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validate mime types inside fileFilter
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('File upload rejected: Only image files (JPEG, PNG, WEBP, GIF) are allowed!'), false);
  }
  cb(null, true);
};

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mytravelbandhu', // The name of the folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }] // Resize images to fit within bounds
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Enforce 5MB limit strictly
  fileFilter: fileFilter
});

module.exports = {
  cloudinary,
  storage,
  upload
};
