# PitchPulse Live

A football live-match dashboard built with Next.js and TypeScript, ready for Netlify.

## What changed
- No hardcoded `Lamine Yamal 7.8` rating.
- Player ratings refresh automatically every 15 seconds.
- With API-Football configured, the app uses the provider's live per-player match rating when available.
- If the provider has not produced a rating yet, the app calculates one from goals, assists, shots on target, key passes, tackles, interceptions, dribbles and cards.
- Without an API key, the UI runs a demo live-data engine so you can test the update loop immediately.
- Stream player accepts authorized YouTube, Twitch, HLS (`.m3u8`) and MP4 URLs and remembers the URL in the browser.

## Local run
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Real live ratings
1. Create an API-Football / API-Sports account and get an API key.
2. Copy `.env.example` to `.env.local`.
3. Set `API_FOOTBALL_KEY`.
4. Set `API_FOOTBALL_FIXTURE_ID` to the match fixture you want to follow.
5. Restart the app.

The app polls `/api/live` every 15 seconds. The API key remains on the server.

## Netlify
Netlify supports modern Next.js apps directly.

### Dashboard deploy
1. Put this folder in a GitHub/GitLab repository.
2. In Netlify choose **Add new project → Import an existing project**.
3. Netlify should detect Next.js. This repo also includes `netlify.toml` with `npm run build` and `.next`.
4. In **Site configuration → Environment variables**, add:
   - `API_FOOTBALL_KEY`
   - `API_FOOTBALL_FIXTURE_ID`
5. Deploy.

### Stream playback
Paste a stream URL into the player on the page. Use only streams you own or are authorized to rebroadcast. Some commercial sports providers block embedding or require their own SDK/player; in that case their official integration must be used instead of a raw URL.
