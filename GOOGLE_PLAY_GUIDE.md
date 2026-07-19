# Publishing "The Operator" to Google Play

This app is a PWA (`public/manifest.json` + `public/sw.js`), so the path to Google
Play is a **Trusted Web Activity (TWA)** — a thin Android wrapper that opens your
already-deployed site full-screen, with no webview chrome. Google's own tool for
this is **Bubblewrap**. This guide gets you from "deployed website" to
"uploaded app bundle."

You need to do the account/signing/store-listing steps yourself — an AI session
can't hold your Play Console account, your signing key, or a credit card. This
doc is the checklist for what those steps are and in what order.

---

## Prerequisites (do these first)

- [ ] The app is deployed to a **real HTTPS domain** you control (not a `*.vercel.app`
      preview URL — use a custom domain, since digital asset link verification is
      domain-specific and preview URLs can change).
- [ ] A [Google Play Console](https://play.google.com/console) account
      ($25 one-time registration fee).
- [ ] Node.js installed locally (for the Bubblewrap CLI).
- [ ] `ANTHROPIC_API_KEY` set in your Vercel project's environment variables —
      the AI coach feature (`/api/coach`) needs this to work in production.
      Project Settings → Environment Variables in the Vercel dashboard.

---

## 1. Fix the icons before packaging

`public/manifest.json` currently only references `icon.svg`. Bubblewrap and the
Play Store listing both want **PNG** icons, not SVG:

- A 512×512 PNG for the Play Store listing (adaptive icon / hi-res icon).
- A 192×192 PNG for the manifest (Bubblewrap reads this to generate the
  Android launcher icon).

Export `public/icon.svg` to both sizes (e.g. `npx sharp-cli` or any image tool)
as `public/icon-192.png` and `public/icon-512.png`, then add them to the
`icons` array in `public/manifest.json` alongside the existing SVG entries.

## 2. Install Bubblewrap and initialize the Android project

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://yourdomain.com/manifest.json
```

Bubblewrap will ask a series of questions — these are the ones worth getting
right the first time:

| Prompt | What to enter |
|---|---|
| Application ID | Reverse-domain package name, e.g. `com.yourcompany.theoperator`. **Cannot be changed after your first Play Store upload.** |
| App name / launcher name | "The Operator" |
| Display mode | `standalone` (matches `manifest.json`) |
| Orientation | `portrait` (matches `manifest.json`) |
| Theme / background color | `#f59e0b` / `#09090b` (matches `manifest.json`) |
| Signing key | Let Bubblewrap generate one, or supply an existing keystore |

This creates an Android project directory with a generated `android.keystore`
(or uses the one you supplied). **Back up this keystore and its password
somewhere durable — if you lose it you cannot publish updates to the same app
listing ever again.**

## 3. Verify domain ownership (Digital Asset Links)

TWAs need a `assetlinks.json` file proving you own the domain, so the app opens
without a browser address bar. Bubblewrap generates the file content for you at
the end of `init` — you must host it yourself at:

```
https://yourdomain.com/.well-known/assetlinks.json
```

Since this project deploys via Vercel and serves `public/` at the site root,
drop the generated file at `public/.well-known/assetlinks.json` in this repo
and redeploy. Verify it's reachable:

```bash
curl https://yourdomain.com/.well-known/assetlinks.json
```

## 4. Build the app bundle

```bash
cd theoperator-android   # or whatever directory bubblewrap init created
bubblewrap build
```

This produces `app-release-bundle.aab` (upload this) and `app-release-signed.apk`
(useful for testing directly on a device before you upload anything).

## 5. Test on a real device first

```bash
adb install app-release-signed.apk
```

Confirm:
- The app opens full-screen with **no browser URL bar** (this only works once
  `assetlinks.json` is live and correct — if you see a URL bar, the asset
  link verification failed).
- Sign-in, the daily planner, and the **"Plan My Day" AI coach button** all work
  end-to-end against your production API (not `localhost`).
- The app survives a phone rotation / backgrounding without losing state.

## 6. Play Console listing

In Play Console, create a new app and fill in:

- [ ] **App bundle** — upload `app-release-bundle.aab` under Production (or
      Internal/Closed testing first, which is recommended for a first release).
- [ ] **Privacy policy URL** — this repo already has one at `/privacy`
      (`src/pages/Privacy.tsx`), so use `https://yourdomain.com/privacy`.
- [ ] **App content / data safety questionnaire** — answer based on what the
      app actually collects: email (auth, via Supabase), planner data, and
      Stripe for payments if subscriptions are enabled.
- [ ] **Store listing assets** — short description, full description, a
      512×512 hi-res icon (see step 1), a feature graphic (1024×500), and at
      least 2 phone screenshots.
- [ ] **Content rating questionnaire.**
- [ ] **Target audience / ads declaration.**

## 7. Submit for review

First-time app reviews on Google Play commonly take a few days. Closed testing
tracks review faster than going straight to Production — worth using for the
first submission.

---

## Keeping the app updated after publishing

Every time you deploy a meaningful change to the live site, the TWA picks it up
automatically the next time a user opens the app (it's just loading your live
URL) — **you do not need to rebuild and re-upload the Android package for
ordinary web changes.** You only need to rebuild and re-upload the `.aab` when:

- You change `manifest.json` (icons, name, colors, orientation).
- You need a new Android permission the current build doesn't declare.
- You want to bump the Play Store version number for its own sake.

To rebuild: bump `appVersionCode` in `twa-manifest.json` inside the Bubblewrap
project, then `bubblewrap update && bubblewrap build`, and upload the new
`.aab` as a new release in Play Console.
