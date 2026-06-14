const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const DRAFTS_FILE = path.join(DATA_DIR, 'drafts.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(JOBS_FILE)) fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
  if (!fs.existsSync(DRAFTS_FILE)) fs.writeFileSync(DRAFTS_FILE, JSON.stringify([]));
}

function readJson(file) {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Error reading JSON', file, e);
    return [];
  }
}

function writeJson(file, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing JSON', file, e);
  }
}

module.exports = {
  ensureDataDir,
  readJobs: () => readJson(JOBS_FILE),
  writeJobs: (data) => writeJson(JOBS_FILE, data),
  readDrafts: () => readJson(DRAFTS_FILE),
  writeDrafts: (data) => writeJson(DRAFTS_FILE, data)
};
