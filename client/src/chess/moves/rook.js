// Método para la torre
// La torre solo se puede mover en horizontal o vertical

export function getRookMoves(board, row, col, color) {

    const moves = [];

    // Empezamos con los movimientos verticales arriba
    // For hasta que se encuentre con una pieza aliada
    for(let i = row - 1; i >= 0; i--) {

        // Variable para verificar que hay en la casilla delante
        // i es una variable que cambia
        const piece = board[i][col];

        // Si está vacía, se mueve
        if(piece === null) {

            moves.push({
                row: i,
                col: col
            });
        } else {
            // Si se encuentra con pieza enemiga, la atrapa
            if(piece.color !== color) {

                moves.push({
                    row: i,
                    col: col
                });
            }
            // Detenemos el recorrido en caso de que se encuentre con una pieza aliada
            break;
        }
    }

    // Movimiento vertical abajo
    for(let i = row + 1; i < 8; i++) {

        const piece = board[i][col];

        if(piece === null) {

            moves.push({
                row: i,
                col: col
            });
        } else {
            if(piece.color !== color) {

                moves.push({
                    row: i,
                    col: col
                });
            }
            break;
        }
    }

    // Movimiento horizontal izquierda
    for(let i = col - 1; i >= 0; i--) {

        const piece = board[row][i];

        if(piece === null) {

            moves.push({
                row: row,
                col: i
            });

        } else {

            if(piece.color !== color) {

                moves.push({
                    row: row,
                    col: i
                });
            }

            break;
        }
    }

    // Movimiento horizontal derecha
    for(let i = col + 1; i < 8; i++) {

        const piece = board[row][i];

        if(piece === null) {
            moves.push({
                row: row,
                col: i
            });
        } else {
            if(piece.color !== color) {

                moves.push({
                    row: row,
                    col: i
                });
            }
            break;
        }
    }
    return moves;
}