require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: '✅ Absurdistan Team Bot je LIVE',
    timestamp: new Date().toISOString()
  });
});

// Facebook Webhook - GET (verification)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Facebook Webhook - POST (incoming messages)
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];
      console.log('📩 Webhook event:', webhookEvent);
      
      if (webhookEvent.message) {
        bot.handleMessage(webhookEvent);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// API Routes
app.get('/api/analytics', (req, res) => {
  res.status(200).json({
    message: '📊 Analytics Dashboard',
    likes: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 500),
    reach: Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/schedule-post', (req, res) => {
  const { message, scheduledTime } = req.body;
  
  if (!message || !scheduledTime) {
    return res.status(400).json({ error: 'Message and scheduledTime required' });
  }

  console.log(`📅 Post scheduled: "${message}" for ${scheduledTime}`);
  res.status(200).json({
    success: true,
    message: 'Post scheduled successfully',
    data: { message, scheduledTime }
  });
});

// New: Immediate publish endpoint
// POST /api/publish
// Body: { "message": "text", "imageUrl": "optional image url" }
app.post('/api/publish', async (req, res) => {
  const { message, imageUrl } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!process.env.FACEBOOK_PAGE_ID || !process.env.FACEBOOK_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Facebook configuration missing in environment variables' });
  }

  try {
    // publishPost returns Facebook response or undefined on error
    const result = await bot.publishPost(message, imageUrl);

    if (!result) {
      return res.status(500).json({ success: false, error: 'Failed to publish post (see server logs)' });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error in /api/publish:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════╗
║  🎵 ABSURDISTAN TEAM BOT          ║
║  ✅ Server běží na portu ${PORT}      ║
║  🌐 http://localhost:${PORT}         ║
╚══════════════════════════════════╝
`);
});

module.exports = app;
