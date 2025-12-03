import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../users/user.model.js';

export const protect = async (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    // Support both 'id' and 'userId' for backward compatibility
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

// Legacy alias for backward compatibility
export const verifyToken = protect;

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
    }

    next();
  };
};
