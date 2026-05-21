// El alfil se puede mover hacia donde sea pero unicamente en diagonal

export function getBishopMoves(board, row, col, color) {

    const moves = [];

    // ARRIBA IZQUIERDA
    for(let i = 1; row - i >= 0 && col - i >= 0; i++) {

        const piece = board[row - i][col - i];

        if(piece === null) {

            moves.push({
                row: row - i,
                col: col - i
            });

        } else {

            if(piece.color !== color) {

                moves.push({
                    row: row - i,
                    col: col - i
                });
            }

            break;
        }
    }

    // ARRIBA DERECHA
    for(let i = 1; row - i >= 0 && col + i < 8; i++) {

        const piece = board[row - i][col + i];

        if(piece === null) {

            moves.push({
                row: row - i,
                col: col + i
            });

        } else {

            if(piece.color !== color) {

                moves.push({
                    row: row - i,
                    col: col + i
                });
            }

            break;
        }
    }

    // ABAJO IZQUIERDA
    for(let i = 1; row + i < 8 && col - i >= 0; i++) {

        const piece = board[row + i][col - i];

        if(piece === null) {

            moves.push({
                row: row + i,
                col: col - i
            });

        } else {

            if(piece.color !== color) {

                moves.push({
                    row: row + i,
                    col: col - i
                });
            }

            break;
        }
    }

    // ABAJO DERECHA
    for(let i = 1; row + i < 8 && col + i < 8; i++) {

        const piece = board[row + i][col + i];

        if(piece === null) {

            moves.push({
                row: row + i,
                col: col + i
            });

        } else {

            if(piece.color !== color) {

                moves.push({
                    row: row + i,
                    col: col + i
                });
            }

            break;
        }
    }

    return moves;
}