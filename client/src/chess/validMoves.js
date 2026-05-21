import { getPawnMoves } from "./moves/pawn";
import { getRookMoves } from "./moves/rook";
import { getBishopMoves } from "./moves/bishop";
import { getQueenMoves } from "./moves/queen";
import { getKnightMoves } from "./moves/knight";
import { getKingMoves } from "./moves/king";
//Importamos todos lo movimientos
//Hacemos cases para contemplar los movimientos de todas las piezas

export function getValidMoves(piece, board, row, col) {

    switch(piece.type) {

        case "pawn":
            return getPawnMoves(
                board,
                row,
                col,
                piece.color
            );

        case "rook":
            return getRookMoves(
                board,
                row,
                col,
                piece.color
            );

        case "bishop":
            return getBishopMoves(
                board,
                row,
                col,
                piece.color
            );

        case "queen":
            return getQueenMoves(
                board,
                row,
                col,
                piece.color
            );

        case "knight":
            return getKnightMoves(
                board,
                row,
                col,
                piece.color
            );

        case "king":
            return getKingMoves(
                board,
                row,
                col,
                piece.color
            );

        default:
            return [];
    }
}