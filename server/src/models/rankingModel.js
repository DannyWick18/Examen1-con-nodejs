import pool from "../db.js";

// Ranking general ordenado por puntos de mayor a menor
export async function getRanking() {
    const [rows] = await pool.query(
        `SELECT
            u.email,
            r.points,
            r.wins,
            r.losses,
            r.draws
         FROM rankings r
         JOIN users u ON r.user_id = u.id
         ORDER BY r.points DESC`
    );
    return rows;
}

// Ranking de un usuario específico
export async function getUserRanking(userId) {
    const [rows] = await pool.query(
        `SELECT
            u.email,
            r.points,
            r.wins,
            r.losses,
            r.draws
         FROM rankings r
         JOIN users u ON r.user_id = u.id
         WHERE r.user_id = ?`,
        [userId]
    );
    // Si el usuario no tiene partidas aún, entonces lo que se muestra son ceros
    return rows[0] || {
        points: 0,
        wins:   0,
        losses: 0,
        draws:  0
    };
}