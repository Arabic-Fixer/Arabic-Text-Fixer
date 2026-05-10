# Arabic-Text-Fixer
Fix messy Arabic text in one click — Chrome Extension. Arabic text breaks when copied into Reddit, Word, or Google Docs due to Unicode direction issues (BiDi).

Tired of pasting Arabic text (from AI) into Word or Google Docs and seeing it scrambled,
left-to-right, or with punctuation flying to the wrong side?

**Arabic Fixer** cleans up Arabic text copied from ChatGPT, websites, PDFs,
and mixed-language documents — and pastes it correctly into any app.

## What it fixes
✅ Broken right-to-left (RTL) direction in Word, Google Docs, Notion
✅ Wrong punctuation — converts `?` → `؟` and `,` → `،`
✅ Extra spaces, repeated punctuation, invisible formatting characters
✅ Mixed Arabic + English text that reorders incorrectly
✅ Messy copy-paste from ChatGPT, PDFs, and web pages
## What it does NOT do
❌ Does NOT rewrite text
❌ Does NOT fix grammar
❌ Does NOT change meaning

## Three modes
- 🧼 **Clean Mode** — removes invisible characters, fixes spacing and punctuation (before posting on any socisl media or AI)
- 📄 **Word Safe Mode** — adds RTL HTML formatting so Word renders Arabic correctly (before pasting to Word/ Google Docs)
- 🌐 **Web Safe Mode** — adds Unicode direction marks for browsers and Notion

## How to install (Developer Mode)
1. Download or clone this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select this folder
5. The extension is now active in your browser

## Privacy
100% private. No servers. No accounts. Everything runs locally in your browser.
Your text is never sent anywhere.
