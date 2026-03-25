import { Router, type IRouter } from "express";
import healthRouter from "./health";
import consentRouter from "./consent";

const router: IRouter = Router();

router.use(healthRouter);
router.use(consentRouter);

export default router;
