import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  if (socket && socket.connected && socket.io?.opts?.auth?.token === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:3000`, {
    auth: {
      token: token,
    },
  });
  
  socket.on("connect_error", (error) => {
    console.error("Socket connect_error:", error);
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