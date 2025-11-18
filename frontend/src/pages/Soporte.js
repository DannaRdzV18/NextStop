import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Soporte.css';

function Soporte() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setError('');

        // Variables de entorno (configuradas en .env.local y DigitalOcean)
        const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
        const TEMPLATE_CONTACT = process.env.REACT_APP_EMAILJS_TEMPLATE_CONTACT;
        const TEMPLATE_AUTOREPLY = process.env.REACT_APP_EMAILJS_TEMPLATE_AUTOREPLY;
        const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

        const templateParams = {
            nombre: formData.nombre,
            email: formData.email,
            asunto: formData.asunto,
            mensaje: formData.mensaje
        };

        try {
            // Enviar email a soporte
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_CONTACT,
                templateParams,
                PUBLIC_KEY
            );

            // Enviar auto-reply al usuario
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_AUTOREPLY,
                templateParams,
                PUBLIC_KEY
            );

            setEnviado(true);
            setEnviando(false);
            setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
        } catch (error) {
            console.error('Error al enviar:', error);
            setError('Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.');
            setEnviando(false);
        }
    };

    return (
        <div className="soporte-container">
            <h2>Contactar a Soporte</h2>
            <p className="soporte-subtitle">
                ¿Tienes dudas sobre tu viaje o problemas con la plataforma? Contáctanos.
            </p>

            {!enviado ? (
                <form onSubmit={handleSubmit} className="soporte-form">
                    <div className="form-group">
                        <label>Nombre completo</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Tu nombre"
                            disabled={enviando}
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="tu@email.com"
                            disabled={enviando}
                        />
                    </div>

                    <div className="form-group">
                        <label>Asunto</label>
                        <select
                            value={formData.asunto}
                            onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                            required
                            disabled={enviando}
                        >
                            <option value="">Selecciona un tema</option>
                            <option value="Problema técnico">Problema técnico</option>
                            <option value="Duda sobre mi itinerario">Duda sobre mi itinerario</option>
                            <option value="Sugerencia">Sugerencia</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Mensaje</label>
                        <textarea
                            required
                            value={formData.mensaje}
                            onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                            placeholder="Describe tu duda o problema..."
                            rows="6"
                            disabled={enviando}
                        />
                    </div>

                    {error && <p className="error-mensaje">{error}</p>}

                    <button type="submit" className="btn-enviar" disabled={enviando}>
                        {enviando ? 'Enviando...' : 'Enviar mensaje'}
                    </button>
                </form>
            ) : (
                <div className="mensaje-enviado">
                    <h3>✓ Mensaje enviado exitosamente</h3>
                    <p>Hemos enviado una confirmación a tu correo electrónico.</p>
                    <p>Te responderemos a la brevedad.</p>
                    <button onClick={() => setEnviado(false)}>Enviar otro mensaje</button>
                </div>
            )}

            <div className="contacto-directo">
                <h3>Contacto directo</h3>
                <p>📧 <strong>Email:</strong> nextstopcompany@gmail.com</p>
                <p>🕐 <strong>Horario:</strong> Lun - Vie, 10:00 AM - 6:00 PM</p>
            </div>

            <div className="recursos-utiles">
                <h3>Recursos útiles</h3>
                <ul>
                    <li>
                        <a href="https://www.world-airport-codes.com/" target="_blank" rel="noopener noreferrer">
                            🛫 Códigos de aeropuertos
                        </a>
                    </li>
                    <li>
                        <a href="https://www.iata.org/en/publications/directories/code-search/" target="_blank" rel="noopener noreferrer">
                            🌍 Códigos IATA de ciudades
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Soporte;