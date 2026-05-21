import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos." });
    }

    const [rows] = await pool.query(
      "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no existe." });
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

    return res.json({
      message: "Login exitoso.",
      user: {
        id: user.id,
        username: user.username,
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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Usuario, correo y contraseña son requeridos." });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "El usuario o correo ya existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    return res.status(201).json({
      message: "Registro exitoso.",
      user: { id: result.insertId, username, email },
    });
  } catch (error) {
    console.error("Error en /register:", error);
    return res.status(500).json({ error: "Error del servidor." });
  }
});

export default router;
