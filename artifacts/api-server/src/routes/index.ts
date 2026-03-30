import { Router, type IRouter } from "express";
import healthRouter from "./health";
import a11yRouter from "./a11y";

const router: IRouter = Router();

router.use(healthRouter);
router.use(a11yRouter);

export default router;
