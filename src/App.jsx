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
    <header className="w-full bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="font-extrabold text-2xl">📄 Social Media Content Analyzer</div>

        <div className="flex items-center gap-6">
          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-1 rounded-md bg-white text-black font-semibold"
          >
            <option value="gradient">🌈 Gradient</option>
            <option value="light">🌞 Light</option>
            <option value="dark">🌙 Dark</option>
          </select>

          <div className="flex gap-6 text-white/90 font-medium text-sm">
            <a href="#how" className="hover:text-yellow-300 transition">How to Use</a>
            <a href="#faq" className="hover:text-yellow-300 transition">FAQ</a>
          </div>
        </div>
      </div>
    </header>

    {/* ---------- Main Content ---------- */}
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">

      {/* ---------- Upload Section ---------- */}
      <section className="bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-700 rounded-2xl p-12 text-center text-white shadow-2xl">
        <div
          className="p-12 rounded-2xl border-4 border-dashed border-white/30 hover:bg-white/10 cursor-pointer transition"
          onClick={() => fileInputRef.current.click()}
        >
          <UploadCloud size={48} className="mx-auto mb-5" />
          <h2 className="text-3xl font-bold mb-3">Upload PDF / Image</h2>
          <p className="opacity-80 mb-4 text-lg">Drag & drop or click here to choose your file</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {progress && <p className="mt-5 font-semibold text-lg">{progress}</p>}

        {text && (
          <div className="mt-8 bg-white/20 backdrop-blur-md p-6 rounded-2xl text-left shadow-lg">
            <h3 className="font-semibold text-xl mb-3">Extracted Text</h3>
            <div className="max-h-64 overflow-auto bg-white p-4 rounded-lg text-black text-sm shadow-inner">{text}</div>
            <div className="flex gap-4 mt-4">
              <button onClick={downloadText} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                <Download size={16} /> Download
              </button>
              <button onClick={() => navigator.clipboard.writeText(text)} className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition text-black">
                <Copy size={16} /> Copy
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ---------- AI Tools Section ---------- */}
      <section className="bg-white/10 backdrop-blur-md rounded-2xl p-10 shadow-xl text-black">
        <h3 className="text-2xl font-bold mb-6">🤖 AI Tools</h3>
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <button onClick={() => handleAI("summary")} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"><FileText size={16} /> Summary</button>
          <button onClick={() => handleAI("hashtags")} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"><Hash size={16} /> Hashtags</button>
          <button onClick={() => handleAI("rewrite")} className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition"><RefreshCcw size={16} /> Rewrite</button>
          <button onClick={() => handleAI("sentiment")} className="flex items-center gap-2 px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition">Sentiment</button>
          <button onClick={() => handleAI("engagement")} className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition">Engagement</button>
        </div>
        <div className="bg-white/30 backdrop-blur-sm p-6 rounded-2xl min-h-[150px] text-sm shadow-inner">{loading ? "🤖 Generating AI Response..." : aiResult || "AI output will appear here."}</div>
      </section>
      {/* ---------- How to Use Section ---------- */}
      <section id="how" className="bg-gradient-to-r from-rose-50 to-yellow-50 rounded-3xl p-12 shadow-2xl text-center">
      <h3 className="text-3xl font-extrabold mb-10 text-rose-600">🚀 Get Started in 4 Easy Steps</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { step: "1", title: "Upload Files", desc: "Select your PDFs or images to extract content seamlessly.", icon: <UploadCloud size={48} className="mx-auto text-rose-500" /> },
        { step: "2", title: "Automatic Extraction", desc: "Our smart engine reads text or uses OCR for scanned files.", icon: <FileText size={48} className="mx-auto text-yellow-500" /> },
        { step: "3", title: "AI-Powered Analysis", desc: "Leverage AI tools to summarize, generate hashtags, or rewrite content.", icon: <RefreshCcw size={48} className="mx-auto text-green-500" /> },
        { step: "4", title: "Boost Engagement", desc: "Apply AI suggestions to make your posts more engaging and reach wider audience.", icon: <Hash size={48} className="mx-auto text-blue-500" /> },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.15 }}
          className="p-8 bg-white/70 hover:bg-white/90 hover:scale-105 transition-transform rounded-3xl shadow-lg flex flex-col items-center text-center"
        >
          <div className="text-sm font-semibold text-gray-500 mb-2">{`Step ${item.step}`}</div>
          {item.icon}
          <h4 className="font-bold text-lg mt-4 text-gray-800">{item.title}</h4>
          <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
        </motion.div>
      ))}
    </div>
    </section>

      {/* ---------- FAQ Section ---------- */}
      <motion.section id="faq" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white/20 backdrop-blur-md p-10 rounded-2xl shadow-xl text-black">
        <h3 className="text-3xl font-bold mb-8 text-center">❓ FAQs</h3>
        <div className="space-y-4 max-w-3xl mx-auto">
          {[
              { q: "Can I upload multiple files at once?", a: "Yes, you can upload multiple PDFs or images for batch processing." },
              { q: "Does it recognize handwriting in PDFs or images?", a: "Yes, our OCR can detect handwritten text, though clarity affects accuracy." },
              { q: "Are my uploaded files stored online?", a: "No, all files are processed locally and not uploaded anywhere." },
              { q: "Can I use AI features without signing up?", a: "Yes, just set your VITE_GEMINI_API_KEY in your environment to access AI tools." },
              { q: "Does it support languages other than English?", a: "Currently English and Hindi are supported, more can be added with Tesseract.js." },
              { q: "How can I make my posts more engaging?", a: "Use AI tools like hashtags, summary, and sentiment analysis to optimize your content." }
          ].map((item, i) => (
            <div key={i} className="border rounded-lg bg-white/10 backdrop-blur-sm">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex justify-between items-center px-4 py-3 text-left font-medium">
                <span>{item.q}</span>
                <ChevronDown className={`transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
              </button>
              {faqOpen === i && <div className="px-4 pb-3 text-sm text-gray-700">{item.a}</div>}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ---------- Footer ---------- */}
      <footer className="text-center mt-12">
        <div className="bg-white/20 backdrop-blur-md text-white py-6 rounded-2xl shadow-lg">
          <h4 className="font-bold text-lg">🌐 Social Media Content Analyzer</h4>
          <p className="text-sm opacity-80">Helping you extract, analyze & improve content</p>
          <p className="mt-2 text-xs">© {new Date().getFullYear()} All Rights Reserved | Made with ❤️ by <b>Anubhav Tripathi</b></p>
        </div>
      </footer>
    </main>
  </div>
);
}
