import React, { useState, useEffect } from 'react';
import API from '../api';

function Verificar() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [contador, setContador] = useState(0); // cuenta regresiva
  const [reenviando, setReenviando] = useState(false);

  // Maneja la verificación del código
  const handleVerificar = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/usuarios/verificar/', { email, codigo });
      setMensaje(response.data.mensaje);
      setError('');
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data.error || 'Error al verificar');
      setMensaje('');
    }
  };

  // Maneja el reenvío del código
  const handleReenviarCodigo = async () => {
    try {
      setReenviando(true);
      setMensaje('');
      setError('');

      const response = await API.post('api/usuarios/reenviar-codigo/', { email });
      setMensaje(response.data.mensaje || 'Se ha reenviado el código.');
      setContador(30); // inicia el conteo regresivo de 30 s
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data.error || 'Error al reenviar el código');
    } finally {
      setReenviando(false);
    }
  };

  // Efecto que controla el temporizador
  useEffect(() => {
    let timer;
    if (contador > 0) {
      timer = setTimeout(() => setContador(contador - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [contador]);

  return (
    <form onSubmit={handleVerificar}>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Código"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        required
      />

      <button type="submit">Verificar</button>

      {/* Botón de reenvío */}
      <button
        type="button"
        onClick={handleReenviarCodigo}
        disabled={reenviando || contador > 0 || !email}
      >
        {contador > 0
          ? `Reenviar código (${contador}s)`
          : 'Reenviar código'}
      </button>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default Verificar;
