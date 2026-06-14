const bot = require('../bot');
const storage = require('./storage');

// In-memory timers to allow cancellation
const timers = new Map();

function schedulePost(id, isoTime, message, imageUrl = null) {
  const when = new Date(isoTime);
  if (isNaN(when.getTime())) throw new Error('Invalid scheduled time');

  const now = new Date();
  const ms = when.getTime() - now.getTime();

  if (ms <= 0) {
    // time is in the past — publish immediately
    return bot.publishPost(message, imageUrl);
  }

  // Save job to storage
  const jobs = storage.readJobs();
  const job = { id, message, imageUrl, scheduledTime: when.toISOString(), createdAt: new Date().toISOString() };
  jobs.push(job);
  storage.writeJobs(jobs);

  const timer = setTimeout(async () => {
    try {
      await bot.publishPost(message, imageUrl);
      // remove job from storage
      const remaining = storage.readJobs().filter(j => j.id !== id);
      storage.writeJobs(remaining);
      timers.delete(id);
      console.log('📣 Scheduled post published and removed:', id);
    } catch (e) {
      console.error('❌ Error publishing scheduled post', id, e);
    }
  }, ms);

  timers.set(id, timer);
  console.log(`⏱️ Scheduled post ${id} in ${Math.round(ms/1000)} seconds`);
  return job;
}

function cancelScheduledPost(id) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  const jobs = storage.readJobs().filter(j => j.id !== id);
  storage.writeJobs(jobs);
  return true;
}

function loadAndScheduleExistingJobs() {
  const jobs = storage.readJobs();
  jobs.forEach(job => {
    // avoid duplicating timers if already set
    if (timers.has(job.id)) return;
    try {
      schedulePost(job.id, job.scheduledTime, job.message, job.imageUrl);
    } catch (e) {
      console.error('Failed to schedule existing job', job.id, e);
    }
  });
}

module.exports = { schedulePost, cancelScheduledPost, loadAndScheduleExistingJobs };
