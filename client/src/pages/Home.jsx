import { useEffect, useState } from "react";
import { getSocket } from "../socket/socket";
import Board from "../components/gameplay";

function Home({ onLogout }) {

  const [room, setRoom] = useState(localStorage.getItem("room") || "");
  const [joined, setJoined] = useState(false);
  const [playerColor, setPlayerColor] = useState(localStorage.getItem("playerColor") || null);

  useEffect(() => {
    const socket = getSocket();
    const storedRoom = localStorage.getItem("room");
    if (socket && storedRoom) {
      setRoom(storedRoom);
      socket.emit("join_room", storedRoom);
    }

    if (!socket) return;

    // Actualizar playerColor si el servidor lo emite en cualquier momento
    const colorHandler = (data) => {
      if (data && data.color) {
        localStorage.setItem("playerColor", data.color);
        setPlayerColor(data.color);
        // Only mark as joined when color assigned
        setJoined(true);
      }
    };

    socket.on("player_color", colorHandler);

    return () => {
      socket.off("player_color", colorHandler);
    };
  }, []);

  const joinRoom = () => {
    const trimmedRoom = room.trim();
    if (!trimmedRoom) return;

    const socket = getSocket();
    socket.emit("join_room", trimmedRoom);

    // Guardamos la sala para que Board lo use
    localStorage.setItem("room", trimmedRoom);

    // No forzamos setJoined here; esperamos al event `player_color` para asegurarnos de la asignación
    // En caso de que el servidor ya haya asignado color (reconexión), el handler lo procesará
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>Chess Online</h1>
      <p>Usuario: {localStorage.getItem('email')}</p>

      {!joined ? (
        <>
          <input
            placeholder="Sala"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />

          <button onClick={joinRoom}>
            Entrar a sala
          </button>
          <button onClick={onLogout} style={{ marginLeft: 10 }}>
            Salir
          </button>
        </>
      ) : (
        <>
          <h2>Sala: {localStorage.getItem('room')}</h2>
          <h3>Tu color: {playerColor}</h3>
          <Board />
          <button onClick={onLogout} style={{ marginTop: 20 }}>
            Salir
          </button>
        </>
      )}

    </div>
  );
}

export default Home;