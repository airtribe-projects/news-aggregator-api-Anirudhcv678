import { Router } from "express";
import authRoutes from "./../modules/user/presentation/auth.routes";
import preferencesRoutes from "./../modules/user/presentation/preferences.routes";
import newsRoutes from "./../modules/news/presentation/news.routes";

const router = Router();

router.use("/users", authRoutes);
router.use("/users", preferencesRoutes);
router.use("/news", newsRoutes);

export default router;