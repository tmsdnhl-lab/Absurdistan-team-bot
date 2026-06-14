# 🚀 Setup Absurdistan Team Bot

## Fáze 1: Facebook Developer Setup (5 minut)

### 1. Vytvoř Facebook Developer Účet
- Jdi na https://developers.facebook.com/
- Klikni **Get Started**
- Vyplň registrační formulář
- Ověř si email

### 2. Vytvoř Aplikaci
- V Dashboardu klikni **+ Create App**
- Vyber **Business**
- Jméno: `Absurdistan Team Bot`
- Klikni **Create App**

### 3. Přidej Messenger
- V levém menu klikni **+ Add Product**
- Najdi **Messenger**
- Klikni **Set Up**

### 4. Připoj Facebook Stránku
- Jdi na https://www.facebook.com/pages/create/
- Vytvoř stránku: `Absurdistan Team`
- V Developer Dashboardu jdi na **Messenger** → **Settings**
- Pod **Access Tokens** klikni **Add or Remove Pages**
- Vyber svou stránku
- Klikni **Generate Token** a **zkopíruj si ho**

### 5. Najdi svůj Page ID
- URL tvé stránky: `facebook.com/absurdistan-team/`
- Nebo v Developer Dashboardu: **Messenger** → **Settings** → **Page ID**

### 6. Vytvoř Verify Token
- V textovém editoru napiš:
```
absurdistan_verify_token_12345
```
- Zkopíruj si

---

## Fáze 2: Replit Setup (5 minut)

### 1. Klonuj projekt
- Jdi na https://replit.com
- Klikni **+ Create**
- Vyber **Import from GitHub**
- Vložit: `https://github.com/tmsdnhl-lab/absurdistan-team-bot`
- Klikni **Import**

### 2. Přidej Secrets (Environment Variables)
- V Replit vlevo klikni **Secrets** (zámek)
- Přidej tyto klíče:

```
FACEBOOK_PAGE_ID = tvůj_page_id
FACEBOOK_ACCESS_TOKEN = tvůj_access_token
FACEBOOK_VERIFY_TOKEN = tvůj_verify_token
PORT = 3000
NODE_ENV = production
```

### 3. Instaluj Dependencies
```bash
npm install
```

### 4. Spusť Bot
- Klikni **Run**
- Měl by se objevit výstup:
```
╔═══════════════════════════════════╗
║  🎵 ABSURDISTAN TEAM BOT          ║
║  ✅ Server běží na portu 3000     ║
║  🌐 http://localhost:3000         ║
╚═══════════════════════════════════╝
```

---

## Fáze 3: Webhook Configuration (5 minut)

### 1. Najdi Replit URL
- V Replit vpravo nahoře klikni **Share**
- Zkopíruj **Live URL**
- Měl by vypadat: `https://absurdistan-team-bot.replit.dev`

### 2. Nastav Webhook
- V Developer Dashboardu jdi na **Messenger** → **Settings**
- Pod **Webhooks** klikni **Add Callback URL**
- Vyplň:
  - **Callback URL**: `https://tvůj-replit-url.replit.dev/webhook`
  - **Verify Token**: `absurdistan_verify_token_12345`
- Klikni **Verify and Save**

### 3. Subscribe k Events
- V **Webhooks** → **Add Subscriptions**
- Vyber:
  - ✅ messages
  - ✅ messaging_postbacks
  - ✅ page
- Klikni **Save**

---

## Test

### Test Analytics
```
https://tvůj-replit-url.replit.dev/api/analytics
```

### Test Schedule Post
```bash
curl -X POST https://tvůj-replit-url.replit.dev/api/schedule-post \
  -H "Content-Type: application/json" \
  -d '{"message": "🔥 Test!", "scheduledTime": "2026-06-14T18:00:00Z"}'
```

---

## 🎉 HOTOVO!

Tvůj bot je live a připraven na Facebooku!

### Další kroky:
1. Testuj bot na Facebook stránce
2. Přidej vlastní funkce do `bot.js`
3. Rozšiř API endpointy
4. Přidej Discord notifikace

---

## ❌ Troubleshooting

### Webhook verification failed
- ✅ Zkontroluj Verify Token (musí být stejný)
- ✅ Zkontroluj Replit URL je live
- ✅ Zkontroluj server běží

### Invalid Access Token
- ✅ Vygeneruj nový token
- ✅ Zkontroluj, že jsi vybral správnou stránku

### Page ID not found
- ✅ Zkontroluj ID v Developer Dashboardu
- ✅ Zkontroluj, že stránka je připojená

---

**Máš otázky? Řekni mi! 💬**
