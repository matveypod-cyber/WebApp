import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS — используем только cors(), ручные заголовки не нужны
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" }));

// Авторизация: /api/register, /api/login
app.use("/api", authRoutes);

// Health check для Render
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all для 404 (опционально)
app.get("/*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Auth server running on port ${PORT}`);
});