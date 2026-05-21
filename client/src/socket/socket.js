import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  socket = io("http://192.168.40.218:3000", {
    auth: {
      token: token
    }
  });
  
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};