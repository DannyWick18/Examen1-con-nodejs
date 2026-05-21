import { Server } from "socket.io";
import jwt from "jsonwebtoken";

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

    // Unirse a sala
    socket.on("join_room", (room) => {

      socket.join(room);

      console.log(`${socket.id} se unió a ${room}`);

    });

    // Movimiento
    socket.on("move_piece", (data) => {

      // Validar que el usuario sea el que está haciendo el movimiento
      if (!data.playerId || data.playerId !== socket.userId) {
        socket.emit("error", "No autorizado para hacer este movimiento");
        return;
      }

      socket.to(data.room).emit("receive_move", {
        ...data,
        userId: socket.userId,
        email: socket.email
      });

    });

    socket.on("disconnect", () => {

      console.log("Usuario desconectado:", socket.email, "(", socket.id, ")");

    });

  });

};