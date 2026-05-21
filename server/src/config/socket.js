import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const initialBoard = [
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
  Array.from({ length: 8 }, () => ({ type: "pawn", color: "black" })),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => ({ type: "pawn", color: "white" })),
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

export const initSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Token requerido"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_secreto_aqui");
      socket.userId = decoded.id;
      socket.email = decoded.email;
      next();
    } catch (err) {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {

    console.log("Usuario conectado:", socket.email, "(", socket.id, ")");

    // Map simple de salas en memoria:
    // rooms: { [roomName]: { players: [userId,..], colors: { userId: color }, sockets: { userId: socketId } } }
    // socketToUser: { socketId: userId }
    if (!io.roomsMap) io.roomsMap = {};
    if (!io.socketToUser) io.socketToUser = {};
    const rooms = io.roomsMap;

    // Unirse a sala
    socket.on("join_room", (room) => {

      // Usamos el userId del token (login) para asignar colores
      const userId = socket.userId;
      if (!userId) {
        socket.emit("error", "Usuario no autenticado");
        return;
      }

      socket.join(room);

      if (!rooms[room]) {
        // Inicializamos estado de sala, tablero y turno
        rooms[room] = {
          players: [],
          colors: {},
          sockets: {},
          board: JSON.parse(JSON.stringify(initialBoard)),
          currentTurn: "white"
        };
      }

      // Guardamos la relación socket -> user
      io.socketToUser[socket.id] = userId;
      rooms[room].sockets[userId] = socket.id;

      // Evitar duplicar el mismo userId
      if (!rooms[room].players.includes(userId)) {
        rooms[room].players.push(userId);
      }

      const playersCount = rooms[room].players.length;
      let color = "spectator";

      // Si ya tenía color asignado (reconexión), conservarla
      if (rooms[room].colors[userId]) {
        color = rooms[room].colors[userId];
      } else {
        if (playersCount === 1) color = "white";
        else if (playersCount === 2) color = "black";
        else color = "spectator";

        rooms[room].colors[userId] = color;
      }

      console.log(`${userId} (socket ${socket.id}) se unió a ${room} como ${color}`);

      // Informamos al cliente su color
      socket.emit("player_color", { color });

      // Informamos el conteo de jugadores en la sala (útil para UI)
      io.to(room).emit("room_info", { players: playersCount });

      // Enviar estado inicial del tablero al unirse
      io.to(room).emit("board_state", {
        board: JSON.parse(JSON.stringify(rooms[room].board)),
        currentTurn: rooms[room].currentTurn,
      });

    });

    // Movimiento
    socket.on("move_piece", (data) => {

      // Validar que el usuario sea el que está haciendo el movimiento
      if (!data.playerId || String(data.playerId) !== String(socket.userId)) {
        console.warn(`move_piece rechazado: playerId=${data.playerId} socket.userId=${socket.userId}`);
        socket.emit("error", "No autorizado para hacer este movimiento");
        return;
      }

      // Validar que la sala exista y el socket tenga un color asignado
      const room = data.room;
      const userId = socket.userId;
      if (!rooms[room] || !rooms[room].colors[userId]) {
        socket.emit("error", "Sala inválida o sin color asignado");
        return;
      }

      // Validar que el color enviado concuerde con el color asignado
      const assignedColor = rooms[room].colors[userId];
      if (data.playerColor && data.playerColor !== assignedColor) {
        socket.emit("error", "Color inválido para este jugador");
        return;
      }

      // Reenviar movimiento a toda la sala (incluye al emisor).
      // Actualizamos tablero en el servidor y emitimos el estado completo.
      console.log(`Movimiento en sala ${room} por user ${userId}: from ${data.fromRow},${data.fromCol} -> ${data.toRow},${data.toCol}`);

      // Validar índices y aplicar al tablero del servidor
      const fr = parseInt(data.fromRow, 10);
      const fc = parseInt(data.fromCol, 10);
      const tr = parseInt(data.toRow, 10);
      const tc = parseInt(data.toCol, 10);

      if (
        Number.isNaN(fr) || Number.isNaN(fc) || Number.isNaN(tr) || Number.isNaN(tc) ||
        fr < 0 || fr > 7 || fc < 0 || fc > 7 || tr < 0 || tr > 7 || tc < 0 || tc > 7
      ) {
        console.warn("move_piece: índices inválidos en servidor", data);
        socket.emit("error", "Índices inválidos");
        return;
      }

      const roomBoard = rooms[room].board;
      const piece = roomBoard[fr] && roomBoard[fr][fc];
      if (!piece) {
        console.warn("move_piece: no hay pieza en from en servidor", fr, fc, data);
        socket.emit("error", "No hay pieza en la casilla de origen");
        return;
      }

      // Aplicar movimiento en el servidor
      roomBoard[tr][tc] = piece;
      roomBoard[fr][fc] = null;

      // Cambiar el turno en el servidor
      rooms[room].currentTurn = rooms[room].currentTurn === "white" ? "black" : "white";

      // Emitir estado de tablero actualizado y turno autoritativo
      io.to(room).emit("board_state", {
        board: JSON.parse(JSON.stringify(roomBoard)),
        currentTurn: rooms[room].currentTurn,
      });
      io.to(room).emit("receive_move", {
        fromRow: fr,
        fromCol: fc,
        toRow: tr,
        toCol: tc,
        playerColor: assignedColor,
        userId: userId,
        email: socket.email,
      });

    });

    socket.on("disconnect", () => {

      console.log("Usuario desconectado:", socket.email, "(", socket.id, ")");

      const userId = io.socketToUser[socket.id] || socket.userId;
      // Limpiar mapping socket->user
      if (io.socketToUser && io.socketToUser[socket.id]) delete io.socketToUser[socket.id];

      // Remover al userId de cualquier sala que tuviera asignada
      Object.keys(rooms).forEach((roomName) => {
        const entry = rooms[roomName];
        const idx = entry.players.indexOf(userId);
        if (idx !== -1) {
          entry.players.splice(idx, 1);
          delete entry.colors[userId];
          delete entry.sockets[userId];
          // Emitir información actualizada de la sala
          io.to(roomName).emit("room_info", { players: entry.players.length });
        }
        // Si la sala queda vacía, limpiarla
        if (entry.players.length === 0) {
          delete rooms[roomName];
        }
      });

    });

  });

};