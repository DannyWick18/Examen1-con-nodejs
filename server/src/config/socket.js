import { Server } from "socket.io";

export const initSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {

    console.log("Usuario conectado:", socket.id);

    // Unirse a sala
    socket.on("join_room", (room) => {

      socket.join(room);

      console.log(`${socket.id} se unió a ${room}`);

    });

    // Movimiento
    socket.on("move_piece", (data) => {

      socket.to(data.room).emit("receive_move", data);

    });

    socket.on("disconnect", () => {

      console.log("Usuario desconectado:", socket.id);

    });

  });

};