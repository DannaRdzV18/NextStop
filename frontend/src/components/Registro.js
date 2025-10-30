import React, { useState } from 'react';
import API from '../api';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/usuarios/registrar/', {
        nombre,
        email,
        password,
        recaptcha_token: 'fake-token', // para pruebas locales
      });
      setMensaje(response.data.mensaje);
      setError('');
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data.error || 'Error al registrar');
      setMensaje('');
    }
  };

  return (
    <form onSubmit={handleRegistro}>
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Registrarse</button>
      {mensaje && <p>{mensaje}</p>}
      {error && <p>{error}</p>}
    </form>
  );
}

export default Registro;
