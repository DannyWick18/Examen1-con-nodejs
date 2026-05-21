import { useEffect, useState } from "react";
import { getSocket } from "../socket/socket";

function Home() {

  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {

    const socket = getSocket();
    if (!socket) return;

    socket.on("receive_move", (data) => {

      setMessages((prev) => [...prev, data.message]);

    });

    return () => {

      socket.off("receive_move");

    };

  }, []);

  const joinRoom = () => {

    if (!room) return;

    const socket = getSocket();
    socket.emit("join_room", room);

    setJoined(true);

  };

  const sendMessage = () => {

    const userId = localStorage.getItem('userId');
    const socket = getSocket();

    const data = {
      room,
      message,
      playerId: userId,
    };

    socket.emit("move_piece", data);

    setMessages((prev) => [...prev, message]);

    setMessage("");

  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Chess Online</h1>
      <p>Usuario: {localStorage.getItem('email')}</p>

      {!joined ? (
        <>
          <input
            placeholder="Sala"
            onChange={(e) => setRoom(e.target.value)}
          />

          <button onClick={joinRoom}>
            Entrar
          </button>
        </>
      ) : (
        <>
          <h2>Sala: {room}</h2>

          <input
            placeholder="Movimiento"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button onClick={sendMessage}>
            Enviar
          </button>

          <div>
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

export default Home;