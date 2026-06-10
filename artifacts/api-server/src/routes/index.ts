import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import restaurantsRouter from "./restaurants";
import ordersRouter from "./orders";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/restaurants", restaurantsRouter);
router.use("/orders", ordersRouter);
router.use("/seed", seedRouter);

export default router;
