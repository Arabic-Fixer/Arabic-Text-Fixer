# Arabic Text Fixer

A lightweight Chrome extension that fixes Arabic text direction (RTL/LTR) issues caused by Unicode BiDi rendering when copying text from ChatGPT, PDFs, or websites into apps like Reddit, Microsoft Word, Google Docs, and Notion.

---

## 🧠 Problem

Arabic text often breaks when pasted into web editors due to mixed direction (RTL/LTR) handling.

Common issues:
- Text appears left-to-right instead of right-to-left  
- Punctuation flips direction (؟ ، .)  
- Mixed Arabic + English becomes visually disordered  
- Cursor behaves unpredictably while editing  
- Copy-paste from AI tools or PDFs becomes messy  

---

## ⚙️ Solution

Arabic Text Fixer processes text before it is rendered in editable fields by:

- Removing problematic Unicode BiDi control characters  
- Normalizing text direction (RTL/LTR consistency)  
- Fixing punctuation display issues  
- Stabilizing mixed Arabic + English text  

---

## ✨ Features

- Fixes Arabic RTL rendering issues  
- Supports mixed Arabic + English text  
- Works in Reddit, Word, Google Docs, Notion  
- Lightweight and fast  
- No internet required  

---

## ❌ What It Does NOT Do

- Does NOT rewrite text  
- Does NOT translate  
- Does NOT fix grammar  
- Does NOT change meaning  

---

## 🧩 How It Works

The extension intercepts pasted text in the browser before it is inserted into editable fields. It then cleans Unicode direction markers and ensures consistent rendering across web applications.

---

## 🚀 Installation (Developer Mode)

1. Download or clone this repository  
2. Open Chrome → `chrome://extensions/`  
3. Enable **Developer mode**  
4. Click **Load unpacked**  
5. Select the project folder  

---

## 🔐 Privacy

- No data is collected  
- No text is sent anywhere  
- No tracking or analytics  
- Everything runs locally in your browser  

---

## 💡 Use Cases

- Posting Arabic content on Reddit  
- Pasting ChatGPT responses into Word or Google Docs  
- Editing bilingual (Arabic + English) documents  
- Fixing messy text from PDFs and websites  

---

## 📌 License

MIT License
