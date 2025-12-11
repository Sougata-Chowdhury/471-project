import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { config } from '../config/index.js';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Configure Cloudinary storage for verification proofs
const verificationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bracunet/verification-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto', // Automatically detect resource type (image/raw for PDFs)
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'proof-' + uniqueSuffix;
    },
  },
});

// Configure Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bracunet/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image',
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'profile-' + uniqueSuffix;
    },
  },
});

// Determine storage based on field name
const storage = (req, file, cb) => {
  if (file.fieldname === 'profilePicture') {
    profilePictureStorage._handleFile(req, file, cb);
  } else {
    verificationStorage._handleFile(req, file, cb);
  }
};

const removeFile = (req, file, cb) => {
  if (file.fieldname === 'profilePicture') {
    profilePictureStorage._removeFile(req, file, cb);
  } else {
    verificationStorage._removeFile(req, file, cb);
  }
};

// File filter - only accept images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed!'));
  }
};

// Create multer upload instance with dynamic storage
export const upload = multer({
  storage: {
    _handleFile: storage,
    _removeFile: removeFile
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});
