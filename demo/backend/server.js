const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const { verifySignature } = require('../../dist/server');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'signmelad_demo_secret_key';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN
}));
app.use(bodyParser.json());
app.use(morgan('dev')); // Request logging

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'SignMeLad Demo API',
    version: '1.0.0'
  });
});

// API endpoint: Authentication
app.post('/api/auth', (req, res) => {
  try {
    const { publicKey, signature, message, timestamp } = req.body;
    
    // Check required fields
    if (!publicKey || !signature || !message || !timestamp) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    // Verify signature
    const isValid = verifySignature(signature, message, publicKey);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      {
        publicKey: publicKey,
        timestamp: timestamp
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return successful response
    res.json({ 
      success: true, 
      token,
      user: {
        publicKey
      }
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint: Token verification
app.post('/api/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token missing' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({ 
      success: true, 
      user: {
        publicKey: decoded.publicKey
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Protected API endpoint example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'This is a protected endpoint',
    user: req.user
  });
});

// JWT token verification middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
}

// Start server
app.listen(port, () => {
  console.log(`SignMeLad Demo API running at http://localhost:${port}`);
});