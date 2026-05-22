import pool from "../db.js";

// Creamos partida cuando dos jugadores se unen a una sala
// Retornamos el gameId para guardarlo en la sala del socket
export async function createGame(whitePlayerId, blackPlayerId) {
    const [result] = await pool.query(
        `INSERT INTO games
            (white_player_id, black_player_id, status)
         VALUES (?, ?, 'playing')`,
        [whitePlayerId, blackPlayerId]
    );
    return result.insertId;
}

// Guardamos cada movimiento durante la partida
// fromSquare y toSquare vienen como fila y columna
export async function saveMove(gameId, playerId, fromSquare, toSquare, piece) {
    await pool.query(
        `INSERT INTO moves
            (game_id, player_id, from_square, to_square, piece)
         VALUES (?, ?, ?, ?, ?)`,
        [gameId, playerId, fromSquare, toSquare, piece]
    );
}

// Finaliza la partida y actualiza ranking automáticamente
export async function finishGame(gameId, winnerId) {

    // Marcamos la partida como terminada con su ganador
    await pool.query(
        `UPDATE games
         SET status = 'finished', winner_id = ?
         WHERE id = ?`,
        [winnerId, gameId]
    );

    // Se obtienen ambos jugadores para saber quién perdió
    const [rows] = await pool.query(
        "SELECT white_player_id, black_player_id FROM games WHERE id = ?",
        [gameId]
    );

    if (rows.length === 0) return;

    const { white_player_id, black_player_id } = rows[0];
    const loserId = String(winnerId) === String(white_player_id)
        ? black_player_id
        : white_player_id;

    // Ganador: +3 puntos y +1 victoria
    await pool.query(
        `INSERT INTO rankings (user_id, points, wins)
             VALUES (?, 3, 1)
         ON DUPLICATE KEY UPDATE
             points = points + 3,
             wins   = wins + 1`,
        [winnerId]
    );

    // Perdedor: +1 derrota, sin puntos
    await pool.query(
        `INSERT INTO rankings (user_id, points, losses)
             VALUES (?, 0, 1)
         ON DUPLICATE KEY UPDATE
             losses = losses + 1`,
        [loserId]
    );
}

// Historial de partidas de un usuario específico
export async function getGameHistory(userId) {
    const [rows] = await pool.query(
        `SELECT
            g.id,
            g.status,
            g.winner_id,
            u1.email AS white_player,
            u2.email AS black_player
         FROM games g
         JOIN users u1 ON g.white_player_id = u1.id
         JOIN users u2 ON g.black_player_id = u2.id
         WHERE g.white_player_id = ? OR g.black_player_id = ?
         ORDER BY g.id DESC`,
        [userId, userId]
    );
    return rows;
}

// Movimientos de una partida específica
export async function getMovesFromGame(gameId) {
    const [rows] = await pool.query(
        `SELECT
            m.from_square,
            m.to_square,
            m.piece,
            u.email AS player
         FROM moves m
         JOIN users u ON m.player_id = u.id
         WHERE m.game_id = ?
         ORDER BY m.id ASC`,
        [gameId]
    );
    return rows;
}