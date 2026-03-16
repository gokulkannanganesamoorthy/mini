# Mini — AI PA Companion
## Environment Setup, API Keys & Hardware Guide

---

## 1. Hardware List to Buy

| # | Component | Purpose | Approx Price (INR) |
|---|-----------|---------|-------------------|
| 1 | **ESP32-S3 DevKit** | Main microcontroller (best for AI/voice) | ₹700–900 |
| 2 | **INMP441 I2S Microphone** | Digital, low-noise voice capture | ₹200–350 |
| 3 | **MAX98357A I2S Amplifier** | Digital audio output | ₹150–250 |
| 4 | **3W–5W Speaker (4Ω or 8Ω)** | Audio output | ₹100–300 |
| 5 | **DS3231 RTC Module** | Accurate real-time clock (alarms even offline) | ₹100–200 |
| 6 | **0.96" OLED Display (I2C, SSD1306)** | Show status / mini text | ₹100–200 |
| 7 | **Micro SD Card Module** | Cache audio, store logs | ₹100–150 |
| 8 | **5V 2A USB Power Adapter** | Stable power (avoid phone chargers) | ₹150–250 |
| 9 | **USB-C to Micro USB cable** | Programming cable | ₹100 |
| 10 | **Breadboard + jumper wires** | Prototyping | ₹150–200 |
| 11 | **TP4056 Li-Po charger board** *(optional)* | Make it portable with battery | ₹80–150 |
| 12 | **3.7V Li-Po battery 2000mAh** *(optional)* | Portability | ₹300–500 |
| 13 | **Small enclosure / project box** | House the device | ₹100–300 |

> **Total estimated budget: ₹2,500–4,000** (without battery) or **₹3,000–5,000** (with portable battery)

> **Where to buy**: Robu.in, Tomson Electronics (Coimbatore), or Amazon.in

---

## 2. Software Prerequisites

```bash
# Node.js 18+ required
node -v

# Install project dependencies
cd /path/to/mini
npm install

# Create your .env file (copy from .env.example or edit .env directly)
cp .env .env.local
```

---

## 3. API Keys Setup (Step by Step)

### 🤖 OpenAI (GPT-4o + Whisper voice)
1. Go to https://platform.openai.com
2. Sign up / Log in → API Keys → **Create new secret key**
3. Copy the key (starts with `sk-...`)
4. In `.env`: `OPENAI_API_KEY=sk-...`
5. Make sure billing is enabled (GPT-4o requires a paid account)

---

### 🎙️ ElevenLabs (Text to Speech)
1. Go to https://elevenlabs.io
2. Sign up → Profile → **API Key** (free tier: 10,000 chars/month)
3. Copy the key
4. In `.env`: `ELEVENLABS_API_KEY=your_key`
5. Voice ID: Go to Voices → pick a voice → click it → copy the **Voice ID** from the URL
6. In `.env`: `ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB` (default Adam voice)

---

### ☁️ OpenWeatherMap (Weather)
1. Go to https://openweathermap.org/api
2. Sign up → API Keys → copy default key
3. In `.env`:
   ```
   OPENWEATHER_API_KEY=your_key
   OPENWEATHER_CITY=Coimbatore
   ```

---

### 📅 Google Calendar (Work + Personal + 3rd Account)
You have **2 calendar accounts** (Work/Office & Personal). Mini supports all 3.

1. Go to https://console.cloud.google.com
2. Create project → Enable **Google Calendar API**
3. Create **OAuth 2.0 Credentials** (type: Web Application)
4. Add redirect URI: `http://localhost:4000/api/calendar/oauth/callback`
5. Copy Client ID + Client Secret
6. In `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:4000/api/calendar/oauth/callback
   ```
7. Visit `http://localhost:4000/api/calendar/auth?account=work` to authorize Work account
8. Visit `http://localhost:4000/api/calendar/auth?account=personal` to authorize Personal account

---

### 💬 WhatsApp (Meta Cloud API — Read + Send + Auto-reply)

**Step 1: Meta Developer Setup**
1. Go to https://developers.facebook.com
2. Create App → Business → Add **WhatsApp** product
3. Go to WhatsApp → Getting Started → copy:
   - **Phone Number ID**
   - **Access Token** (temporary, or generate permanent)
4. In `.env`:
   ```
   META_WHATSAPP_TOKEN=EAA...
   META_PHONE_NUMBER_ID=your_phone_id
   META_WHATSAPP_VERIFY_TOKEN=mini_whatsapp_verify
   ```

**Step 2: Webhook for incoming messages**
> You need a public URL for Meta to send incoming messages to you.

Use **ngrok** (free) during development:
```bash
# Install ngrok
brew install ngrok

# Expose your server
ngrok http 4000

# Copy the HTTPS URL e.g. https://abc123.ngrok.io
```

In Meta Dashboard → WhatsApp → Webhooks:
- Callback URL: `https://abc123.ngrok.io/api/webhook/whatsapp`
- Verify token: `mini_whatsapp_verify` (must match `.env`)
- Subscribe to: `messages`

**Auto-reply when busy**: Already built! Mini auto-responds to incoming WhatsApp messages when you're marked as busy in the Messages page.

---

### 📸 Instagram DMs (Read + Send)
1. In Meta Developer console → Add **Instagram** product to same app
2. Add your Instagram Business/Creator account
3. Get **Instagram User ID + Access Token**
4. In `.env`:
   ```
   META_INSTAGRAM_TOKEN=EAA...
   META_INSTAGRAM_USER_ID=your_ig_user_id
   META_INSTAGRAM_VERIFY_TOKEN=mini_instagram_verify
   ```
5. Webhook: Same as WhatsApp but URL = `https://your-ngrok.io/api/webhook/instagram`

> ⚠️ Instagram DMs require your account to be a **Business or Creator** account.

---

### 💬 iMessage (No API key needed!)
Works automatically on **macOS** using AppleScript.

1. Sign in to **Messages.app** on your Mac
2. Go to **System Settings → Privacy → Automation**
3. Allow Terminal (or the app running the server) to control Messages
4. Done! Mini can read and send iMessages via:
   ```bash
   curl -X POST http://localhost:4000/api/messages/imessage \
     -H "Content-Type: application/json" \
     -d '{"to": "+919876543210", "message": "Hey! Gokul will call you back."}'
   ```

---

### 📞 Calls — Twilio Voice (Make calls + Auto-answer)
1. Go to https://twilio.com/try-twilio (free trial: $15 credit)
2. Console → Account SID + Auth Token → copy
3. Buy a phone number ($1/month)
4. In `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
   ```
5. **Inbound calls**: In Twilio Console → Phone Numbers → your number
   - Voice Webhook: `https://your-ngrok.io/api/calls/receive`
   - Mini will auto-answer and speak to the caller!

---

### 📱 iPhone Integration (Apple Shortcuts)
This connects your iPhone to Mini's API.

**Auto-send message notifications:**
1. Open **Shortcuts** app on iPhone
2. New Automation → When **Message received** (or any trigger)
3. Add action: **Get contents of URL**
   - URL: `http://your-mac-ip:4000/api/webhook/shortcuts`
   - Method: POST
   - Body (JSON):
     ```json
     {"event":"message_received","from":"[Sender Name]","body":"[Message Content]","platform":"imessage"}
     ```
4. Run immediately → done!

**Missed call notification:**
Same flow, trigger = **Missed Call**, body = `{"event":"call_missed","from":"[Caller Name]"}`

---

## 4. Running Mini

### Development (run both frontend + backend together):
```bash
cd /Users/gokulkannan.g/Developer/Desktop/projects/mini
npm run dev:all
```
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

### Backend only:
```bash
npm run server
```

### Frontend only:
```bash
npm run dev
```

---

## 5. Calendar — 3 Accounts Setup

Mini supports **3 calendar accounts** with color coding:

| Account | Color | Usage |
|---------|-------|-------|
| **Work** | White | Orrayson Studio, client meetings |
| **College** | Gray | PSG Tech classes, lab sessions |
| **Personal** | Dim white | Personal events, hobbies, health |

To add events manually in the app:
- Open `/calendar` → click **+ Add event**
- Pick the account (Work / College / Personal)
- Events are color-coded in the calendar grid

For Google Calendar sync (auto-import real events):
- Complete the OAuth setup in step 3 above
- Mini will pull events automatically every hour

---

## 6. ESP32 Integration (Later)

Once you have the hardware, your ESP32 firmware should POST to:

```http
POST http://your-mac-ip:4000/api/device
Content-Type: application/json

{ "action": "briefing" }   → Returns morning briefing text to speak
{ "action": "alarm" }      → Returns alarm message + time
{ "action": "status" }     → Returns system online status
{ "action": "listen" }     → Points ESP32 to voice transcribe endpoint
```

The server is already waiting. Just build the firmware when ready.

---

## 7. Health & Reminder System

Mini automatically reminds you (via sidebar popup + voice if ElevenLabs is set):

| Time | Reminder |
|------|---------|
| 13:00 | Lunch break |
| 17:00 | Water + stretch |
| 19:00 | Evening break |
| 22:30 | Wind down |
| 23:30 | Sleep now! |

These are hardcoded to your routine. Adjust in `src/components/Layout.jsx` → `checkHealthReminders()`.

---

## 8. Quick Reference — All Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI conversation |
| `/api/voice/transcribe` | POST | Audio → text (Whisper) |
| `/api/voice/speak` | POST | Text → MP3 audio (ElevenLabs) |
| `/api/calendar` | GET/POST | Calendar events |
| `/api/tasks` | GET/POST/PATCH/DELETE | Tasks |
| `/api/memory` | GET/POST/DELETE | Memory store |
| `/api/briefing` | GET | Morning briefing |
| `/api/alarm` | GET/POST | Alarm config |
| `/api/messages/imessage` | GET/POST | iMessage |
| `/api/messages/whatsapp` | GET/POST | WhatsApp |
| `/api/messages/instagram` | GET/POST | Instagram DMs |
| `/api/calls/make` | POST | Make outbound call |
| `/api/calls/receive` | POST | Twilio webhook (inbound) |
| `/api/device` | POST | ESP32 bridge |
| `/api/webhook/whatsapp` | GET/POST | Meta webhook |
| `/api/webhook/shortcuts` | POST | iPhone Shortcuts |
| `/api/settings` | GET/POST | Settings CRUD |
