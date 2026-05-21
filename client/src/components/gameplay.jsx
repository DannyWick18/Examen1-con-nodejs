import { useState } from "react";

// Importamos tablero inicial
import { initialBoard } from "../chess/board";

// Importamos movimientos geométricos
import { getValidMoves } from "../chess/validMoves";

function Board() {

    // Estado principal del tablero
    const [board, setBoard] =
        useState(initialBoard);

    // Pieza seleccionada
    const [selectedPiece, setSelectedPiece] =
        useState(null);

    // Movimientos válidos visuales
    const [validMoves, setValidMoves] =
        useState([]);

    // Turno actual
    const [currentTurn, setCurrentTurn] =
        useState("white");

    // Estado final del juego
    const [gameOver, setGameOver] =
        useState(false);

    // Mensaje de estado (jaque, jaque mate, etc.)
    const [statusMessage, setStatusMessage] =
        useState("");

    // Buscamos al rey de un color específico
    function findKing(boardState, color) {

        for (let row = 0; row < 8; row++) {

            for (let col = 0; col < 8; col++) {

                const piece = boardState[row][col];

                if (
                    piece &&
                    piece.type === "king" &&
                    piece.color === color
                ) {
                    return { row, col };
                }
            }
        }

        return null;
    }

    // Devuelve las casillas en peligro por una pieza
    function getAttackSquares(piece, boardState, row, col) {

        const attacks = [];

        // PEÓN — solo ataca en diagonal
        if (piece.type === "pawn") {

            const direction = piece.color === "white" ? -1 : 1;

            const possibleAttacks = [
                { row: row + direction, col: col - 1 },
                { row: row + direction, col: col + 1 },
            ];

            possibleAttacks.forEach((move) => {
                if (
                    move.row >= 0 && move.row < 8 &&
                    move.col >= 0 && move.col < 8
                ) {
                    attacks.push(move);
                }
            });

            return attacks;
        }

        // CABALLO
        if (piece.type === "knight") {

            const knightMoves = [
                [-2, -1], [-2, 1],
                [-1, -2], [-1, 2],
                [1, -2],  [1, 2],
                [2, -1],  [2, 1],
            ];

            knightMoves.forEach(([dr, dc]) => {

                const newRow = row + dr;
                const newCol = col + dc;

                if (
                    newRow >= 0 && newRow < 8 &&
                    newCol >= 0 && newCol < 8
                ) {
                    attacks.push({ row: newRow, col: newCol });
                }
            });

            return attacks;
        }

        // REY es una casilla en todas las direcciones
        if (piece.type === "king") {

            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1],
            ];

            directions.forEach(([dr, dc]) => {

                const newRow = row + dr;
                const newCol = col + dc;

                if (
                    newRow >= 0 && newRow < 8 &&
                    newCol >= 0 && newCol < 8
                ) {
                    attacks.push({ row: newRow, col: newCol });
                }
            });

            return attacks;
        }

        // PIEZAS DESLIZANTES: Torre / Alfil / Reina
        const directions = [];

        if (piece.type === "rook" || piece.type === "queen") {
            directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }

        if (piece.type === "bishop" || piece.type === "queen") {
            directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }

        directions.forEach(([dr, dc]) => {

            for (let i = 1; i < 8; i++) {

                const newRow = row + dr * i;
                const newCol = col + dc * i;

                if (
                    newRow < 0 || newRow >= 8 ||
                    newCol < 0 || newCol >= 8
                ) {
                    break;
                }

                attacks.push({ row: newRow, col: newCol });

                // Se detiene al encontrar cualquier pieza (bloquea el rayo)
                if (boardState[newRow][newCol]) {
                    break;
                }
            }
        });

        return attacks;
    }

    // Verificamos si el rey de un color está en jaque
    function isKingInCheck(boardState, kingColor) {

        const kingPosition = findKing(boardState, kingColor);

        if (!kingPosition) return false;

        const enemyColor = kingColor === "white" ? "black" : "white";

        for (let row = 0; row < 8; row++) {

            for (let col = 0; col < 8; col++) {

                const piece = boardState[row][col];

                if (piece && piece.color === enemyColor) {

                    const attacks = getAttackSquares(
                        piece, boardState, row, col
                    );

                    const attacksKing = attacks.some(
                        (move) =>
                            move.row === kingPosition.row &&
                            move.col === kingPosition.col
                    );

                    if (attacksKing) return true;
                }
            }
        }

        return false;
    }

    // Simulamos un movimiento y verificamos si deja al rey en jaque
    function wouldLeaveKingInCheck(
        boardState,
        fromRow, fromCol,
        toRow, toCol,
        color
    ) {

        // Creamos copia superficial por filas
        const testBoard = boardState.map((row) => [...row]);

        testBoard[toRow][toCol] = testBoard[fromRow][fromCol];
        testBoard[fromRow][fromCol] = null;

        return isKingInCheck(testBoard, color);
    }

    // Obtenemos los movimientos LEGALES de una pieza:
    function getLegalMoves(piece, boardState, row, col) {

        const geometricMoves = getValidMoves(
            piece, boardState, row, col
        );

        return geometricMoves.filter(
            (move) =>
                !wouldLeaveKingInCheck(
                    boardState,
                    row, col,
                    move.row, move.col,
                    piece.color
                )
        );
    }

    // Se revisa si hay jaque mate: el rey está en jaque y 
    // no existe ningún movimiento legal que lo salve.
    function isCheckmate(boardState, color) {

        // Sin jaque no hay mate
        if (!isKingInCheck(boardState, color)) return false;

        for (let row = 0; row < 8; row++) {

            for (let col = 0; col < 8; col++) {

                const piece = boardState[row][col];

                if (piece && piece.color === color) {

                    const legalMoves = getLegalMoves(
                        piece, boardState, row, col
                    );

                    // Si encuentra aunque sea un movimiento legal
                    // que saque al rey del jaque, no es mate
                    if (legalMoves.length > 0) return false;
                }
            }
        }

        // Ninguna pieza tiene movimientos legales: es mate
        return true;
    }

    // Revisamos si no está en jaque pero tampoco tiene movimientos
    function isStalemate(boardState, color) {

        if (isKingInCheck(boardState, color)) return false;

        for (let row = 0; row < 8; row++) {

            for (let col = 0; col < 8; col++) {

                const piece = boardState[row][col];

                if (piece && piece.color === color) {

                    const legalMoves = getLegalMoves(
                        piece, boardState, row, col
                    );

                    if (legalMoves.length > 0) return false;
                }
            }
        }

        return true;
    }

    // Ejecutamos el movimiento de la piezas
    function movePiece(toRow, toCol) {

        const newBoard = board.map((row) => [...row]);

        // Movemos la pieza a destino
        newBoard[toRow][toCol] = selectedPiece.piece;

        // Limpiamos la casilla de origen
        newBoard[selectedPiece.row][selectedPiece.col] = null;

        // Reiniciamos selección y movimientos
        setSelectedPiece(null);
        setValidMoves([]);

        // Actualizamos el tablero
        setBoard(newBoard);

        const opponent =
            currentTurn === "white" ? "black" : "white";

        // Evaluamos estado constantemente si hay o no jaque
        if (isCheckmate(newBoard, opponent)) {

            const winner =
                currentTurn === "white" ? "Blancas" : "Negras";

            setStatusMessage(
                `¡Jaque mate! Ganan las ${winner}.`
            );
            setGameOver(true);
            return;
        }

        if (isStalemate(newBoard, opponent)) {

            setStatusMessage("¡Ahogado! Empate.");
            setGameOver(true);
            return;
        }

        if (isKingInCheck(newBoard, opponent)) {

            const opponentName =
                opponent === "white" ? "Blanco" : "Negro";

            setStatusMessage(
                `¡Jaque al Rey ${opponentName}!`
            );

        } else {

            setStatusMessage("");
        }

        // Cambiamos el turno
        setCurrentTurn(opponent);
    }

    // Evento de clicks por casilla
    function handleSquareClick(row, col) {
        if (gameOver) return;

        const piece = board[row][col];

        // VERIFICAMOS si es valido
        const clickedValidMove = validMoves.some(
            (move) => move.row === row && move.col === col
        );

        // Ejecutamos movimiento
        if (clickedValidMove && selectedPiece) {
            movePiece(row, col);
            return;
        }

        // Una vez la casilla esta vacia, quitamos la seleccion
        if (!piece) {
            setSelectedPiece(null);
            setValidMoves([]);
            return;
        }

        // Pieza del enemigo la ignoramos
        if (piece.color !== currentTurn) return;

        // Seleccionamos la pieza y calculamos movimientos legales
        setSelectedPiece({ piece, row, col });

        const legalMoves = getLegalMoves(piece, board, row, col);
        
        setValidMoves(legalMoves);
    }

    // Reinicia la partida si hay jaque mate
    function resetGame() {
        setBoard(initialBoard);
        setSelectedPiece(null);
        setValidMoves([]);
        setCurrentTurn("white");
        setGameOver(false);
        setStatusMessage("");
    }

    // Piezas de ajedrez en unicode 
    function getPieceSymbol(piece) {

        const symbols = {
            white: {
                king:   "♔",
                queen:  "♕",
                rook:   "♖",
                bishop: "♗",
                knight: "♘",
                pawn:   "♙",
            },
            black: {
                king:   "♚",
                queen:  "♛",
                rook:   "♜",
                bishop: "♝",
                knight: "♞",
                pawn:   "♟",
            },
        };

        return symbols[piece.color][piece.type];
    }

    // Diseño del tablero
    return (

        <div className="game-container">

            <div className="game-info">
                <span className="turn-indicator">
                    Turno:{" "}
                    {currentTurn === "white" ? "Blancas ♔" : "Negras ♚"}
                </span>

                {statusMessage && (
                    <span className="status-message">
                        {statusMessage}
                    </span>
                )}

                {gameOver && (
                    <button
                        className="reset-button"
                        onClick={resetGame}
                    >
                        Nueva partida
                    </button>
                )}
            </div>

            <div className="board">

                {board.map((row, rowIndex) =>

                    row.map((square, colIndex) => {

                        const isValidMove = validMoves.some(
                            (move) =>
                                move.row === rowIndex &&
                                move.col === colIndex
                        );

                        const isSelected =
                            selectedPiece &&
                            selectedPiece.row === rowIndex &&
                            selectedPiece.col === colIndex;

                        const isBlack =
                            (rowIndex + colIndex) % 2 === 1;

                        // Resaltamos el rey si está en jaque
                        const isKingInCheckSquare =
                            square &&
                            square.type === "king" &&
                            isKingInCheck(board, square.color);

                        return (

                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={[
                                    "square",
                                    isBlack ? "black" : "white",
                                    isValidMove ? "valid-move" : "",
                                    isSelected ? "selected" : "",
                                    isKingInCheckSquare ? "in-check" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() =>
                                    handleSquareClick(rowIndex, colIndex)
                                }
                            >
                                {/*Numero de filas y columnas*/}
                                <div className="coordinate">
                                {
                                rowIndex === 7 &&
                                String.fromCharCode(97 + colIndex)
                                }

                                {
                                    colIndex === 0 &&
                                    8 - rowIndex
                                }
                                </div>
                                {square && getPieceSymbol(square)}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Board;