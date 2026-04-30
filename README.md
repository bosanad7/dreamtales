# 🌙 DreamTales — AI Bedtime Story Generator

A mobile-first Next.js app that turns moments from your child's day into a personalized bedtime story — complete with illustrated scenes, voice narration, and soothing background music.

---

## ✅ Final Feature Checklist

### Works right now — zero API keys needed
- [x] `npm run dev` starts on http://localhost:3000
- [x] Animated star background, dark purple theme
- [x] 4-step mobile-first creation form (name, age, language, moments, theme picker)
- [x] Demo story generation (template, ~instant, weaves real child moments in)
- [x] Themed SVG placeholder scene illustrations
- [x] Browser Web Speech API narration (play button per scene)
- [x] Slideshow mode with scene navigation + dot indicators
- [x] Auto-play mode (advances on narration end or timed fallback)
- [x] Background ambient lullaby music (Web Audio API, no external service)
- [x] Story auto-saved to localStorage immediately after generation
- [x] Library page — cover art, date, child name, 2-column grid
- [x] Tap library card to replay from scene 1
- [x] Demo mode banner with `.env.local` instructions
- [x] Delete story from library (hover to reveal)

### Needs API keys to unlock
- [ ] AI-written story (`OPENROUTER_API_KEY`) — replaces template with Claude/GPT
- [ ] DALL-E 3 scene illustrations (`OPENAI_API_KEY`) — replaces SVG placeholders
- [ ] ElevenLabs voice narration (`ELEVENLABS_API_KEY`) — replaces browser TTS

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure (all keys optional — app works in demo mode without them)
cp .env.local.example .env.local

# 3. Run
npm run dev
# → http://localhost:3000
```

---

## 🔑 API Keys (all server-side, never exposed to browser)

| Key | Service | Without it | Cost per story |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Story writing (Claude/GPT via [openrouter.ai](https://openrouter.ai/keys)) | Template story | ~$0.003 |
| `OPENAI_API_KEY` | DALL-E 3 images ([platform.openai.com](https://platform.openai.com/api-keys)) | SVG placeholders | ~$0.28 (7 images) |
| `ELEVENLABS_API_KEY` | Voice narration ([elevenlabs.io](https://elevenlabs.io)) | Browser TTS | ~free tier |

**Security audit:**
- No key uses `NEXT_PUBLIC_` prefix
- All keys read only inside `src/lib/` files imported by API routes
- Zero key material reaches the browser

---

## 🏗️ Architecture

```
src/app/api/
  generate-story/     ← OpenRouter LLM  (server-only)
  generate-images/    ← DALL-E 3 or SVG placeholders (server-only)
  generate-narration/ ← ElevenLabs or skip (server-only)

src/lib/
  openrouter.ts       ← chatCompletion() + buildDemoStory() fallback
  openai.ts           ← generateSceneImage() (lazy client, needs key)
  elevenlabs.ts       ← generateNarration() (needs key)
  placeholderImage.ts ← generatePlaceholderSvg() (no key needed)
  storage.ts          ← localStorage read/write
```

---

## 🛠️ Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run typecheck  # TypeScript check
```

> **Note:** npm `.bin/` shims were broken at project creation. Scripts call `node node_modules/next/dist/bin/next` directly — this is intentional.

---

## 🗺️ Future Enhancements

- [ ] Supabase cloud storage (stories currently localStorage only)
- [ ] Story sharing via public link
- [ ] Download as MP4 video or PDF
- [ ] Arabic RTL layout polish
- [ ] Child avatar customization
- [ ] Sound effects per scene
- [ ] AI memory for recurring characters across stories
