const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { verifySignature, createAuthToken, createAuthMiddleware } = require('../../dist/server');

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

// Configure JWT options
const jwtOptions = {
  expiresIn: '24h',
  issuer: 'signmelad-demo',
  audience: 'demo-app'
};

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
    
    // Create JWT token using the SDK's function
    const token = createAuthToken(
      { publicKey, signature, message, timestamp },
      JWT_SECRET,
      jwtOptions
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
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// API endpoint: Token verification
app.post('/api/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token missing' });
    }
    
    // We'll use the middleware to verify the token
    createAuthMiddleware(JWT_SECRET, jwtOptions)(
      { headers: { authorization: `Bearer ${token}` } },
      res,
      () => {
        res.json({ 
          success: true, 
          user: {
            publicKey: req.user.publicKey
          }
        });
      }
    );
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: error.message || 'Invalid or expired token' });
  }
});

// Protected API endpoint example
app.get('/api/protected', createAuthMiddleware(JWT_SECRET, jwtOptions), (req, res) => {
  res.json({ 
    success: true, 
    message: 'This is a protected endpoint',
    user: req.user
  });
});

// Start server
app.listen(port, () => {
  console.log(`SignMeLad Demo API running at http://localhost:${port}`);
});