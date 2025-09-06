const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "16kb" }));

const port = parseInt(process.env.PORT || "8080", 10);

// Simple health check
app.get("/", (req, res) => {
  res.json({
    status: "Tailoring Shop Bot Running",
    timestamp: new Date().toISOString(),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
    uptime: Math.round(process.uptime()) + "s",
    message: "WhatsApp features available via webhook"
  });
});

// Simple webhook endpoint
app.post("/webhook/order-ready", (req, res) => {
  console.log("📞 Webhook received:", req.body);
  res.json({
    success: true,
    message: "Webhook received successfully",
    note: "WhatsApp functionality requires manual setup"
  });
});

// QR endpoint
app.get("/qr", (req, res) => {
  res.json({
    message: "QR code generation requires WhatsApp initialization",
    instructions: "This is a minimal version for Railway deployment"
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Railway-friendly signal handling
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received - Railway is managing shutdown");
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${port}`);
  console.log(`💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`🔗 Health: https://wtb-production.up.railway.app/`);
  console.log(`📨 Webhook: https://wtb-production.up.railway.app/webhook/order-ready`);
});
