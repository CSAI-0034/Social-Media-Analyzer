// server.js
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const API_URL = import.meta.env.VITE_BACKEND_URL;
const app = express();
app.use(cors());
app.use(express.json());

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // tumhara gmail
    pass: process.env.EMAIL_PASS,   // app password
  },
});

app.post("/api/contact", async (req, res) => {
  console.log("📩 Contact form hit:", req.body);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New message from ${req.body.name}`,
      text: `From: ${req.body.email}\n\n${req.body.message}`,
    });
    console.log("✅ Email sent!");
    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    return res.status(500).json({ success: false, error: "Email not sent" });
  }
});

app.listen(5196, () => {
  console.log("✅ Mail server running at http://localhost:5196");
});
