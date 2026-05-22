import http from "http";
import app from "./app.js";
import { initSocket } from "./config/socket.js";

const server = http.createServer(app);

initSocket(server);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {

  console.log(`Servidor corriendo en puerto ${PORT}`);

});