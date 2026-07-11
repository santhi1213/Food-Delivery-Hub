import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import deliveryWebhookRouter from "./routes/deliveryWebhooks";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// DEBUG: Log all requests
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// DEBUG: Log registered routes
app.use((req, res, next) => {
  console.log(`📋 Router stack:`, app._router?.stack?.map((r: any) => ({
    path: r.route?.path,
    methods: r.route?.methods
  })));
  next();
});

app.use("/api", router);
app.use("/api", deliveryWebhookRouter);

// DEBUG: Test route directly on app
app.get("/test", (req, res) => {
  res.json({ message: "App is working!" });
});

export default app;