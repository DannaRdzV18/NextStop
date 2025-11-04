// src/components/VerificacionCodigo.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VerificacionCodigo.css';

function VerificacionCodigo() {
  const navigate = useNavigate();

  return (
    <div className="verificacion-container">
      <div className="verificacion-card">
        <h2>✅ Verificación exitosa</h2>
        <p>Tu cuenta ha sido verificada correctamente.</p>
        <button onClick={() => navigate('/')}>Ir al inicio</button>
      </div>
    </div>
  );
}

export default VerificacionCodigo;
