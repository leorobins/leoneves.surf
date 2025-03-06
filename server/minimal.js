// Minimal Express server for testing
const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Create Express app
const app = express();

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, '../client/dist')));

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Minimal server is running',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT || 3000,
      platform: process.platform,
      nodeVersion: process.version,
      hostname: os.hostname(),
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024)) + 'MB',
        free: Math.round(os.freemem() / (1024 * 1024)) + 'MB',
      }
    }
  });
});

// Add a simple API endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Minimal server running on port ${port}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: port,
    cwd: process.cwd(),
    files: fs.readdirSync(process.cwd())
  });
}); 