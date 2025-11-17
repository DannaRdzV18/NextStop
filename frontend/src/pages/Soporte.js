import React, { useState } from 'react';
import './Soporte.css';

function Soporte() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Crear link mailto que abre el cliente de correo
        const mailtoLink = `mailto:nextstop.itver@gmail.com?subject=${encodeURIComponent(formData.asunto)}&body=${encodeURIComponent(
            `Nombre: ${formData.nombre}\nEmail: ${formData.email}\n\nMensaje:\n${formData.mensaje}`
        )}`;
        window.location.href = mailtoLink;
        setEnviado(true);
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
                        />
                    </div>

                    <div className="form-group">
                        <label>Asunto</label>
                        <select
                            value={formData.asunto}
                            onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                            required
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
                        />
                    </div>

                    <button type="submit" className="btn-enviar">
                        Enviar mensaje
                    </button>
                </form>
            ) : (
                <div className="mensaje-enviado">
                    <h3>✓ Mensaje preparado</h3>
                    <p>Tu cliente de correo se abrirá para enviar el mensaje.</p>
                    <button onClick={() => setEnviado(false)}>Enviar otro mensaje</button>
                </div>
            )}

            <div className="contacto-directo">
                <h3>Contacto directo</h3>
                <p>📧 <strong>Email:</strong> nextstop.itver@gmail.com</p>
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