const jwt = require('jsonwebtoken');

// Use the same JWT_SECRET logic as authController
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authMiddleware = (req, res, next) => {
  console.log('Auth middleware - JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
  console.log('Auth middleware - JWT_SECRET value:', JWT_SECRET === 'secret' ? 'Using fallback' : 'Using env var');
  const authHeader = req.header('Authorization');
  console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth middleware - No valid Authorization header');
    return res.status(401).json({ msg: 'No token, access denied' });
  }

  const token = authHeader.split(' ')[1]; // split "Bearer <token>"
  console.log('Auth middleware - Token extracted:', token ? 'Yes' : 'No');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully, user ID:', decoded.id);
    req.user = decoded.id;
    next();
  } catch (err) {
    console.log('Auth middleware - Token verification failed:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
