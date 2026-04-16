import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" }));

// API роуты
app.use(authRoutes);

// Health check для Render
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "smart-dashboard-backend"
  });
});

// ❌ УДАЛИТЬ этот блок — он вызывает ошибку path-to-regexp:
// app.get("/:path*", (req, res) => {
//   res.status(404).json({ error: "Not found" });
// });

// ✅ Вместо этого — просто обработчик 404 через app.use():
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Запуск
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Auth server running on port ${PORT}`);
});