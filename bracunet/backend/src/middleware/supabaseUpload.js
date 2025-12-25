import multer from 'multer';
import path from 'path';

// Use memory storage for Supabase uploads
const storage = multer.memoryStorage();

// File filter for recommendation letters - accept PDFs, DOC, DOCX, and images
const letterFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and image files (JPEG, JPG, PNG) are allowed for recommendation letters!'));
  }
};

// File filter for resources - accept photos, PDFs, and various documents
const resourceFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|mp4|mpeg|mp3|zip|rar|txt|csv|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.openxmlformats-officedocument\.presentationml\.presentation|vnd\.ms-powerpoint|zip|x-rar-compressed|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)|text\/(plain|csv)|video\/(mp4|mpeg)|audio\/mpeg/.test(file.mimetype);

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Unsupported file type for resources. Allowed: images (JPG, PNG), PDFs, documents (DOC, DOCX, PPT, PPTX, XLS, XLSX), videos (MP4), audio (MP3), archives (ZIP, RAR), text files (TXT, CSV)'));
  }
};

// Create multer upload instance for recommendation letters using Supabase
export const supabaseLetterUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for letters
  },
  fileFilter: letterFileFilter,
});

// Create multer upload instance for resources using Supabase
export const supabaseResourceUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for resources
  },
  fileFilter: resourceFileFilter,
});

export default supabaseLetterUpload;
