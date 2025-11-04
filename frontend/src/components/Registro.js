// src/components/Registro.js
import React, { useState } from 'react';
import API from '../api';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idioma, setIdioma] = useState('');
  const [moneda, setMoneda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('api/usuarios/registrar/', {
        nombre,
        email,
        password,
        telefono,
        idioma,
        moneda,
      });
      setMensaje(response.data.mensaje || 'Cuenta creada correctamente. Revisa tu correo para verificarla.');
      setError('');
      // limpiar campos
      setNombre('');
      setEmail('');
      setPassword('');
      setTelefono('');
      setIdioma('');
      setMoneda('');
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.error || 'Error al registrar');
      setMensaje('');
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

        <input
          type="tel"
          placeholder="Número de celular"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          pattern="[0-9]{10}"
          title="Debe contener 10 dígitos"
          required
        />

        <select
          value={idioma}
          onChange={(e) => setIdioma(e.target.value)}
          required
        >
          <option value="">Selecciona idioma</option>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="fr">Francés</option>
        </select>

        <select
          value={moneda}
          onChange={(e) => setMoneda(e.target.value)}
          required
        >
          <option value="">Selecciona moneda</option>
          <option value="MXN">Pesos Mexicanos (MXN)</option>
          <option value="USD">Dólares (USD)</option>
          <option value="EUR">Euros (EUR)</option>
        </select>

        {/* Espacio reservado para el captcha */}
        <div style={{ margin: '10px 0', border: '1px dashed gray', padding: '15px', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>Aquí irá el Captcha</p>
        </div>

        <button type="submit">Registrarse</button>

        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Registro;
