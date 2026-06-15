// Método del peón
// El peón se mueve un paso, pero al inicio puede moverse dos
// Solo puede comer piezas en diagonal
export function getPawnMoves(board, row, col, color) {

    const moves = [];

    // Blancas suben (row - 1), negras bajan (row + 1)
    const direction = color === "white" ? -1 : 1;

    // Fila inicial según color
    const startRow = color === "white" ? 6 : 1;

    const nextRow = row + direction;

    // Verificamos que nextRow esté dentro del tablero
    if (nextRow < 0 || nextRow >= 8) {
        return moves;
    }

    // Avance de 1 casilla
    if (board[nextRow][col] === null) {

        moves.push({ row: nextRow, col });

        // Avance inicial de 2 casillas
        const twoRow = row + direction * 2;

        if (
            row === startRow &&
            twoRow >= 0 && twoRow < 8 &&
            board[twoRow][col] === null
        ) {
            moves.push({ row: twoRow, col });
        }
    }

    // Captura diagonal izquierda
    if (
        col - 1 >= 0 &&
        board[nextRow][col - 1] &&
        board[nextRow][col - 1].color !== color
    ) {
        moves.push({ row: nextRow, col: col - 1 });
    }

    // Captura diagonal derecha
    if (
        col + 1 < 8 &&
        board[nextRow][col + 1] &&
        board[nextRow][col + 1].color !== color
    ) {
        moves.push({ row: nextRow, col: col + 1 });
    }

    return moves;
}