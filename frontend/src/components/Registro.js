// src/components/Registro.js
import React, { useState, useEffect } from 'react';
import API from '../api';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [contador, setContador] = useState(0);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    let timer;
    if (contador > 0) {
      timer = setTimeout(() => setContador(contador - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [contador]);

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/usuarios/registrar/', {
        nombre,
        email,
        password,
      });
      setMensaje(response.data.mensaje || 'Se envió un correo de verificación.');
      setError('');
      setContador(30); // ⏳ 10 minutos
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.error || 'Error al registrar');
      setMensaje('');
    }
  };

  const handleReenviar = async () => {
    if (contador > 0) return;
    setReenviando(true);
    try {
      await API.post('api/usuarios/reenviar-verificacion/', { email });
      setMensaje('Se ha reenviado el correo de verificación.');
      setContador(600); // reinicia a 10 minutos
    } catch (err) {
      setError('Error al reenviar el correo.');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="registro-container">
      <form onSubmit={handleRegistro}>
        <h2>Crear cuenta</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>

        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {mensaje && (
          <div style={{ marginTop: '10px' }}>
            {contador > 0 ? (
              <p>Podrás reenviar el correo en {Math.floor(contador / 60)}:{(contador % 60).toString().padStart(2, '0')} minutos</p>
            ) : (
              <button onClick={handleReenviar} disabled={reenviando}>
                {reenviando ? 'Reenviando...' : 'Reenviar verificación'}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default Registro;
