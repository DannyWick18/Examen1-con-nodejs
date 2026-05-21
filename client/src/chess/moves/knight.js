// El caballo se mueve en "L"

export function getKnightMoves(board, row, col, color) {

    const moves = [];

    // Movimientos posibles del caballo
    const knightMoves = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    for(const move of knightMoves) {

        const newRow = row + move[0];
        const newCol = col + move[1];

        // Verificamos límites del tablero
        if(
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8
        ) {

            const piece = board[newRow][newCol];

            // Casilla vacía o pieza enemiga
            if(!piece || piece.color !== color) {

                moves.push({
                    row: newRow,
                    col: newCol
                });
            }
        }
    }

    return moves;
}