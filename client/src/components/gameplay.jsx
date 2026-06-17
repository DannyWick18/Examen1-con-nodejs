import { useState, useEffect } from "react";

// Importamos tablero inicial
import { initialBoard } from "../chess/board";

// Importamos movimientos geométricos
import { getValidMoves } from "../chess/validMoves";
import { getSocket } from "../socket/socket";

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

    // Color asignado al jugador por el servidor (white/black/spectator)
    const [playerColor, setPlayerColor] = useState(
        localStorage.getItem("playerColor") || null
    );

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

        // Limpiamos selección y movimientos locales
        setSelectedPiece(null);
        setValidMoves([]);

        // NUEVO (POR SI ACASO, ELIMINAR LUEGO SI NO FUNCIONA)
        if (
        !selectedPiece ||
        !board[selectedPiece.row]?.[selectedPiece.col]
        ) {
        console.warn("Movimiento cancelado: pieza inválida");
        return;
        }
        try {
            const socket = getSocket();
            const room = localStorage.getItem("room");
            const playerId = localStorage.getItem("userId");
            if (socket && room && playerId) {
                const payload = {
                    room,
                    playerId,
                    playerColor,
                    fromRow: selectedPiece.row,
                    fromCol: selectedPiece.col,
                    toRow,
                    toCol,
                };
                console.log("Emitiendo move_piece:", payload);
                socket.emit("move_piece", payload);
            }
        } catch (e) {
            console.error("Error emit move_piece:", e);
        }
    }

        // Escuchar movimientos del oponente y asignación de color desde el servidor
        useEffect(() => {
            const socket = getSocket();
            if (!socket) return;

            const handler = (data) => {
                console.log("receive_move recibido:", data);
                // El tablero y el turno se gestionan desde board_state (autoridad del servidor).
                // Este evento se mantiene solo para detección o mensajes futuros.
                if (data.userId && localStorage.getItem("userId") === String(data.userId)) {
                    console.log("receive_move: evento propio ignorado", data);
                }
            };

            socket.on("receive_move", handler);

            // También actualizar el playerColor si el servidor lo envía nuevamente
            const colorHandler = (d) => {
                if (d && d.color) {
                    setPlayerColor(d.color);
                    localStorage.setItem("playerColor", d.color);
                }
            };

            socket.on("player_color", colorHandler);

            // Escuchar estado de tablero completo desde servidor
            const boardStateHandler = (payload) => {
                console.log("board_state recibido:", payload);
                if (!payload || !Array.isArray(payload.board)) return;
                const b = payload.board;
                // Validar dimensiones
                if (b.length !== 8 || !b.every(row => Array.isArray(row) && row.length === 8)) {
                    console.warn("board_state: formato inválido", payload);
                    return;
                }
                setBoard(b);
                if (payload.currentTurn) {
                    setCurrentTurn(payload.currentTurn);
                }
                // NUEVO - Detección de jaque, jaque mate y ahogado tras cada movimiento
                const opponent = payload.currentTurn;

                let nextStatus = "";
                let nextGameOver = false;

                if (isCheckmate(payload.board, opponent)) {

                const winner =
                    opponent === "white" ? "Negras" : "Blancas";

                nextStatus = `¡Jaque mate! Ganan las ${winner}.`;
                nextGameOver = true;

                } else if (isStalemate(payload.board, opponent)) {

                    nextStatus = "¡Ahogado! Empate.";
                    nextGameOver = true;

                } else if (isKingInCheck(payload.board, opponent)) {

                    const opponentName =
                    opponent === "white" ? "Blanco" : "Negro";

                    nextStatus = `¡Jaque al Rey ${opponentName}!`;
                }

                setStatusMessage(nextStatus);
                setGameOver(nextGameOver);
                setSelectedPiece(null);
                setValidMoves([]);
            };

            socket.on("board_state", boardStateHandler);

            return () => {
                socket.off("receive_move", handler);
                socket.off("player_color", colorHandler);
                socket.off("board_state", boardStateHandler);
            };
        }, []);

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

        // Si el cliente ya tiene un color asignado, sólo puede seleccionar sus piezas
        if (playerColor && piece.color !== playerColor) return;

        // Además la pieza debe corresponder al turno actual
        if (piece.color !== currentTurn) return;

        // Seleccionamos la pieza y calculamos movimientos legales
        setSelectedPiece({ piece, row, col });

        const legalMoves = getLegalMoves(piece, board, row, col);
        
        setValidMoves(legalMoves);
    }

        // Reinicia la partida si hay jaque mate 
        // NUEVO - No inicializo board localmente, el servidor enviará el estado inicial al resetear
        function resetGame() {
            const socket = getSocket();
            const room = localStorage.getItem("room");

            if (socket && room) {
                socket.emit("reset_game", room);
            }
            setSelectedPiece(null);
            setValidMoves([]);
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
                {board.reduce((cells, row, rowIndex) => {
                    row.forEach((square, colIndex) => {
                        const isValidMove = validMoves.some(
                            (move) => move.row === rowIndex && move.col === colIndex
                        );

                        const isSelected =
                            selectedPiece &&
                            selectedPiece.row === rowIndex &&
                            selectedPiece.col === colIndex;

                        const isBlack = (rowIndex + colIndex) % 2 === 1;

                        const isKingInCheckSquare =
                            square && square.type === "king" && isKingInCheck(board, square.color);

                        cells.push(
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
                                onClick={() => handleSquareClick(rowIndex, colIndex)}
                            >
                                <div className="coordinate">
                                    {rowIndex === 7 && String.fromCharCode(97 + colIndex)}
                                    {colIndex === 0 && 8 - rowIndex}
                                </div>
                                {square && getPieceSymbol(square)}
                            </div>
                        );
                    });
                    return cells;
                }, [])}
            </div>
        </div>
    );
}

export default Board;