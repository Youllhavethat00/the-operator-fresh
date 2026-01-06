# The Operator - Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Option 1: Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click "Deploy"
5. Your app is live!

### Option 2: Deploy to Netlify
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Build settings are auto-detected
6. Click "Deploy site"

---

## 📱 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Steps
```bash
# Clone the repository
git clone <your-repo-url>
cd the-operator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase (for cloud sync)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (for payments - optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

---

## 📲 PWA Installation

### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install"

---

## 🛡️ Security Checklist

- [ ] Environment variables are not committed to git
- [ ] Supabase Row Level Security is enabled
- [ ] API keys are restricted by domain
- [ ] HTTPS is enforced

---

## 📊 Analytics & Monitoring

### Recommended Services
- **Vercel Analytics** - Built-in if using Vercel
- **Google Analytics** - Add GA4 tracking
- **Sentry** - Error tracking

---

## 🔄 Continuous Deployment

Both Vercel and Netlify support automatic deployments:
1. Push to `main` branch
2. Build automatically triggers
3. Preview deployments for PRs

---

## 📱 Google Play Store Publishing

See `GOOGLE_PLAY_GUIDE.md` for detailed instructions on publishing to the Google Play Store using Trusted Web Activity (TWA).
