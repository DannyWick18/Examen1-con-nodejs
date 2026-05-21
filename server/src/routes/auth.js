import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos." });
    }

    const [rows] = await pool.query(
      "SELECT id, email, password FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "El email no existe." });
    }

    const user = rows[0];
    let passwordMatch = false;

    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      passwordMatch = false;
    }

    if (!passwordMatch && password !== user.password) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "tu_secreto_aqui",
      { expiresIn: "24h" }
    );

    return res.json({
      message: "Login exitoso.",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en /login:", error);
    return res.status(500).json({ error: "Error del servidor." });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos." });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    return res.status(201).json({
      message: "Registro exitoso.",
      user: { id: result.insertId, email },
    });
  } catch (error) {
    console.error("Error en /register:", error);
    return res.status(500).json({ error: "Error del servidor." });
  }
});

export default router;
