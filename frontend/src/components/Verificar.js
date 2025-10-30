import React, { useState } from 'react';
import API from '../api';

function Verificar() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

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

  return (
    <form onSubmit={handleVerificar}>
      <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
      <button type="submit">Verificar</button>
      {mensaje && <p>{mensaje}</p>}
      {error && <p>{error}</p>}
    </form>
  );
}

export default Verificar;
