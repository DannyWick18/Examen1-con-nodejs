import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLoginTab) {
      // Simulación de Login
      if (username.trim() && password.trim()) {
        // 🔥 CAMBIO AQUÍ: Guardamos el nombre exacto que se digitó en el formulario
        localStorage.setItem("username", username.trim());
        
        onLoginSuccess(); // Te lleva al Home de tu ajedrez
      }
    } else {
      // Simulación de Registro
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      setIsLoginTab(true); // Cambia automáticamente a la pestaña de Iniciar Sesión
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        
        {/* Encabezado del Login */}
        <div className="login-header">
          <span className="login-crown">♟️</span>
          <div>
            <h1 className="login-title">CHESS GAME</h1>
            <p className="login-tagline">"La paciencia no es esperar...es preparar♞"</p>
          </div>
        </div>

        <div className="login-divider"></div>

        {/* Pestañas (Tabs) */}
        <div className="login-tabs">
          <button 
            type="button"
            className={`login-tab ${isLoginTab ? 'active' : ''}`}
            onClick={() => setIsLoginTab(true)}
          >
            INICIAR SESIÓN
          </button>
          <button 
            type="button"
            className={`login-tab ${!isLoginTab ? 'active' : ''}`}
            onClick={() => setIsLoginTab(false)}
          >
            REGISTRARSE
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">USUARIO</label>
            <input 
              type="text" 
              className="login-input"
              placeholder="Tu nombre de usuario" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          {!isLoginTab && (
            <div className="login-field">
              <label className="login-label">CORREO ELECTRÓNICO</label>
              <input 
                type="email" 
                className="login-input"
                placeholder="ejemplo@correo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="login-field">
            <label className="login-label">CONTRASEÑA</label>
            <input 
              type="password" 
              className="login-input"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-btn">
            {isLoginTab ? 'ENTRAR A JUGAR' : 'CREAR CUENTA'}
          </button>
        </form>

        {/* Piezas decorativas del fondo de CSS */}
        <div className="login-pieces">
          <span className="login-piece">♞</span>
          <span className="login-piece">♝</span>
          <span className="login-piece">♜</span>
          <span className="login-piece">♛</span>
        </div>

      </div>
    </div>
  );
};

export default Login;