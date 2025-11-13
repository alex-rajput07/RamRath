# Google Maps API Setup Guide

## Get Your Google Maps API Key (Free)

### Step 1: Create a Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click **Select a Project** → **New Project**
3. Name: `RamRath` (or any name)
4. Click **Create**

### Step 2: Enable the Directions API
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for `Directions API`
3. Click on it → **Enable**
4. Repeat for **Places API** (optional, for autocomplete)

### Step 3: Create an API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the key

### Step 4: Restrict Your Key (Important for Security)
1. Click on your API key in the Credentials list
2. Scroll to **Application restrictions** → Select **HTTP referrers (web sites)**
3. Add your domain:
   - For Vercel: `https://ramrath-*.vercel.app/*`
   - For localhost dev: `http://localhost:3000/*`
4. Under **API restrictions**, select **Directions API** (and **Places API** if enabled)
5. Click **Save**

### Step 5: Add to Your App
1. Open `.env.local` in your project
2. Set:
```
GOOGLE_MAPS_API_KEY=your-api-key-here
```

3. For Vercel production, add in Project Settings → Environment Variables:
```
GOOGLE_MAPS_API_KEY=your-api-key-here
```
(Mark as **Sensitive** so it doesn't leak to client)

### Testing Locally
```powershell
npm run dev
# Go to http://localhost:3000/direct-book
# Enter From/To locations
# Click "Estimate Distance" → should show distance
```

If you see a 403 error, double-check:
- API key is set in `.env.local`
- Directions API is **enabled** in Google Cloud Console
- Key restrictions include `http://localhost:3000/*` if testing locally

---

**Free Tier:** Google gives you $300/month free credit. The Directions API costs ~$0.005 per request (very cheap for most use cases).

**Troubleshooting:**
- "Invalid API key" → Check key is pasted correctly, no extra spaces
- "This API project is not authorized" → Enable Directions API in Google Cloud
- CORS error → Add `http://localhost:3000/*` to Application restrictions

Need help? Contact support or check https://developers.google.com/maps/documentation/distance-matrix
