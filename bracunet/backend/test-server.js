import express from 'express';

const app = express();
const port = 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Try: http://localhost:${port}/health`);
});

// Keep alive
setInterval(() => {
  console.log('Server still running...');
}, 10000);
