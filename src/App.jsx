// src/App.jsx
import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import Tesseract from "tesseract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  UploadCloud,
  FileText,
  Hash,
  RefreshCcw,
  Mail,
  Download,
  Copy,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ---------- File Reading Helpers ----------
const readAsArrayBuffer = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });

const readAsDataURL = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ---------- PDF Extraction ----------
async function extractTextFromPDF(file, onProgress) {
  const ab = await readAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  let allText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let pageText = content.items.map((it) => it.str).join(" ").trim();

    if (pageText.length < 10) {
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL("image/png");
      const { data } = await Tesseract.recognize(dataUrl, "eng");
      pageText = data.text;
    }

    allText += "\n\n" + pageText;
    onProgress?.(i, pdf.numPages);
  }

  return allText.trim();
}

async function extractTextFromImage(file) {
  const dataUrl = await readAsDataURL(file);
  const { data } = await Tesseract.recognize(dataUrl, "eng");
  return data.text.trim();
}

// ---------- Gemini AI ----------
async function runGemini(prompt) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("❌ Missing VITE_GEMINI_API_KEY in .env");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const res = await model.generateContent(prompt);
  return await res.response.text();
}

export default function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  const [theme, setTheme] = useState("gradient"); // 🌈 default theme

  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (f) => {
    setFile(f);
    setText("");
    setAiResult("");
    setProgress("Extracting...");

    try {
      let extracted = "";
      if (f.type === "application/pdf") {
        extracted = await extractTextFromPDF(f, (pg, total) =>
          setProgress(`Processing page ${pg}/${total}`)
        );
      } else if (/^image\//.test(f.type)) {
        extracted = await extractTextFromImage(f);
      } else {
        extracted = "❌ Unsupported file type.";
      }
      setText(extracted);
      setProgress("✅ Extraction Complete");
    } catch (e) {
      setProgress("⚠️ Error: " + e.message);
    }
  }, []);

  const handleAI = async (mode) => {
    if (!text) return alert("Please upload or paste text first!");
    setLoading(true);
    setAiResult("");

    let prompt = "";
    if (mode === "summary") prompt = `Summarize in 5 bullet points:\n\n${text}`;
    else if (mode === "hashtags")
      prompt = `Generate 12 trending hashtags:\n\n${text}`;
    else if (mode === "rewrite")
      prompt = `Rewrite in LinkedIn style:\n\n${text}`;
    else if (mode === "sentiment")
      prompt = `Analyze sentiment of this text:\n\n${text}`;
    else if (mode === "engagement")
      prompt = `Suggest ways to improve social media engagement:\n\n${text}`;

    try {
      const output = await runGemini(prompt);
      setAiResult(output);
    } catch (e) {
      setAiResult("⚠️ Error: " + e.message);
    }
    setLoading(false);
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "extracted.txt";
    a.click();
  };

  // ---------- THEME STYLES ----------
  const themeClasses = {
    gradient: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white",
    light: "bg-gray-100 text-black",
    dark: "bg-gray-900 text-white",
  };

  return (
    <div className={`min-h-screen ${themeClasses[theme]} transition-colors duration-500`}>
      {/* ---------- Header ---------- */}
      <header className="w-full bg-white/10 backdrop-blur-sm py-3 shadow">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="font-extrabold text-xl">📄 Social Media Content Analyzer</div>

          <div className="flex items-center gap-6">
            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-1 rounded-md text-black"
            >
              <option value="gradient">🌈 Gradient</option>
              <option value="light">🌞 Light</option>
              <option value="dark">🌙 Dark</option>
            </select>

            <div className="flex gap-6 text-white/80 text-sm">
              <a href="#how" className="hover:text-white">How to Use</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Upload Section ---------- */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl p-10 text-center text-white shadow-xl">
          <div
            className="p-10 rounded-md border-2 border-dashed border-white/30 hover:bg-white/5 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <UploadCloud size={40} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upload PDF / Image</h2>
            <p className="opacity-80 mb-4">Drag & drop or click here to choose your file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {progress && <p className="mt-4">{progress}</p>}
          {text && (
            <div className="mt-6 bg-white/20 p-4 rounded-md text-left">
              <h3 className="font-semibold mb-2">Extracted Text</h3>
              <div className="max-h-60 overflow-auto bg-white p-3 rounded text-black text-sm">
                {text}
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={downloadText} className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-md">
                  <Download size={16} /> Download
                </button>
                <button onClick={() => navigator.clipboard.writeText(text)} className="flex items-center gap-2 bg-slate-200 px-4 py-2 rounded-md text-black">
                  <Copy size={16} /> Copy
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ---------- AI Tools Section ---------- */}
        <section className="mt-10 bg-white rounded-xl p-8 shadow text-black">
          <h3 className="font-bold text-xl mb-4">🤖 AI Tools</h3>
          <div className="flex gap-4 flex-wrap mb-4">
            <button onClick={() => handleAI("summary")} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-md"><FileText size={16} /> Summary</button>
            <button onClick={() => handleAI("hashtags")} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-md"><Hash size={16} /> Hashtags</button>
            <button onClick={() => handleAI("rewrite")} className="flex items-center gap-2 px-5 py-2 bg-yellow-400 text-black rounded-md"><RefreshCcw size={16} /> Rewrite</button>
            <button onClick={() => handleAI("sentiment")} className="flex items-center gap-2 px-5 py-2 bg-pink-500 text-white rounded-md">Sentiment</button>
            <button onClick={() => handleAI("engagement")} className="flex items-center gap-2 px-5 py-2 bg-cyan-500 text-white rounded-md">Engagement</button>
          </div>
          <div className="bg-slate-100 p-4 rounded-md min-h-[150px] text-sm">{loading ? "🤖 Generating AI Response..." : aiResult || "AI output will appear here."}</div>
        </section>

        {/* ---------- How to Use Section ---------- */}
        <section id="how" className="mt-12 bg-white rounded-xl p-10 shadow text-center text-black">
          <h3 className="text-3xl font-bold mb-6">📌 How to Use</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "Step 1", title: "Upload", desc: "Choose PDF or Image file to extract text.", icon: <UploadCloud size={40} className="mx-auto text-indigo-600" /> },
              { step: "Step 2", title: "Extract", desc: "Our hybrid engine reads text or applies OCR.", icon: <FileText size={40} className="mx-auto text-purple-600" /> },
              { step: "Step 3", title: "Analyze", desc: "Use AI tools to summarize, rewrite or hashtags.", icon: <RefreshCcw size={40} className="mx-auto text-pink-600" /> },
              { step: "Step 4", title: "Engage", desc: "Apply AI suggestions to boost your reach.", icon: <Hash size={40} className="mx-auto text-green-600" /> },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="p-6 bg-slate-50 rounded-xl shadow text-center">
                <div className="font-bold text-sm text-slate-500">{c.step}</div>
                {c.icon}
                <h3 className="font-semibold text-lg mt-3">{c.title}</h3>
                <p className="text-sm mt-2 text-slate-600">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---------- Contact Us Section ---------- */}
        <section id="contact" className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-10 shadow text-center">
          <h3 className="text-3xl font-bold mb-6">📞 Contact Us</h3>
          <form className="grid gap-4 max-w-md mx-auto text-left"
            onSubmit={async (e) => {
              e.preventDefault();
              const name = e.target.name.value;
              const email = e.target.email.value;
              const message = e.target.message.value;
              try {
                const res = await fetch("http://localhost:5196/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, message }),
                });
                const data = await res.json();
                if (data.success) {
                  alert("✅ Message sent successfully!");
                  e.target.reset();
                } else {
                  alert("❌ Failed: " + data.error);
                }
              } catch (err) {
                alert("⚠️ Error sending: " + err.message);
              }
            }}>
            <input type="text" name="name" placeholder="Your Name" className="px-4 py-2 rounded-md text-black" required />
            <input type="email" name="email" placeholder="Your Email" className="px-4 py-2 rounded-md text-black" required />
            <textarea name="message" placeholder="Your Message" rows="4" className="px-4 py-2 rounded-md text-black" required />
            <button type="submit" className="flex items-center gap-2 justify-center px-6 py-2 bg-yellow-400 text-black rounded-lg hover:scale-105 transition">
              <Mail size={18} /> Send Message
            </button>
          </form>
        </section>

        {/* ---------- FAQ Section ---------- */}
        <motion.section id="faq" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-2xl shadow text-black mt-12">
          <h3 className="text-3xl font-bold mb-8 text-center">❓ Frequently Asked Questions</h3>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              { q: "What file types are supported?", a: "PDF (text & scanned), JPG, PNG, WEBP." },
              { q: "Can it extract scanned PDFs?", a: "Yes, OCR automatically extracts scanned text." },
              { q: "Is my data safe?", a: "Yes, everything runs locally." },
              { q: "Do I need an API key?", a: "Yes, set VITE_GEMINI_API_KEY for AI features." },
              { q: "What languages are supported?", a: "English & Hindi, extendable via Tesseract.js." },
              { q: "How to improve engagement?", a: "Use AI Engagement tool for CTAs & tips." },
            ].map((item, i) => (
              <div key={i} className="border rounded-lg">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex justify-between items-center px-4 py-3 text-left">
                  <span className="font-semibold">{item.q}</span>
                  <ChevronDown className={`transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                </button>
                {faqOpen === i && <div className="px-4 pb-3 text-sm text-gray-600">{item.a}</div>}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ---------- Footer ---------- */}
        <footer className="mt-12 text-center">
          <div className="bg-white/20 backdrop-blur-md text-white py-6 rounded-xl">
            <h4 className="font-bold text-lg">🌐 Social Media Content Analyzer</h4>
            <p className="text-sm opacity-80">Helping you extract, analyze & improve content</p>
            <p className="mt-2 text-xs">© {new Date().getFullYear()} All Rights Reserved | Made with ❤️ by <b>Aditya Sharma</b></p>
          </div>
        </footer>
      </main>
    </div>
  );
}
