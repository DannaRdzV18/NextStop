import React, { useState } from 'react';
import API from '../api';
import { saveTokens } from '../utils/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/usuarios/login/', { email, password });
      
      // ✅ GUARDAR TOKENS
      if (response.data.access && response.data.refresh) {
        saveTokens(response.data.access, response.data.refresh);
      }

      // ✅ GUARDAR USUARIO
      if (response.data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      }

      setMensaje('Login exitoso');
      setError('');
      
      console.log('✅ Usuario y tokens guardados correctamente');
      console.log('Usuario:', response.data.usuario);

      // ✅ RECARGAR LA PÁGINA PARA QUE TODOS LOS COMPONENTES DETECTEN LA SESIÓN
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data.error || 'Error al iniciar sesión');
      setMensaje('');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        placeholder="Correo" 
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
      <button type="submit">Login</button>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default Login;