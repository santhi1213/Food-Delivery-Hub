import http from "http";
import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/db";
import { initSocket } from "./lib/socket";

const port = Number(process.env["PORT"] ?? 5000);

const httpServer = http.createServer(app);

// Initialize Socket.IO FIRST
const io = initSocket(httpServer);
console.log("✅ Socket.IO initialized");

// Store io on app for routes
app.set("io", io);

// Make io globally available
(global as any).io = io;

connectDB().then(() => {
  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening with Socket.IO");
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🔌 Socket.IO path: /api/socket.io`);
  });
}).catch((err) => {
  logger.error({ err }, "Failed to connect to database");
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, closing server...");
  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, closing server...");
  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});