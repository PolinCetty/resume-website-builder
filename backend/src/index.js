/**
 * Resume Website Builder - Backend Server
 * Includes smart domain suggestions with cost inclusion strategy
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Resume Website Builder API'
  });
});

// Main landing route
app.get('/', (req, res) => {
  res.json({
    name: 'Resume Website Builder API',
    version: '1.0.0',
    description: 'Transform resumes into professional websites with smart domain suggestions',
    endpoints: {
      domains: '/api/domains/*',
      health: '/health'
    },
    businessModel: {
      strategy: 'Include domain costs in service pricing',
      advantages: ['Predictable revenue', 'Better UX', 'Higher margins', 'No referral dependency']
    }
  });
});

// Domain suggestion routes
const domainRoutes = require('./routes/domains');
app.use('/api/domains', domainRoutes);

// Website generation routes
const generateRoutes = require('./routes/generate');
app.use('/api/generate', generateRoutes);

// API usage tracking routes
const usageRoutes = require('./routes/usage');
app.use('/api/usage', usageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    suggestion: 'Try /api/domains/demo for domain suggestions demo'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Resume Website Builder API running on port ${PORT}`);
  console.log(`💰 Business Model: Domain costs included in service pricing`);
  console.log(`🔗 Demo: http://localhost:${PORT}/api/domains/demo`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});

module.exports = app;