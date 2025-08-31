# 🚀 Social Media Content Analyzer

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-red?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🌟 What is Social Media Content Analyzer?

**Social Media Content Analyzer** is a modern, AI-driven web app designed to help you turn PDFs and images into compelling, ready-to-share social media content in just a few clicks.

Built with a robust **React.js** frontend and a powerful **Node.js/Express** backend, it leverages **PDF.js** and **Tesseract.js** for OCR, and integrates **Google Gemini AI** for advanced content transformation—summaries, hashtags, sentiment, and more.

Whether you’re a student, marketer, business owner, or content creator, Social Analyzer streamlines your workflow and helps you craft optimized posts directly from your documents.

---

## 🔑 Features at a Glance

- **Upload PDFs or Images** (supports both text and scanned files)
- **Hybrid OCR**: Extracts text using PDF.js & Tesseract.js
- **AI Content Tools** (powered by Gemini):
  - Summarize content (5 key points)
  - Generate relevant hashtags
  - Analyze sentiment
  - Suggest ways to boost engagement
  - Rewrite for LinkedIn-style posts
- **Modern UI**:
  - Light, Dark, and Gradient themes
  - Dashboard-inspired layout (PDF2Go style)
  - Step-by-step usage guide
  - FAQ section for quick help
  - Contact form (integrated with Nodemailer)
  - Responsive design & smooth animations

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CSAI-0034/social-analyzer.git
cd social-analyzer
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
```

### 4. Run the Application

Start the frontend (Vite):

```bash
npm run dev
```

Start the backend (Express):

```bash
npm run server
```

---

## 🛠️ Tech Stack

- **Frontend:** React.js, TailwindCSS, Framer Motion
- **Backend:** Node.js, Express, Nodemailer
- **OCR:** PDF.js, Tesseract.js
- **AI:** Google Gemini API
- **Deployment:** Vercel (Frontend), Render/Heroku (Backend)

---

## 🚦 How It Works

1. **Upload** your PDF or image file.
2. **Extract** text using hybrid OCR (works for both digital and scanned files).
3. **Apply AI Tools**: Summarize, generate hashtags, analyze sentiment, get engagement tips, or rewrite for LinkedIn.
4. **Copy or Download** your optimized social media content.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss your ideas or submit a pull request.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

> **Transform your documents into viral
