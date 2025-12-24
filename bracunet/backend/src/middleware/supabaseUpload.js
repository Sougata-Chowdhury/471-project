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

// Create multer upload instance for recommendation letters using Supabase
export const supabaseLetterUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for letters
  },
  fileFilter: letterFileFilter,
});

export default supabaseLetterUpload;
