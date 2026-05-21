import http from "http";
import app from "./app.js";
import { initSocket } from "./config/socket.js";

const server = http.createServer(app);

initSocket(server);

const PORT = 3000;

server.listen(PORT, () => {

  console.log(`Servidor corriendo en puerto ${PORT}`);

});