<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hedera Certification Program Dashboard

This is a dashboard application for managing the Hedera Certification Program.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Configure environment variables:
   Create a `.env.local` file with the following (this file is gitignored):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   
   The Gemini API key is optional and only needed for AI-powered insights.

3. Run the app:
   ```bash
   npm run dev
   ```

## Deployment

For Netlify deployments, configure the following environment variables in your Netlify dashboard (Site settings → Build & deploy → Environment):

- `GEMINI_API_KEY` - (Optional) Your Google Gemini API key for AI insights
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
