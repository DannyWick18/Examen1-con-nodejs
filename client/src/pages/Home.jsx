import { useEffect, useState } from "react";
import { getSocket } from "../socket/socket";
import Board from "../components/gameplay";
import "./Home.css"; // CSS DE HOME

function Home({ onLogout }) {
  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

  const [room, setRoom] = useState(localStorage.getItem("room") || "");
  const [joined, setJoined] = useState(false);
  const [playerColor, setPlayerColor] = useState(localStorage.getItem("playerColor") || null);

  // NUEVO USEREFFECT - DB PARA RANKING E HISTORIAL
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`${API_URL}/api/ranking/${userId}`)
        .then((res) => res.json())
        .then((data) => setRanking(data))
        .catch((err) => console.error("Error ranking:", err));

    fetch(`${API_URL}/api/games/history/${userId}`)
        .then((res) => res.json())
        .then((data) => setHistoryGames(data))
        .catch((err) => console.error("Error historial:", err));
  }, []);
  
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
    localStorage.setItem("room", trimmedRoom);
  };

  // No forzamos setJoined here; esperamos al event `player_color` para asegurarnos de la asignación
  // En caso de que el servidor ya haya asignado color (reconexión), el handler lo procesará

  // UI y datos 
  const username = localStorage.getItem("email") || "Usuario";

  // CAMBIO
  const [ranking, setRanking] = useState({ points: 0, wins: 0, losses: 0, draws: 0 });
  const [historyGames, setHistoryGames] = useState([]);

  // RENDER DE AMBOS LADOS
  return (
    <div className="home-shell">

      {/* IZQUIERDA: Juego + Sockets */}
      <div className="home-left" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

        {!joined ? (
          <div className="home-form">
            <label className="home-label">Sincronización en Tiempo Real</label>
            <input
              className="home-input"
              placeholder="Introducir identificador de sala..."
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <div className="home-actions">
              <button className="home-btn primary" onClick={joinRoom}>
                Conectar Oponente
              </button>
              <button className="home-btn" onClick={onLogout} style={{ marginLeft: 10 }}>
                Salir
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="home-status" style={{ color: "#4cd137" }}>
              Sala Activa: {localStorage.getItem("room")} 🟢 — Juegas como: {playerColor}
            </span>
            <Board />
            <button className="home-btn" onClick={onLogout} style={{ marginTop: 20 }}>
              Salir
            </button>
          </>
        )}
      </div>

      {/* DERECHA: Ranking e Historial de tu compañera */}
      <div className="home-right">

        <div className="home-right-header">
          <div className="home-right-title"><h2>RANKING AUTOMÁTICO</h2></div>
          <div style={{ marginBottom: "8px", fontSize: "14px", color: "#bbb" }}>
            Jugador: <strong>{username}</strong>
          </div>
          <div className="home-mini-row" style={{ gap: "8px" }}>
            <div className="home-pill"><div className="k">PUNTOS</div><div className="v">{ranking.points}</div></div>
            <div className="home-pill"><div className="k">VICTORIAS</div><div className="v">{ranking.wins}</div></div>
            <div className="home-pill"><div className="k">DERROTAS</div><div className="v">{ranking.losses}</div></div>
          </div>
        </div>

        <div className="home-right-body">
          <div className="home-label" style={{ marginBottom: "10px" }}>HISTORIAL DE PARTIDAS</div>
          <div className="home-history">
            {historyGames.length === 0 ? (
              <div className="home-card" style={{ padding: "20px", borderStyle: "dashed", opacity: 0.6 }}>
                <div className="text" style={{ textAlign: "center", fontSize: "13px" }}>
                  No se registran partidas previas en la base de datos para este usuario.
                </div>
              </div>
            ) : (
              historyGames.map((game) => (
                <div className="home-card" key={game.id} style={{ marginBottom: "8px" }}>
                  <div className="meta">
                    <span className="idx">PARTIDA #{game.id}</span>
                    <span className="tag" style={{ backgroundColor: "#442266" }}>FINALIZADA</span>
                  </div>
                  <div className="text" style={{ fontSize: "13px", marginTop: "5px" }}>
                    ⚪ Blancas: <strong>{game.white_player}</strong><br />
                    ⚫ Negras: <strong>{game.black_player}</strong><br />
                    👑 Ganador: <span style={{ color: "#dfb76c" }}>{game.winner_id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;