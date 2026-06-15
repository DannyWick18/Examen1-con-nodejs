import { Router } from "express";
import { getRanking, getUserRanking } from "../models/rankingModel.js";

const router = Router();

// Hacemos un GET para obtener los resultados del ranking general
router.get("/", async (req, res) => {
    try {
        const ranking = await getRanking();
        res.json(ranking);
    } catch (error) {
        console.error("Error en GET /ranking:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

// Acá es un get para los resultados de un usuario específico, para mostrarlo en su perfil
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await getUserRanking(userId);
        res.json(stats);
    } catch (error) {
        console.error("Error en GET /ranking/:userId:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

export default router;