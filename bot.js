const axios = require('axios');
const config = require('./config');

// Odeslání zprávy na Facebook
async function sendMessage(recipientId, message) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${config.FACEBOOK_ACCESS_TOKEN}`,
      {
        recipient: { id: recipientId },
        message: { text: message }
      }
    );
    console.log('✅ Zpráva poslána:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Chyba při odesílání zprávy:', error.response?.data || error.message);
  }
}

// Obslužka příchozích zpráv
function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  console.log(`📨 Zpráva od ${senderId}: ${messageText}`);

  // Jednoduché response
  if (messageText.toLowerCase().includes('ahoj')) {
    sendMessage(senderId, '👋 Ahoj! Jsem Absurdistan Team Bot. Jak ti mohu pomoci?');
  } else if (messageText.toLowerCase().includes('help')) {
    sendMessage(senderId, '📚 Příkazy:\n- "ahoj" - pozdrav\n- "analýza" - zobraz metriky\n- "plán" - naplánuj příspěvek');
  } else if (messageText.toLowerCase().includes('analýza')) {
    sendMessage(senderId, '📊 Statistiky:\n👍 1,234 lajků\n💬 567 komentářů\n📤 89 sdílení');
  } else {
    sendMessage(senderId, '👍 Díky za zprávu! Jsem bot a nemůžu odpovidět na všechno.');
  }
}

// Publikování příspěvku
async function publishPost(message, imageUrl = null) {
  try {
    const payload = {
      message: message
    };

    if (imageUrl) {
      payload.link = imageUrl;
    }

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${config.FACEBOOK_PAGE_ID}/feed?access_token=${config.FACEBOOK_ACCESS_TOKEN}`,
      payload
    );

    console.log('✅ Příspěvek publikován:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Chyba při publikování:', error.response?.data || error.message);
  }
}

// Monitoring zmínek (jednoduchý příklad)
function monitorMentions(keyword) {
  console.log(`🔍 Monitoruji zmínky o: ${keyword}`);
  // Zde by byla real API integrace s Search API
  return {
    keyword: keyword,
    mentions: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  sendMessage,
  handleMessage,
  publishPost,
  monitorMentions
};
