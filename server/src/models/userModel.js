import pool from "../db.js";
 
// Buscar usuario por email (usado en login)
export async function findUserByEmail(email) {
    const [rows] = await pool.query(
        "SELECT id, email, password FROM users WHERE email = ?",
        [email]
    );
    return rows[0];
}
 
// Creamos usuario nuevo (usado en register)
export async function createUser(email, hashedPassword) {
    const [result] = await pool.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword]
    );
    return result.insertId;
}
 
// Verificamos si un email ya existe (usado en register)
export async function emailExists(email) {
    const [rows] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );
    return rows.length > 0;
}
