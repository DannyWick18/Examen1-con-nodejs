// src/App.jsx
import React, { useState } from 'react';
import Login from "./pages/Login";
import Home from "./pages/Home"; // <--- CAMBIO 1: Activamos tu Home elegante

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
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Home /> 
      )}
    </>
  );
}

export default App;