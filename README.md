# CANDLE MINDSET AI INDICATOR

Futuristic Apple-inspired **Nebula Liquid Glass** Quotex Screenshot Trading Signal Platform.

## 🚀 Features

- **Quotex Chart Scanner**: Automatic candlestick and asset detection from Quotex mobile & desktop screenshots.
- **Strict Color Analysis**: Last candle color logic (Red = DOWN, Green = UP) with Martingale 1 (MTG 1) calculation.
- **2-Minute Dhaka Expiration Engine**: Automatic verification ensuring screenshots are live within a 3-minute window against current Asia/Dhaka time.
- **Entry Timer Progress Bar**: Real-time loading bar that animates and fills as the countdown reaches the entry candle moment.
- **Synthesized Web Audio**: Built-in sound effects without external audio files.
- **Password Access**: Secure gateway (`candlemindsetx`).
- **Money Management Calculator**: Integrated position sizing and capital protection modal.

---

## 🛠️ Run Locally on Your Computer

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- `npm`

### Installation

1. Clone or download your repository:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <YOUR_REPO_NAME>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🌐 Deploy to Cloud Hosting from GitHub

This application is standard full-stack Node.js (React + Vite + Express). You can deploy it directly from your GitHub repository to:

### 1. Render.com
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Environment**: Node

### 2. Railway.app
- Connect your GitHub repo. Railway auto-detects `package.json` and runs `npm run build` and `npm start`.

### 3. VPS (Ubuntu / DigitalOcean / AWS)
```bash
git clone <YOUR_REPO_URL>
cd <YOUR_REPO_NAME>
npm install
npm run build
npm start
```

---

## 🔑 Environment Variables (Optional)

Create a `.env` file if you want to enable the optional Gemini Vision fallback:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
*(The local engine works 100% standalone without an API key!)*

---

© 2026 CANDLE MINDSET AI. All Rights Reserved.
