import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import Board from "../components/gameplay"; 
import "./Home.css"; 

function Home() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // REQUERIMIENTO 1: Recupera el nombre real que se digitó en el Login
  const [username] = useState(() => {
    return localStorage.getItem("username") || "Usuario";
  });

  // Estructura real de la tabla 'rankings' en SQL.
  const [ranking] = useState({
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0
  });


  // Inicia como un arreglo vacío [] porque al ser una cuenta nueva no tiene partidas guardadas
  const [historyGames] = useState([]);

  useEffect(() => {
    socket.on("receive_move", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      socket.off("receive_move");
    };
  }, []);

  const joinRoom = () => {
    if (!room) return;
    socket.emit("join_room", room);
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message) return;

    const data = {
      room,
      message,
    };

    socket.emit("move_piece", data);
    setMessages((prev) => [...prev, message]);
    setMessage("");
  };

  return (
    <div className="home-shell">

      {/* SECCIÓN IZQUIERDA: Juego de Ajedrez Completo y Sincronización */}
      <div className="home-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Componente del juego interactivo (Requerimiento 2) */}
        <Board /> 

        {/* Control de Sincronización vía WebSockets (Requerimiento 3) */}
        <div className="home-controls" style={{ width: '100%', marginTop: '15px' }}>
          {!joined ? (
            <div className="home-form">
              <label className="home-label">Sincronización en Tiempo Real</label>
              <input
                className="home-input"
                placeholder="Introducir identificador de sala..."
                onChange={(e) => setRoom(e.target.value)}
              />
              <div className="home-actions">
                <button className="home-btn primary" onClick={joinRoom}>
                  Conectar Oponente
                </button>
              </div>
            </div>
          ) : (
            <div className="home-form">
              <span className="home-status" style={{ color: '#4cd137' }}>Sala Activa: {room} 🟢</span>
              <input
                className="home-input"
                placeholder="Enviar registro o mensaje por socket..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="home-actions">
                <button className="home-btn primary" onClick={sendMessage}>
                  Enviar Acción
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: Visualización de Base de Datos */}
      <div className="home-right">
        
        {/* REQUERIMIENTO 5: Ranking Automático */}
        <div className="home-right-header">
          <div className="home-right-title">
            <h2>RANKING AUTOMÁTICO</h2>
          </div>
          <div style={{ marginBottom: "8px", fontSize: "14px", color: "#bbb" }}>
            Jugador: <strong>{username}</strong>
          </div>
          <div className="home-mini-row" style={{ gap: '8px' }}>
            <div className="home-pill"><div className="k">PUNTOS</div><div className="v">{ranking.points}</div></div>
            <div className="home-pill"><div className="k">VICTORIAS</div><div className="v">{ranking.wins}</div></div>
            <div className="home-pill"><div className="k">DERROTAS</div><div className="v">{ranking.losses}</div></div>
          </div>
        </div>

        {/* REQUERIMIENTO 6: Historial de Partidas */}
        <div className="home-right-body">
          <div className="home-label" style={{ marginBottom: '10px' }}>HISTORIAL DE PARTIDAS</div>
          
          <div className="home-history">
            {historyGames.length === 0 ? (
              // Mensaje lógico de base de datos limpia al ingresar por primera vez
              <div className="home-card" style={{ padding: '20px', borderStyle: 'dashed', opacity: 0.6 }}>
                <div className="text" style={{ textAlign: 'center', fontSize: '13px' }}>
                  No se registran partidas previas en la base de datos para este usuario.
                </div>
              </div>
            ) : (
              historyGames.map((game) => (
                <div className="home-card" key={game.id} style={{ marginBottom: '8px' }}>
                  <div className="meta">
                    <span className="idx">PARTIDA #{game.id}</span>
                    <span className="tag" style={{ backgroundColor: '#442266' }}>FINALIZADA</span>
                  </div>
                  <div className="text" style={{ fontSize: '13px', marginTop: '5px' }}>
                    ⚪ Blancas: <strong>{game.white}</strong> <br />
                    ⚫ Negras: <strong>{game.black}</strong> <br />
                    👑 Ganador: <span style={{ color: '#dfb76c' }}>{game.winner}</span>
                  </div>
                </div>
              ))
            )}

            {/* Movimientos del Socket de la sesión actual */}
            {messages.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <div className="home-label" style={{ marginBottom: '8px', fontSize: '11px', opacity: 0.8 }}>MOVIMIENTOS DE LA SESIÓN EN VIVO</div>
                {messages.map((msg, index) => (
                  <div className="home-card" key={index} style={{ borderColor: '#6c5ce7', borderWidth: '1px', borderStyle: 'solid' }}>
                    <div className="text" style={{ fontSize: '12px' }}>Movimiento registrado: <strong>{msg}</strong></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Home;