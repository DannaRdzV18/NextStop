import './VerificacionEnlace.css';
import React from 'react';

function VerificacionEnlace() {
  const reenviarVerificacion = async () => {
    try {
      // Aquí haces la llamada a tu API para reenviar el correo
      alert('Se envió un nuevo correo de verificación.');
    } catch (err) {
      alert('Error al reenviar el correo.');
    }
  };

  return (
    <div className="verificacion-container">
      <div className="verificacion-card">
        <h2>❌ No se pudo verificar tu cuenta</h2>
        <p>El enlace puede haber expirado o ser inválido.</p>
        <button onClick={reenviarVerificacion}>Reenviar verificación</button>
      </div>
    </div>
  );
}

export default VerificacionEnlace;
