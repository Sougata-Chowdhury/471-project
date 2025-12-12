// // import multer from 'multer';
// // import { v2 as cloudinary } from 'cloudinary';
// // import { CloudinaryStorage } from 'multer-storage-cloudinary';
// // import { config } from '../config/index.js';
// // import path from 'path';

// // // Configure Cloudinary
// // cloudinary.config({
// //   cloud_name: config.cloudinary.cloudName,
// //   api_key: config.cloudinary.apiKey,
// //   api_secret: config.cloudinary.apiSecret,
// // });

// // // Configure Cloudinary storage
// // const storage = new CloudinaryStorage({
// //   cloudinary: cloudinary,
// //   params: {
// //     folder: 'bracunet/verification-proofs',
// //     allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
// //     resource_type: 'auto', // Automatically detect resource type (image/raw for PDFs)
// //     public_id: (req, file) => {
// //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //       return 'proof-' + uniqueSuffix;
// //     },
// //   },
// // });

// // // File filter - only accept images and PDFs
// // const fileFilter = (req, file, cb) => {
// //   const allowedTypes = /jpeg|jpg|png|pdf/;
// //   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
// //   const mimetype = allowedTypes.test(file.mimetype);

// //   if (mimetype && extname) {
// //     return cb(null, true);
// //   } else {
// //     cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed!'));
// //   }
// // };

// // // Create multer upload instance for verification proofs (images & PDF)
// // export const cloudinaryUpload = multer({
// //   storage: storage,
// //   limits: {
// //     fileSize: 5 * 1024 * 1024, // 5MB limit
// //   },
// //   fileFilter: fileFilter,
// // });

// // // Create a more permissive storage + upload instance for resource uploads
// // let cloudinaryResourceUpload;
// // const resourceFileFilter = (req, file, cb) => {
// //   // Accept common document, image, video and archive types
// //   const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|mp4|mpeg|mp3|zip|rar|txt|csv|xls|xlsx/;
// //   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
// //   const mimetype = allowedTypes.test(file.mimetype);

// //   if (mimetype || extname) {
// //     return cb(null, true);
// //   } else {
// //     cb(new Error('Unsupported file type for resources. Allowed: images, PDF, DOC/DOCX, PPT, MP4, ZIP, etc.'));
// //   }
// // };

// // try {
// //   if (config.cloudinary.apiKey && config.cloudinary.apiSecret && config.cloudinary.cloudName) {
// //     const resourceStorage = new CloudinaryStorage({
// //       cloudinary: cloudinary,
// //       params: {
// //         folder: 'bracunet/resources',
// //         allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mp3', 'zip', 'rar', 'txt', 'csv', 'xls', 'xlsx'],
// //         resource_type: 'auto',
// //         public_id: (req, file) => {
// //           const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //           return 'resource-' + uniqueSuffix;
// //         },
// //       },
// //     });

// //     cloudinaryResourceUpload = multer({
// //       storage: resourceStorage,
// //       limits: {
// //         fileSize: 50 * 1024 * 1024, // 50MB for resources
// //       },
// //       fileFilter: resourceFileFilter,
// //     });
// //   } else {
// //     // If Cloudinary credentials are missing, create a middleware that rejects uploads with a clear error
// //     cloudinaryResourceUpload = multer({
// //       storage: multer.memoryStorage(),
// //       limits: { fileSize: 50 * 1024 * 1024 },
// //       fileFilter: (req, file, cb) => cb(new Error('Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in env.')),
// //     });
// //   }
// // } catch (err) {
// //   // Fallback: create rejecting multer instance to avoid throwing during import
// //   console.error('Cloudinary storage initialization failed:', err.message);
// //   cloudinaryResourceUpload = multer({
// //     storage: multer.memoryStorage(),
// //     limits: { fileSize: 50 * 1024 * 1024 },
// //     fileFilter: (req, file, cb) => cb(new Error('Cloudinary storage initialization failed. Check server logs.')),
// //   });
// // }

// // // Export the resource upload middleware
// // export { cloudinaryResourceUpload };




// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";

// // Cloudinary config
// cloudinary.config({
//   cloud_name: "dg0xhxxla",
//   api_key: "917816188474383",
//   api_secret: "hK3S3BSxqK1d4x6kcLc4jXG89EM",
// });

// // // Configure Cloudinary storage
// // const storage = new CloudinaryStorage({
// //   cloudinary: cloudinary,
// //   params: {
// //     folder: "bracunet/resources",
// //     allowed_formats: [
// //       "jpg","jpeg","png","pdf","doc","docx","ppt","pptx","mp4","mp3","zip","rar","txt","csv","xls","xlsx"
// //     ],
// //     resource_type: "auto",
// //     public_id: (req, file) => `resource-${Date.now()}-${Math.round(Math.random() * 1e9)}`
// //   }
// // });

// // Configure Cloudinary storage for profile pictures
// const profilePictureStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'bracunet/profile-pictures',
//     allowed_formats: ['jpg', 'jpeg', 'png'],
//     resource_type: 'image',
//     transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
//     public_id: (req, file) => {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       return 'profile-' + uniqueSuffix;
//     },
//   },
// });

// // Determine storage based on field name
// const storage = (req, file, cb) => {
//   if (file.fieldname === 'profilePicture') {
//     profilePictureStorage._handleFile(req, file, cb);
//   } else {
//     verificationStorage._handleFile(req, file, cb);
//   }
// };

// const removeFile = (req, file, cb) => {
//   if (file.fieldname === 'profilePicture') {
//     profilePictureStorage._removeFile(req, file, cb);
//   } else {
//     verificationStorage._removeFile(req, file, cb);
//   }
// };

// // File filter
// const resourceFileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|mp4|mpeg|mp3|zip|rar|txt|csv|xls|xlsx/;
//   const extname = allowedTypes.test(file.originalname.toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);
//   if (extname || mimetype) cb(null, true);
//   else cb(new Error("Unsupported file type"));
// };

// // Create multer upload instance
// export const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: fileFilter,
// });
// export { cloudinaryResourceUpload };



import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from 'path';

// Cloudinary config
cloudinary.config({
  cloud_name: "dg0xhxxla",
  api_key: "917816188474383",
  api_secret: "hK3S3BSxqK1d4x6kcLc4jXG89EM",
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bracunet/resources",
    allowed_formats: [
      "jpg","jpeg","png","pdf","doc","docx","ppt","pptx","mp4","mp3","zip","rar","txt","csv","xls","xlsx"
    ],
    resource_type: "auto",
    public_id: (req, file) => `resource-${Date.now()}-${Math.round(Math.random() * 1e9)}`
  }
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
// const storage = (req, file, cb) => {
//   if (file.fieldname === 'profilePicture') {
//     profilePictureStorage._handleFile(req, file, cb);
//   } else {
//     verificationStorage._handleFile(req, file, cb);
//   }
// };

const removeFile = (req, file, cb) => {
  if (file.fieldname === 'profilePicture') {
    profilePictureStorage._removeFile(req, file, cb);
  } else {
    verificationStorage._removeFile(req, file, cb);
  }
};

// File filter
const resourceFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|mp4|mpeg|mp3|zip|rar|txt|csv|xls|xlsx/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname || mimetype) cb(null, true);
  else cb(new Error("Unsupported file type"));
};

// Create multer upload instance
export const upload = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// verification.routes.js এর জন্য default export
export default upload;
