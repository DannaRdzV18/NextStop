import React, { useState, useEffect } from 'react';
import './DestinationModal.css';
import { IoLocationSharp } from 'react-icons/io5';
import { MdOutlineDirectionsTransit } from 'react-icons/md';

function DestinationModal({ onClose, addDestination }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [transport, setTransport] = useState('vuelos');
  const [showOptions, setShowOptions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch de sugerencias cuando cambia destination
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (destination.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/external/locations/?query=${destination}`);
        if (!response.ok) throw new Error('Error al obtener sugerencias');

        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300); // 300ms debounce
    return () => clearTimeout(delayDebounce);
  }, [destination]);

  const handleSelectSuggestion = (item) => {
    setDestination(item.nombre);
    setSuggestions([]);
  };

  const handleSaveDestination = () => {
    if (!destination || !days) return;

    const newDestination = {
      nombre: destination,
      dias: days,
      transporte: transport,
    };

    if (addDestination) addDestination(newDestination); // función pasada desde TripPlanner para guardar en tripData
    setDestination('');
    setDays('');
    setTransport('vuelos');
    setShowOptions(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="destination-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✕</button>
        <h3 className="modal-title">Agregar destino</h3>

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
                {loading && <p>Cargando...</p>}
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        {item.nombre} ({item.codigo})
                      </li>
                    ))}
                  </ul>
                )}
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
              {/* Aquí puedes mantener tu sección de vuelos, autobuses, hoteles y actividades */}
            </div>
          )}
        </div>

        <div className="modal-actions">
          {showOptions ? (
            <div className="destination-buttons">
              <button className="destination-btn btn-back" onClick={() => setShowOptions(false)}>
                Volver a la búsqueda
              </button>
              <button className="destination-btn btn-save" onClick={handleSaveDestination}>
                Guardar destino
              </button>
              <button className="destination-btn btn-add" onClick={handleSaveDestination}>
                Agregar otro destino
              </button>
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