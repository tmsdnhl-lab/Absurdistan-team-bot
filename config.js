require('dotenv').config();

const config = {
  FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,
  FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
  FACEBOOK_VERIFY_TOKEN: process.env.FACEBOOK_VERIFY_TOKEN,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Ověření povinných proměnných
if (!config.FACEBOOK_PAGE_ID || !config.FACEBOOK_ACCESS_TOKEN || !config.FACEBOOK_VERIFY_TOKEN) {
  console.warn('⚠️  Chybí některé environment variables. Zkontroluj .env file.');
  console.warn('Required:', ['FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_VERIFY_TOKEN']);
}

module.exports = config;
