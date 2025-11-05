import { Router } from "express";
import authRoutes from "./../modules/user/presentation/auth.routes";
import preferencesRoutes from "./../modules/user/presentation/preferences.routes";

const router = Router();

router.use("/users", authRoutes);
router.use("/users", preferencesRoutes);

export default router;