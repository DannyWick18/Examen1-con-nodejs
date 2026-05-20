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
    socket.on("join_room", (roomName) => {

      const room = io.sockets.adapter.rooms.get(roomName);
      const numClients = room ? room.size : 0;

      if (numClients >= 2) {
        socket.emit("room_full");
        return;
      }

      socket.join(roomName);
      const assignedColor = numClients === 0 ? "white" : "black";

      socket.emit("player_color", assignedColor);

      console.log(`${socket.id} se unió a ${roomName} como ${assignedColor}`);
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