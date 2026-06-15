// src/App.jsx
import React, { useEffect, useState } from 'react';
import Login from "./pages/Login";
import Home from "./pages/Home";
import { initSocket, getSocket, closeSocket } from "./socket/socket";
//import Board from "./components/gameplay";

function App() {
  // Este estado controla si el usuario ya inició sesión (empieza en false)
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('authToken'))
  );

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && !getSocket()) {
      initSocket(token);
    }
  }, []);

  // Esta función cambia el estado a true cuando el login es correcto
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    closeSocket();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('room');
    localStorage.removeItem('playerColor');
    setIsAuthenticated(false);
  };

  return (
    <>
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Home onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;