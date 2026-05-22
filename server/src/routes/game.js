import { Router } from "express";
import { getGameHistory, getMovesFromGame } from "../models/gameModel.js";

const router = Router();

// Historial de partidas de un usuario
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await getGameHistory(userId);
        res.json(history);
    } catch (error) {
        console.error("Error en GET /games/history:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

// Movimientos de una partida específica
router.get("/:gameId/moves", async (req, res) => {
    try {
        const { gameId } = req.params;
        const moves = await getMovesFromGame(gameId);
        res.json(moves);
    } catch (error) {
        console.error("Error en GET /games/:gameId/moves:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

export default router;