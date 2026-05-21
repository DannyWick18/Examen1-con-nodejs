import React, { useState } from 'react';
import './Login.css';
import { initSocket } from '../socket/socket';

const Login = ({ onLoginSuccess }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_URL = "http://localhost:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLoginTab) {
      try {
        const response = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al iniciar sesión. Verifica tus datos.');
          return;
        }

        // Guardar token y datos del usuario
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('email', data.user.email);

        // Inicializar socket con el token
        initSocket(data.token);

        onLoginSuccess();
      } catch (fetchError) {
        setError('No se pudo conectar con el servidor. Intenta de nuevo.');
        console.error('Login error:', fetchError);
      }
    } else {
      try {
        const response = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al registrar el usuario.');
          return;
        }

        alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
        setIsLoginTab(true);
      } catch (fetchError) {
        setError('No se pudo conectar con el servidor. Intenta de nuevo.');
        console.error('Register error:', fetchError);
      }
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

          {error && <p className="login-error">{error}</p>}
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