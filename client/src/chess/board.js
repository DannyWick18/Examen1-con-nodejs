// Creamos un tablero de 8x8 (64 casillas)

export const initialBoard = [

    // Fila 0 tiene piezas negras
    [
        { type: "rook", color: "black" },
        { type: "knight", color: "black" },
        { type: "bishop", color: "black" },
        { type: "queen", color: "black" },
        { type: "king", color: "black" },
        { type: "bishop", color: "black" },
        { type: "knight", color: "black" },
        { type: "rook", color: "black" }
    ],

    // Fila 1 tiene 8 peones negros
    [
        { type: "pawn", color: "black" },
        { type: "pawn", color: "black" },
        { type: "pawn", color: "black" },
        { type: "pawn", color: "black" },
        { type: "pawn", color: "black" },
        { type: "pawn", color: "black" },
        { type: "pawn", color: "black" },
        { type: "pawn", color: "black" }
    ],

    // Filas vacías
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],

    // 8 peones blancos
    [
        { type: "pawn", color: "white" },
        { type: "pawn", color: "white" },
        { type: "pawn", color: "white" },
        { type: "pawn", color: "white" },
        { type: "pawn", color: "white" },
        { type: "pawn", color: "white" },
        { type: "pawn", color: "white" },
        { type: "pawn", color: "white" }
    ],

    // Y ultima fila de la matriz
    [
        { type: "rook", color: "white" },
        { type: "knight", color: "white" },
        { type: "bishop", color: "white" },
        { type: "queen", color: "white" },
        { type: "king", color: "white" },
        { type: "bishop", color: "white" },
        { type: "knight", color: "white" },
        { type: "rook", color: "white" }
    ]
];



