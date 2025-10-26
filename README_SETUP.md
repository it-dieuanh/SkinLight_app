# SkinLight App - Setup Guide

Welcome to SkinLight! This guide will help you set up and run the application.

## 🌟 Features

- **Landing Page**: Beautiful scrollable landing with hero section, features showcase, and social proof
- **Google Authentication**: Secure login using Google OAuth
- **Profile Dashboard**: Weather widget, photo history gallery, and daily lifestyle tracking
- **Camera Capture**: Take skin photos with helpful tips
- **AI Analysis**: Skin analysis with personalized recommendations
- **Responsive Design**: Works on both web and mobile

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# OpenAI API Key (Optional)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Your Skin Analysis API
NEXT_PUBLIC_SKIN_ANALYSIS_API=https://your-api.com/analyze
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret to `.env.local`

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`

### 5. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔌 API Integration

### Your Skin Analysis API

Replace the mock API calls in:
- `src/app/results/page.tsx`
- `src/app/api/analyze/route.ts`

With your actual skin analysis API endpoint:

```typescript
const response = await fetch(process.env.NEXT_PUBLIC_SKIN_ANALYSIS_API!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({
    userId: session?.user?.id,
    image: photoData.imageUrl, // Base64 image
  }),
});

const skinAnalysisData = await response.json();
```

### OpenAI Integration

To enable AI-powered recommendations, uncomment the OpenAI API calls in:
- `src/app/api/analyze/route.ts`

```typescript
const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a professional dermatologist." },
      { role: "user", content: prompt },
    ],
  }),
});
```

## 🎨 Color Scheme

The app uses a neutral beige/cream color palette:

- Background: `#FAF8F5` (Light cream)
- Primary: `#8B7355` (Warm brown)
- Secondary: `#E8E0D5` (Beige)
- Accent: `#D4C4B0` (Light tan)
- Foreground: `#4A4238` (Dark brown)

## 📱 Pages

1. **Landing Page** (`/`) - Hero, features, and call-to-action
2. **Login Page** (`/login`) - Google OAuth authentication
3. **Profile Page** (`/profile`) - Dashboard with weather, history, and lifestyle questions
4. **Capture Page** (`/capture`) - Camera interface for taking photos
5. **Results Page** (`/results`) - AI analysis and recommendations

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. On success: redirects to `/profile`
4. On failure: redirects back to landing page
5. User ID from Google is used as the unique identifier

## 🌤️ Weather Integration

The app automatically fetches weather data for Hanoi, Vietnam using the Open-Meteo API:
- No API key required
- Updates every hour
- Displays temperature, weather icon, and location

## 💾 Data Storage

Currently using **localStorage** for:
- Photo history
- Lifestyle data
- Analysis results

To persist data permanently, integrate with your backend database.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URIs with production URL
5. Deploy!

### Environment Variables for Production

Don't forget to set all environment variables in your hosting platform:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_OPENAI_API_KEY`
- `NEXT_PUBLIC_SKIN_ANALYSIS_API`

## 🛠️ Customization

### Adding Your Logo

Replace the text "SkinLight" in `src/app/page.tsx` with your logo image:

```tsx
<Image src="/logo.png" alt="SkinLight" width={200} height={60} />
```

### Updating Colors

Edit `src/app/globals.css` to customize the color scheme.

### Adding More Features

The modular structure makes it easy to add new features:
- Add new pages in `src/app/`
- Create reusable components in `src/components/`
- Add API routes in `src/app/api/`

## 📝 Notes

- The app uses Next.js 15 with App Router
- All components use TypeScript
- Styling with Tailwind CSS v4
- UI components from shadcn/ui
- Authentication with NextAuth v5

## 🐛 Troubleshooting

### Google OAuth Not Working
- Check redirect URIs match exactly
- Ensure Google+ API is enabled
- Verify Client ID and Secret are correct

### Camera Not Working
- Check browser permissions
- Use HTTPS in production (required for camera access)
- Test on different browsers

### API Errors
- Check CORS settings on your API
- Verify API endpoint URLs
- Check API keys are correct

## 📞 Support

For issues or questions:
1. Check console logs for errors
2. Verify environment variables are set
3. Test API endpoints separately
4. Check browser compatibility

---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**