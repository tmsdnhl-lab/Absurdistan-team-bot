require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const scheduler = require('./utils/scheduler');
const storage = require('./utils/storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure data dir exists and load scheduled jobs
storage.ensureDataDir();
scheduler.loadAndScheduleExistingJobs();

// Simple middleware to protect publish/schedule/admin endpoints
const PUBLISH_SECRET = process.env.PUBLISH_SECRET;
function checkPublishSecret(req, res, next) {
  if (!PUBLISH_SECRET) return res.status(500).json({ error: 'Publish secret not configured in environment variables' });
  const header = req.headers['x-publish-secret'];
  if (!header || header !== PUBLISH_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

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

// Public analytics (no auth)
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

// Protected: schedule a post (schedules for future)
app.post('/api/schedule-post', checkPublishSecret, (req, res) => {
  const { message, scheduledTime, imageUrl } = req.body;
  if (!message || !scheduledTime) {
    return res.status(400).json({ error: 'Message and scheduledTime required' });
  }

  try {
    const id = `${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const job = scheduler.schedulePost(id, scheduledTime, message, imageUrl);
    return res.status(200).json({ success: true, job });
  } catch (e) {
    console.error('Failed to schedule post', e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Protected: immediate publish
app.post('/api/publish', checkPublishSecret, async (req, res) => {
  const { message, imageUrl } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!process.env.FACEBOOK_PAGE_ID || !process.env.FACEBOOK_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Facebook configuration missing in environment variables' });
  }

  try {
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

// Drafts workflow
app.post('/api/draft', checkPublishSecret, (req, res) => {
  const { message, scheduledTime, imageUrl } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const drafts = storage.readDrafts();
  const id = `${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const draft = { id, message, imageUrl: imageUrl || null, scheduledTime: scheduledTime || null, createdAt: new Date().toISOString() };
  drafts.push(draft);
  storage.writeDrafts(drafts);
  return res.status(200).json({ success: true, draft });
});

app.get('/api/drafts', checkPublishSecret, (req, res) => {
  const drafts = storage.readDrafts();
  return res.status(200).json({ success: true, drafts });
});

app.post('/api/approve/:id', checkPublishSecret, async (req, res) => {
  const id = req.params.id;
  const drafts = storage.readDrafts();
  const draft = drafts.find(d => d.id === id);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });

  try {
    if (draft.scheduledTime) {
      // schedule it
      const job = scheduler.schedulePost(draft.id, draft.scheduledTime, draft.message, draft.imageUrl);
      // remove draft
      const remaining = drafts.filter(d => d.id !== id);
      storage.writeDrafts(remaining);
      return res.status(200).json({ success: true, scheduled: job });
    } else {
      // publish immediately
      const result = await bot.publishPost(draft.message, draft.imageUrl);
      const remaining = drafts.filter(d => d.id !== id);
      storage.writeDrafts(remaining);
      return res.status(200).json({ success: true, published: result });
    }
  } catch (e) {
    console.error('Error approving draft', e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Cancel scheduled post
app.post('/api/cancel-scheduled/:id', checkPublishSecret, (req, res) => {
  const id = req.params.id;
  const ok = scheduler.cancelScheduledPost(id);
  return res.status(200).json({ success: ok });
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
