import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/db";
import { initSocket } from "./lib/socket";

const port = Number(process.env["PORT"] ?? 5000);

const httpServer = http.createServer(app);
initSocket(httpServer);

connectDB().then(() => {
  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
});
