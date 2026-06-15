//La reina es una combinación de la torre y el alfil (porque se mueve a todo lado)
// Asi solo importamos sus movimientos

import { getRookMoves } from "./rook";
import { getBishopMoves } from "./bishop";

export function getQueenMoves(board, row, col, color) {

    const rookMoves = getRookMoves(board, row, col, color);

    const bishopMoves = getBishopMoves(board, row, col, color);

    return [
        ...rookMoves,
        ...bishopMoves
    ];
}