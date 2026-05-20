import jwt from "jsonwebtoken";

import { pool } from "../config/db.js";

export const protect = async (req, res, next) => {

    try {

        const token = req.cookies.token;

        if (!token) {

            return res.status(401).json({
                message: "No autorizado"
            });
        }

        // VALIDAR TOKEN
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // BUSCAR USUARIO
        const [users] = await pool.query(
            `
            SELECT
                id,
                username,
                email
            FROM users
            WHERE id = ?
            `,
            [decoded.id]
        );

        if (users.length === 0) {

            return res.status(401).json({
                message: "Usuario no encontrado"
            });
        }

        req.user = users[0];

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token inválido"
        });
    }
};