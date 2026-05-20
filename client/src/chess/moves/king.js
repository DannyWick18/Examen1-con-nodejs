//El rey es similar a la dama, pero se mueve unicamente una casilla

export function getKingMoves(board, row, col, color) {

    const moves = [];

    const directions = [

        [-1, -1],
        [-1, 0],
        [-1, 1],

        [0, -1],
        [0, 1],

        [1, -1],
        [1, 0],
        [1, 1]
    ];

    directions.forEach(([rowDirection, colDirection]) => {

        const newRow =
            row + rowDirection;

        const newCol =
            col + colDirection;

        // límites tablero
        if(
            newRow < 0 ||
            newRow >= 8 ||

            newCol < 0 ||
            newCol >= 8
        ) {

            return;
        }

        const target =
            board[newRow][newCol];

        // Casilla vacía o enemiga
        if(
            !target ||
            target.color !== color
        ) {

            moves.push({
                row: newRow,
                col: newCol
            });
        }
    });

    return moves;
}