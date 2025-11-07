import React, { useState } from 'react';
import './TripPlanner.css';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import { IoLocationSharp, IoPeople } from 'react-icons/io5';
import { MdCalendarToday } from 'react-icons/md';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import DestinationModal from './DestinationModal'; // ✅ Importación del modal

registerLocale('es', es);

function TripPlanner() {
  const [tripData, setTripData] = useState({
    origin: '',
    departureDate: null,
    returnDate: null,
    adults: 1,
    seniors: 0,
    children: 0,
    budget: '',
    destinations: [],
  });

  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

  // 🔍 Estados para el autocompletado
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [isLoadingOrigin, setIsLoadingOrigin] = useState(false);

  // 🧠 Maneja cambios de datos del viaje
  const handleInputChange = (field, value) => {
    setTripData({ ...tripData, [field]: value });
  };

  // 🧭 Llamada a tu endpoint de ubicaciones Amadeus
  const fetchCitySuggestions = async (query) => {
    if (query.length < 2) {
      setOriginSuggestions([]);
      return;
    }

    try {
      setIsLoadingOrigin(true);
      const response = await fetch(`http://localhost:8000/api/external/locations/?query=${query}`);
      const data = await response.json();
      setOriginSuggestions(data);
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
    } finally {
      setIsLoadingOrigin(false);
    }
  };

  // 📅 Calcula duración del viaje
  const calculateDuration = () => {
    if (tripData.departureDate && tripData.returnDate) {
      const start = new Date(tripData.departureDate);
      const end = new Date(tripData.returnDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const totalPeople = tripData.adults + tripData.seniors + tripData.children;

  return (
    <div className="trip-planner">
      <h3 className="trip-title">Crea y planea tu viaje</h3>
      <p className="trip-subtitle">Comencemos con los datos básicos de tu viaje</p>

      {/* Origen con autocompletado */}
      <div className="form-group">
        <label>
          <IoLocationSharp className="icon" />
          ¿Desde dónde inicias tu viaje?
        </label>

        <div className="autocomplete-wrapper">
          <input
            type="text"
            placeholder="Escribe tu ciudad de origen..."
            value={tripData.origin}
            onChange={(e) => {
              const value = e.target.value;
              handleInputChange('origin', value);
              fetchCitySuggestions(value);
            }}
            className="input-field"
          />

          {/* Lista de sugerencias */}
          {originSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {originSuggestions.map((sug, index) => (
                <li
                  key={index}
                  onClick={() => {
                    handleInputChange('origin', sug.nombre);
                    setOriginSuggestions([]);
                  }}
                  className="suggestion-item"
                >
                  {sug.nombre} ({sug.codigo})
                </li>
              ))}
            </ul>
          )}

          {isLoadingOrigin && (
            <div className="loading-text">Buscando...</div>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div className="form-row spaced">
        <div className="form-group">
          <label>
            <MdCalendarToday className="icon" />
            Fecha de salida
          </label>
          <DatePicker
            selected={tripData.departureDate}
            onChange={(date) => handleInputChange('departureDate', date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/aaaa"
            className="input-field"
            minDate={new Date()}
            locale="es"
          />
        </div>

        <div className="form-group">
          <label>
            <MdCalendarToday className="icon" />
            Fecha de regreso
          </label>
          <DatePicker
            selected={tripData.returnDate}
            onChange={(date) => handleInputChange('returnDate', date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/aaaa"
            className="input-field"
            minDate={tripData.departureDate || new Date()}
            locale="es"
          />
        </div>
      </div>

      {/* Duración */}
      <div className="duration-display">
        <strong>Duración del viaje:</strong> {calculateDuration()} días
      </div>

      {/* Personas y Presupuesto */}
      <div className="form-row spaced">
        <div className="form-group">
          <label>
            <IoPeople className="icon" />
            ¿Cuántas personas van?
          </label>
          <div
            className="person-selector"
            onClick={() => setShowPersonModal(true)}
          >
            {totalPeople} {totalPeople === 1 ? 'persona' : 'personas'}
          </div>
        </div>

        <div className="form-group">
          <label>
            <RiMoneyDollarCircleFill className="icon" />
            Presupuesto aproximado
          </label>
          <input
            type="text"
            placeholder="¿Cuánto planeas gastar?"
            value={tripData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Botón agregar destinos */}
      <div className="btn-container">
        <button
          className="add-destination-btn"
          onClick={() => setShowDestinationModal(true)}
        >
          Agregar destinos →
        </button>
      </div>

      {/* Modal de destinos */}
      {showDestinationModal && (
        <DestinationModal onClose={() => setShowDestinationModal(false)} />
      )}

      {/* Modal de personas */}
      {showPersonModal && (
        <div className="modal-overlay" onClick={() => setShowPersonModal(false)}>
          <div className="person-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal-btn"
              onClick={() => setShowPersonModal(false)}
            >
              ✕
            </button>
            <h3>Personas</h3>
            <p className="modal-subtitle">¿Cuántos van?</p>

            {/* Adultos */}
            <div className="person-row">
              <div className="person-info">
                <strong>Adultos (de 18 a 64 años)</strong>
              </div>
              <div className="person-controls">
                <button
                  onClick={() =>
                    handleInputChange('adults', Math.max(1, tripData.adults - 1))
                  }
                  className="control-btn"
                >
                  −
                </button>
                <span className="person-count">{tripData.adults}</span>
                <button
                  onClick={() =>
                    handleInputChange('adults', tripData.adults + 1)
                  }
                  className="control-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Adultos mayores */}
            <div className="person-row">
              <div className="person-info">
                <strong>Adultos mayores (65 años en adelante)</strong>
              </div>
              <div className="person-controls">
                <button
                  onClick={() =>
                    handleInputChange('seniors', Math.max(0, tripData.seniors - 1))
                  }
                  className="control-btn"
                >
                  −
                </button>
                <span className="person-count">{tripData.seniors}</span>
                <button
                  onClick={() =>
                    handleInputChange('seniors', tripData.seniors + 1)
                  }
                  className="control-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Niños */}
            <div className="person-row">
              <div className="person-info">
                <strong>Niños (0 a 17 años)</strong>
              </div>
              <div className="person-controls">
                <button
                  onClick={() =>
                    handleInputChange('children', Math.max(0, tripData.children - 1))
                  }
                  className="control-btn"
                >
                  −
                </button>
                <span className="person-count">{tripData.children}</span>
                <button
                  onClick={() =>
                    handleInputChange('children', tripData.children + 1)
                  }
                  className="control-btn"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripPlanner;