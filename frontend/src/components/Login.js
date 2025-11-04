import React, { useState } from 'react';
import API from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/usuarios/login/', { email, password });
      setMensaje('Login exitoso');
      setError('');
      console.log(response.data); // aquí puedes manejar token o redirección
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data.error || 'Error al iniciar sesión');
      setMensaje('');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {mensaje && <p>{mensaje}</p>}
      {error && <p>{error}</p>}
    </form>
  );
}

export default Login;
