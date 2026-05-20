import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";


dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

//Socket.oi
const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));


// ROUTES
app.use("/api/auth", authRoutes);

export default app;