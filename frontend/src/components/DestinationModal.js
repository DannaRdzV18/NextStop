import React, { useState } from 'react';
import './DestinationModal.css';
import { IoLocationSharp } from 'react-icons/io5';
import { MdOutlineDirectionsTransit } from 'react-icons/md';

function DestinationModal({ onClose }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [transport, setTransport] = useState('vuelos');
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="destination-modal" onClick={(e) => e.stopPropagation()}>
        {/* Botón de cierre */}
        <button className="close-modal-btn" onClick={onClose}>✕</button>

        {/* Título */}
        <h3 className="modal-title">Agregar destino</h3>

        {/* CONTENIDO PRINCIPAL CON SCROLL */}
        <div className="modal-content-scroll">
          {!showOptions ? (
            <div className="destination-inputs">
              <div className="form-group">
                <label><IoLocationSharp className="icon" /> Destino</label>
                <input
                  type="text"
                  placeholder="Buscar destino..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>¿Cuántos días estarás aquí?</label>
                <input
                  type="number"
                  placeholder="Número de días"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label><MdOutlineDirectionsTransit className="icon" /> Tipo de transporte</label>
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="input-field"
                >
                  <option value="vuelos">Vuelos</option>
                  <option value="autobuses">Autobuses</option>
                </select>
              </div>

              <button className="primary-btn" onClick={() => setShowOptions(true)}>
                Mostrar opciones
              </button>
            </div>
          ) : (
            <div className="options-section">
              {transport === 'vuelos' && (
                <>
                  <h4>Opciones de vuelos</h4>
                  <div className="cards-container">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="option-card">
                        <div className="option-image"></div>
                        <div className="option-info">
                          <strong>Vuelo {i}</strong>
                          <p>Detalles del vuelo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {transport === 'autobuses' && (
                <>
                  <h4>Opciones de autobuses</h4>
                  <div className="cards-container">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="option-card">
                        <div className="option-image"></div>
                        <div className="option-info">
                          <strong>Autobús {i}</strong>
                          <p>Horario y duración</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h4>Opciones de hoteles</h4>
              <div className="cards-container">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="option-card">
                    <div className="option-image"></div>
                    <div className="option-info">
                      <strong>Hotel {i}</strong>
                      <p>Presupuesto estimado</p>
                    </div>
                  </div>
                ))}
              </div>

              <h4>Actividades</h4>
              <div className="cards-container">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="option-card">
                    <div className="option-image"></div>
                    <div className="option-info">
                      <strong>Actividad {i}</strong>
                      <p>Descripción corta</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTONES FIJOS ABAJO */}
        <div className="modal-actions">
          {showOptions ? (
            <div className="destination-buttons">
              <button className="destination-btn btn-back" onClick={() => setShowOptions(false)}>
                Volver a la búsqueda
              </button>
              <button className="destination-btn btn-save">Guardar destino</button>
              <button className="destination-btn btn-add">Agregar otro destino</button>
            </div>
          ) : (
            <button className="secondary-btn" onClick={onClose}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DestinationModal;
