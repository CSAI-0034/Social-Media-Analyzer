

# 📄 Social Media Content Analyzer

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-red?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📝 Overview

**Social Media Content Analyzer** is a full-stack, AI-powered web application that **extracts text from PDFs and Images** and transforms it into engaging, ready-to-post social media content.

Built with **React.js (frontend)** and **Node.js + Express (backend)**, it integrates **OCR (PDF.js + Tesseract.js)** for text extraction and **Google Gemini AI** for advanced content generation like **summarization, rewriting, hashtags, sentiment analysis, and engagement tips**.

This tool is perfect for **students, marketers, businesses, and content creators** who want to save time and directly create optimized content from documents.

---

## ✨ Key Features

✔️ Upload PDFs / Images with hybrid OCR (text + scanned support)
✔️ Extract text using **PDF.js + Tesseract.js**
✔️ **AI-Powered Tools (Gemini AI)**:

* 📝 Summarization (5 bullet points)
* 🔖 Hashtags Generator
* 📊 Sentiment Analysis
* 🚀 Engagement Improvement Suggestions
* 💼 LinkedIn-Style Rewriting
  ✔️ **Theme Switcher** → Light 🌞 | Dark 🌙 | Gradient 🌈
  ✔️ **Dashboard-Style UI** inspired by PDF2Go
  ✔️ Step-by-Step **How to Use Guide**
  ✔️ **FAQ Section** for user clarity
  ✔️ **Contact Us Form** → integrated with backend via **Nodemailer**
  ✔️ Smooth **animations & responsive design** for mobile & desktop

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/CSAI-0034/social-analyzer.git
cd social-analyzer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root folder:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
```

### 4. Start Development Servers

Frontend (Vite):

```bash
npm run dev
```

Backend (Express):

```bash
npm run server
```

---

## 🛠 Tech Stack

* **Frontend** → React.js, TailwindCSS, Framer Motion
* **Backend** → Node.js, Express, Nodemailer
* **OCR** → PDF.js, Tesseract.js
* **AI** → Google Gemini API
* **Deployment** → Vercel (Frontend), Render/Heroku (Backend)

---

## 📌 Usage Workflow

1️⃣ **Upload File** → PDF or Image
2️⃣ **Extract Text** → Hybrid OCR ensures both text & scanned PDFs work
3️⃣ **Run AI Tools** → Summarize, Hashtags, Sentiment, Engagement, Rewrite
4️⃣ **Copy/Download** → Directly export optimized text for social media

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you’d like to change.

---

## 📜 License

This project is licensed under the **MIT License**.

---

⚡ *“Turn boring PDFs into viral social posts — instantly!”*


