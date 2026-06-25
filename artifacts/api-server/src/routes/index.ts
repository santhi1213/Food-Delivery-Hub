import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import restaurantsRouter from "./restaurants";
import ordersRouter from "./orders";
import seedRouter from "./seed";

const router: IRouter = Router();

// Debug: Log when routes are registered
console.log("🔧 Registering routes...");

router.use(healthRouter);
console.log("✅ Health routes registered");

router.use("/auth", authRouter);
console.log("✅ Auth routes registered");

router.use("/restaurants", restaurantsRouter);
console.log("✅ Restaurants routes registered");

router.use("/orders", ordersRouter);
console.log("✅ Orders routes registered");

router.use("/seed", seedRouter);
console.log("✅ Seed routes registered");

// Debug route to test if router is working
router.get("/test", (req, res) => {
  res.json({ 
    message: "API router is working!",
    timestamp: new Date().toISOString()
  });
});

console.log("✅ All routes registered");

export default router;