// import jwt from 'jsonwebtoken';
// import { config } from '../config/index.js';
// import { User } from '../users/user.model.js';

// export const protect = async (req, res, next) => {
//   const token = req.cookies.authToken;

//   if (!token) {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, config.jwt.secret);
//     // Support both 'id' and 'userId' for backward compatibility
//     const userId = decoded.userId || decoded.id;
//     req.user = await User.findById(userId).select('-password');
    
//     if (!req.user) {
//       return res.status(401).json({ message: 'User not found' });
//     }
    
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Token is not valid' });
//   }
// };

// // Legacy alias for backward compatibility
// export const verifyToken = protect;

// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
//     }

//     next();
//   };
// };

// // Backwards-compatible alias used across routes
// export const authMiddleware = protect;
// export const isAdmin = (req, res, next) => {
//   if (!req.user) return res.status(401).json({ message: "Not authenticated" });
//   if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
//   next();
// };



import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../users/user.model.js';

export const protect = async (req, res, next) => {
  let token = req.cookies.authToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const userId = decoded.userId || decoded.id;
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Roles-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
    next();
  };
};

// Admin-only check
export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};

// Legacy aliases for backward compatibility
export const verifyToken = protect;
export const authMiddleware = protect;
