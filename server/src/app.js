import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
// DB NUEVO
import gameRoutes    from "./routes/game.js";
import rankingRoutes from "./routes/ranking.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes); // POST
// DB NUEVO
app.use("/api/games",   gameRoutes);     // GET  
app.use("/api/ranking", rankingRoutes);  // GET  


export default app;