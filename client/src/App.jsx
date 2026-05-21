// src/App.jsx
import React, { useState } from 'react';
import Login from "./pages/Login";
import Board from "./components/gameplay";

function App() {
  // Este estado controla si el usuario ya inició sesión (empieza en false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Esta función cambia el estado a true cuando el login es correcto
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      {!isAuthenticated ? (
        // Si NO está autenticado, le mostramos la pantalla elegante de Login
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Si SÍ está autenticado, entra a tu juego de Ajedrez
        <Board />
      )}
    </>
  );
}

export default App;