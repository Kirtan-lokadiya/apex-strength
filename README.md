# ApexStrength 🏋️‍♂️⚡

> Complete production-grade, mobile-first progressive overload tracker, adaptive weekly gym scheduler, and AI strength assistant.

Built as an independent, proprietary-safe implementation engineered for **100% lifetime-free operations** for 2 users across Vercel, Firebase (Spark Tier), and ImgBB.

---

## 1. Reference Project & Licensing Strategy

- **Reference Analysis:** Liftosaur (`astashov/liftosaur`) was reviewed for exercise science concepts (progressive overload thresholds, plate math, 1RM formulas).
- **Licensing Decision — Mode B (Independent Implementation):**  
  Liftosaur is strictly licensed under GNU AGPL-3.0. To avoid copyleft contamination across serverless architectures and proprietary workflows, **ApexStrength was completely re-architected and independently written from scratch**. Zero protected source code, trademarks, or branding from Liftosaur, Gravl, Hevy, or Alpha Progression were copied. All UI, branding, data models, and logic are original.

---

## 2. Lifetime Free Architecture (2-User Model)

| Component | Free Provider | Free Tier Quota | 2-User Actual Usage | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend & API** | Vercel | Unlimited personal hobby deployments, global edge CDN | ~500 requests/month | **$0.00 / month** |
| **Database & Auth** | Firebase (Spark) | 50,000 reads/day, 20,000 writes/day, 1GB storage | ~50-100 reads/day, ~20-50 writes/day (<0.5%) | **$0.00 / month** |
| **Image Hosting** | ImgBB | Free API, up to 32MB per photo, direct CDN links | ~10-20 custom exercise photos | **$0.00 / month** |
| **Progression Engine**| Deterministic Engine | Runs locally in TypeScript client/server-side | Unlimited calculations | **$0.00 / month** |
| **AI Layer (Optional)**| OpenAI API | Pay-as-you-go / cached responses (or deterministic fallback) | Cached GPT-4o-mini | User-provided key |

---

## 3. Core Capabilities

### 1. Today Screen & Daily Check-in
- Real-time today dashboard showing scheduled workout, estimated duration, muscle groups, planned exercises, and previous session performance.
- Pre-workout readiness check-in (Sleep, Energy 1–5, Soreness 1–5, Stress 1–5, Time Available).
- Instant "Start Workout Now" action.

### 2. Missed Workout Engine & Adaptive Scheduling
- Automatically flags scheduled sessions as **Missed** if scheduled time has elapsed.
- Never silently destroys or deletes training history.
- Provides 4 interactive resolution options:
  1. **Move to Today** & shift conflicting sessions.
  2. **Do Shortened 35-min Express Workout** (prioritizes heavy compound lifts, drops isolation accessories).
  3. **Skip & Continue** current split.
  4. **Let AI Reorganize Week** (evaluates muscle recovery intervals, ensures minimum 48h rest between identical muscle groups, caps consecutive training days, and displays a proposal diff with "Apply Changes").

### 3. Distraction-Free Gym Mode
- Large numeric keypad-friendly inputs for weight and reps.
- One-tap set completion with vibration and sound feedback.
- Floating Rest Timer with countdown, `+30s`, and skip actions.
- Olympic Barbell Plate Calculator popup breaking down 20kg/45lb bar and exact plates needed per side.
- Set types: Normal, Warmup, Drop, Failure, and AMRAP.
- Instant offline persistence on every keystroke so crashes or phone locks never lose a set.

### 4. Deterministic + AI 2-Layer Progression Engine
- **Layer 1 (Deterministic):** Evaluates previous working sets against double progression criteria (e.g. 8–10 rep range). If user hits top rep range with >= 2 RIR, automatically increments load (2.5 kg barbell, 2 kg dumbbell). If user repeatedly fails (2+ consecutive sessions under minimum reps), executes an automatic ~10% deload to reset fatigue.
- **Layer 2 (AI Reasoning):** Server-side route calling OpenAI `gpt-4o-mini` with strict system instructions, response validation, and input-hash caching.
- **Graceful Fallback:** Operates 100% reliably even when no OpenAI key is configured.

### 5. PWA & Offline-First Persistence
- Web Manifest (`manifest.json`) and Service Worker (`sw.js`).
- Firestore multi-tab IndexedDB cache (`persistentLocalCache` + `persistentMultipleTabManager`).
- Add to Home Screen on iOS Safari and Android Chrome for a native app feel.

---

## 4. Local Installation & Setup

### Prerequisites
- Node.js >= 20 (Tested on Node 26)
- npm or pnpm

### Quick Start
```bash
# 1. Navigate to directory
cd /Users/home/Desktop/apex-strength

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser or mobile simulator.

---

## 5. Environment Variables (`.env.local`)

Copy `.env.example` to `.env.local`:
```bash
# Server-side only (never expose in client bundles)
OPENAI_API_KEY=your-openai-api-key

# Firebase Client (free Spark tier)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# ImgBB Free Image Hosting API Key
NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-api-key
```

*(Note: The app comes pre-configured with local demonstration seed data and offline IndexedDB fallback. Even without inserting keys, all views, timers, calculations, and logging are fully functional immediately!)*

---

## 6. Running Tests

The test suite validates mathematical progression rules, 1RM formulas, plate breakdowns, and missed workout detection:

```bash
npm test
```

Result:
```
✔ 1RM Calculations (Brzycki, Epley, Composite)
✔ Plate Calculator (Standard 62.5kg, empty bar)
✔ Progression Engine (Overload increase, double progression, deload on failure)
✔ Missed Workout Detector (Audit event logging, status transition)
Tests: 13 passed, 0 failed
```

---

## 7. Deployment to Vercel (100% Free)

1. Push this repository to GitHub or GitLab.
2. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. Set the environment variables from your `.env.local`.
5. Click **Deploy**. Vercel will build and serve the application globally with automatic SSL.

---

## 8. License

Proprietary / Independent Implementation.  
All rights reserved. Free for personal usage.
