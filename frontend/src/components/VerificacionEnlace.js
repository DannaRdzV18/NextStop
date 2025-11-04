// src/components/VerificacionEnlace.js
import './VerificacionEnlace.css';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

function VerificacionEnlace() {
  const [estado, setEstado] = useState('verificando'); // verificando | exito | error
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setEstado('error');
      return;
    }

    const verificar = async () => {
      try {
        const response = await API.get(`api/usuarios/verificar-enlace/?token=${token}`);
        if (response.data.exito) {
          setEstado('exito');
        } else {
          setEstado('error');
        }
      } catch (err) {
        console.error(err);
        setEstado('error');
      }
    };

    verificar();
  }, [location.search]);

  const reenviarVerificacion = async () => {
    try {
      await API.post('api/usuarios/reenviar-verificacion/', { /* email opcional */ });
      alert('Se envió un nuevo correo de verificación.');
    } catch (err) {
      alert('Error al reenviar el correo.');
    }
  };

  return (
    <div className="verificacion-container">
      <div className="verificacion-card">
        {estado === 'verificando' && (
          <>
            <h2>⏳ Verificando tu cuenta...</h2>
            <p>Por favor espera un momento.</p>
          </>
        )}

        {estado === 'exito' && (
          <>
            <h2>✅ Verificación exitosa</h2>
            <p>Tu cuenta ha sido verificada correctamente.</p>
            <button onClick={() => navigate('/')}>Ir a la página principal</button>
          </>
        )}

        {estado === 'error' && (
          <>
            <h2>❌ No se pudo verificar tu cuenta</h2>
            <p>El enlace puede haber expirado o ser inválido.</p>
            <button onClick={reenviarVerificacion}>Reenviar verificación</button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerificacionEnlace;
