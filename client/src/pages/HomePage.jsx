import { useEffect, useState } from "react";

import { socket } from "../socket/socket";

import Navbar from "../components/common/Navbar";

import { useAuth } from "../context/AuthContext";

function HomePage() {

    const { user } = useAuth();

    const [room, setRoom] = useState("");

    const [joined, setJoined] = useState(false);

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([]);


    // ESCUCHAR MOVIMIENTOS
    useEffect(() => {

        socket.on("receive_move", (data) => {

            setMessages((prev) => [
                ...prev,
                data.message
            ]);
        });

        return () => {

            socket.off("receive_move");
        };

    }, []);


    // UNIRSE A SALA
    const joinRoom = () => {

        if (!room.trim()) return;

        socket.emit("join_room", room);

        setJoined(true);
    };


    // ENVIAR MOVIMIENTO
    const sendMessage = () => {

        if (!message.trim()) return;

        const data = {
            room,
            message,
            username: user.username
        };

        socket.emit("move_piece", data);

        setMessages((prev) => [
            ...prev,
            `${user.username}: ${message}`
        ]);

        setMessage("");
    };


    return (
        <div className="home-container">

            <Navbar />

            <div className="home-content">

                <h1>Chess Online</h1>

                <p>
                    Bienvenido {user?.username}
                </p>


                {!joined ? (

                    <div className="room-container">

                        <input
                            type="text"
                            placeholder="Código de sala"
                            value={room}
                            onChange={(e) =>
                                setRoom(e.target.value)
                            }
                            className="auth-input"
                        />

                        <button
                            onClick={joinRoom}
                            className="auth-button"
                        >
                            Entrar a Sala
                        </button>

                    </div>

                ) : (

                    <div className="game-container">

                        <h2>
                            Sala: {room}
                        </h2>

                        <div className="message-box">

                            {messages.map((msg, index) => (

                                <p key={index}>
                                    {msg}
                                </p>

                            ))}

                        </div>

                        <div className="message-controls">

                            <input
                                type="text"
                                placeholder="Movimiento"
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                className="auth-input"
                            />

                            <button
                                onClick={sendMessage}
                                className="auth-button"
                            >
                                Enviar
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

export default HomePage;