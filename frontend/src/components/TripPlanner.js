import React, { useState, useEffect } from 'react';
import './TripPlanner.css';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import { IoLocationSharp, IoPeople } from 'react-icons/io5';
import { MdCalendarToday } from 'react-icons/md';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import DestinationModal from './DestinationModal';
import FinalItineraryModal from './FinalItineraryModal'; // 🔹 Nuevo modal final

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
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [isLoadingOrigin, setIsLoadingOrigin] = useState(false);
  const [originDisplay, setOriginDisplay] = useState('');

  // 🔹 Reiniciar datos después de crear itinerario
  const resetTripData = () => {
    setTripData({
      origin: '',
      departureDate: null,
      returnDate: null,
      adults: 1,
      seniors: 0,
      children: 0,
      budget: '',
      destinations: [],
    });
  };

  // 🔹 Añadir destino
  const addDestination = (nuevoDestino) => {
    setTripData((prev) => {
      const prevDestinations = prev.destinations || [];
      const newDestinations = [...prevDestinations, nuevoDestino];

      const usedDays = newDestinations.reduce((s, d) => s + Number(d.dias ?? d.days ?? 0), 0);
      const totalDays = calculateDurationFromPrev(prev);

      if (totalDays > 0 && usedDays >= totalDays) {
        // Cierra modal de destino y abre modal final
        setTimeout(() => setShowItineraryModal(true), 100);
      }

      return { ...prev, destinations: newDestinations };
    });
  };

  const calculateDurationFromPrev = (prevState) => {
    if (prevState.departureDate && prevState.returnDate) {
      const start = new Date(prevState.departureDate);
      const end = new Date(prevState.returnDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  // 🔹 Ya no requiere sesión
  const [usuario, setUsuario] = useState(() => {
    const storedUser = localStorage.getItem('usuario');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('usuario');
      setUsuario(storedUser ? JSON.parse(storedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔹 Limpia destinos si cambian datos principales
  useEffect(() => {
    if ((tripData.destinations || []).length > 0) {
      setTripData((prev) => ({ ...prev, destinations: [] }));
      console.log('TripPlanner: campos principales cambiaron -> destinos reiniciados');
    }
  }, [tripData.origin, tripData.departureDate, tripData.returnDate, tripData.budget]);

  const handleInputChange = (field, value) => {
    setTripData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchCitySuggestions = async (query) => {
    if (query.length < 2) {
      setOriginSuggestions([]);
      return;
    }
    try {
      setIsLoadingOrigin(true);
      const response = await fetch(`https://nextstop-app-u9cvd.ondigitalocean.app/api/external/locations/?query=${query}`);
      const data = await response.json();
      setOriginSuggestions(data);
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
    } finally {
      setIsLoadingOrigin(false);
    }
  };

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

  const areFieldsComplete = () => {
    return tripData.origin && tripData.departureDate && tripData.returnDate && totalPeople > 0 && tripData.budget;
  };

  const handleOpenDestinationModal = () => {
    if (!areFieldsComplete()) {
      alert('Por favor completa todos los campos antes de agregar destinos.');
      return;
    }
    if (calculateDuration() <= 0) {
      alert('Asegúrate de que las fechas sean válidas y que la duración sea mayor a 0.');
      return;
    }
    setShowDestinationModal(true);
  };

  return (
    <div className="trip-planner">
      <h3 className="trip-title">Crea y planea tu viaje</h3>
      <p className="trip-subtitle">Comencemos con los datos básicos de tu viaje</p>

      {/* Origen */}
        <div className="form-group">
          <label>
            <IoLocationSharp className="icon" />
            ¿Desde dónde inicias tu viaje?
          </label>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              placeholder="Escribe tu ciudad de origen..."
              value={originDisplay} // 👈 mostramos el nombre, no el código
              onChange={(e) => {
                const value = e.target.value;
                setOriginDisplay(value); // actualiza lo visible
                handleInputChange('origin', ''); // limpia el código
                fetchCitySuggestions(value); // busca sugerencias
              }}
              className="input-field"
            />
            {originSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {originSuggestions.map((sug, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      handleInputChange('origin', sug.codigo); // 👈 guarda el código real
                      setOriginDisplay(sug.nombre || sug.codigo); // 👈 muestra el nombre
                      setOriginSuggestions([]); // limpia lista
                    }}
                    className="suggestion-item"
                  >
                    {sug.nombre} ({sug.codigo})
                  </li>
                ))}
              </ul>
            )}
            {isLoadingOrigin && <div className="loading-text">Buscando...</div>}
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

      {/* Personas y presupuesto */}
      <div className="form-row spaced">
        <div className="form-group">
          <label>
            <IoPeople className="icon" />
            ¿Cuántas personas van?
          </label>
          <div className="person-selector" onClick={() => setShowPersonModal(true)}>
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
        <button className="add-destination-btn" onClick={handleOpenDestinationModal}>
          Agregar destinos →
        </button>
      </div>

      {/* Modal destinos */}
      {showDestinationModal && (
        <DestinationModal
          onClose={() => setShowDestinationModal(false)}
          addDestination={addDestination}
          tripData={tripData}
          totalDays={calculateDuration()}
          currentDestinations={tripData.destinations || []}
        />
      )}

      {/* Modal final de itinerario */}
      {showItineraryModal && (
        <FinalItineraryModal
          onClose={() => {
            setShowItineraryModal(false);
            resetTripData(); // 🔹 Reinicia al cerrar
          }}
          tripData={tripData}
        />
      )}

      {/* Modal personas */}
      {showPersonModal && (
        <div className="modal-overlay" onClick={() => setShowPersonModal(false)}>
          <div className="person-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowPersonModal(false)}>
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
                  onClick={() => handleInputChange('adults', Math.max(1, tripData.adults - 1))}
                  className="control-btn"
                >
                  −
                </button>
                <span className="person-count">{tripData.adults}</span>
                <button
                  onClick={() => handleInputChange('adults', tripData.adults + 1)}
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
                  onClick={() => handleInputChange('seniors', Math.max(0, tripData.seniors - 1))}
                  className="control-btn"
                >
                  −
                </button>
                <span className="person-count">{tripData.seniors}</span>
                <button
                  onClick={() => handleInputChange('seniors', tripData.seniors + 1)}
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
                  onClick={() => handleInputChange('children', Math.max(0, tripData.children - 1))}
                  className="control-btn"
                >
                  −
                </button>
                <span className="person-count">{tripData.children}</span>
                <button
                  onClick={() => handleInputChange('children', tripData.children + 1)}
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
