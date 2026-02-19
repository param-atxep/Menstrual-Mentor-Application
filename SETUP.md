# Quick Setup Guide

## Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Create a `.env` file with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Where to get these:**
- Supabase: Go to your project dashboard > Settings > API
- OpenAI: https://platform.openai.com/api-keys (optional)

### Step 3: Start Development
The dev server starts automatically. Just wait for it to load!

## What's Already Set Up

✅ Database schema (user_profiles, cycles, text_analyses, image_analyses)
✅ Row Level Security policies
✅ Authentication system
✅ Edge Functions (text-analysis, image-analysis)
✅ All UI components
✅ PWA support

## Testing the App

1. Create an account on the signup page
2. Login to access the dashboard
3. Try each feature:
   - Text analysis with AI
   - Voice input (requires browser support)
   - Image upload and analysis
   - Cycle logging and tracking

## Production Build

```bash
npm run build
```

Output will be in the `dist/` folder.

## Need Help?

Check the full README.md for detailed documentation.
