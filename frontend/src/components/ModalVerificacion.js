import React from 'react';
import axios from 'axios';
import './ModalVerificacion.css';

function ModalVerificacion({ estado, mensaje, onClose }) {
  const reenviarCorreo = async () => {
    let email = localStorage.getItem('email');

    // Si no hay email guardado, pedirlo manualmente
    if (!email) {
      email = prompt('📧 Ingresa tu correo para reenviar el link de verificación:');
      if (!email) return alert('⚠ Debes ingresar un correo válido.');
      localStorage.setItem('email', email);
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return alert('❌ El correo ingresado no es válido.');
    }

    try {
      const response = await axios.post('https://nextstop-app-u9cvd.ondigitalocean.app/api/usuarios/reenviar-codigo/', { email });

      // Mensaje exitoso desde el backend
      if (response.data.mensaje) {
        alert('✅ ' + response.data.mensaje);
      } else {
        alert('✅ Se ha reenviado el correo de verificación.');
      }
    } catch (err) {
      console.error('Error al reenviar correo:', err);
      if (err.response?.data?.error) {
        alert('❌ ' + err.response.data.error);
      } else {
        alert('❌ Error desconocido al reenviar el correo.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>×</button>

        {estado === 'exito' ? (
          <>
            <h2>✅ Verificación exitosa</h2>
            <p>{mensaje}</p>
          </>
        ) : (
          <>
            <h2>❌ Verificación incompleta</h2>
            <p>{mensaje}</p>
            <button className="reenviar-btn" onClick={reenviarCorreo}>
              Reenviar correo de verificación
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalVerificacion;