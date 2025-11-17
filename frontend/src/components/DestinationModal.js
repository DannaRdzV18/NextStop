import React, { useState, useEffect } from 'react';
import './DestinationModal.css';
import { IoLocationSharp, IoInformationCircleOutline } from 'react-icons/io5';
import { convertToMXN } from '../utils/convertToMXN';

function DestinationModal({ onClose, onFinalize, addDestination, tripData, totalDays = 0, currentDestinations = [] }) {
  const [destination, setDestination] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [days, setDays] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState([]);

  const [noFlightsMessage, setNoFlightsMessage] = useState('');
  const [noHotelsMessage, setNoHotelsMessage] = useState('');
  const [noActivitiesMessage, setNoActivitiesMessage] = useState('');
  const [error, setError] = useState('');

  // ⭐ AÑADIDO — Estados para selección
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);


  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const formattedDeparture = tripData?.departureDate ? formatDate(tripData.departureDate) : '';
  const destinoDias = Number(days) || 0;
  const salida = new Date(tripData?.departureDate || new Date());
  salida.setDate(salida.getDate() + destinoDias);
  const formattedCheckOut = salida.toISOString().split("T")[0];

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (displayName.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`https://nextstop-app-u9cvd.ondigitalocean.app/api/external/locations/?query=${encodeURIComponent(displayName)}`);
        if (!res.ok) throw new Error('Error');
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [displayName]);

  const handleSelectSuggestion = (item) => {
    setDestination(item.codigo || '');
    setDisplayName(item.nombre || item.codigo || '');
    setSuggestions([]);
  };

  const fetchOptions = async () => {
    if (!destination || !days || !tripData) return;
    const { origin, adults } = tripData;
    const totalPeople = adults;
    const budgetNumber = Number(tripData.budget || 0);

    setLoadingOptions(true);
    setFlights([]); setHotels([]); setActivities([]);
    setNoFlightsMessage(''); setNoHotelsMessage(''); setNoActivitiesMessage('');

    try {
      const flightRes = await fetch(
        `https://nextstop-app-u9cvd.ondigitalocean.app/api/external/vuelos/?origen=${encodeURIComponent(origin)}&destino=${encodeURIComponent(destination)}&fecha_salida=${formattedDeparture}`
      );
      if (flightRes.ok) {
        const flightData = await flightRes.json();
        if (!Array.isArray(flightData) || flightData.length === 0) {
          setFlights([]); setNoFlightsMessage('No hay vuelos disponibles en estas fechas.');
        } else setFlights(flightData.slice(0, 3));
      }

      const hotelRes = await fetch(
        `https://nextstop-app-u9cvd.ondigitalocean.app/api/external/hoteles/?ciudad=${encodeURIComponent(destination)}&fecha_entrada=${formattedDeparture}&fecha_salida=${formattedCheckOut}&personas=${totalPeople}`
      );
      if (hotelRes.ok) {
        const hotelData = await hotelRes.json();
        if (!Array.isArray(hotelData) || hotelData.length === 0) {
          setHotels([]); setNoHotelsMessage('No hay hoteles disponibles en estas fechas.');
        } else setHotels(hotelData.slice(0, 3));
      }

      const actRes = await fetch(
        `https://nextstop-app-u9cvd.ondigitalocean.app/api/external/activities/?ciudad=${encodeURIComponent(destination)}&fecha_inicio=${formattedDeparture}`
      );
      if (actRes.ok) {
        const actData = await actRes.json();
        if (!Array.isArray(actData) || actData.length === 0) {
          setActivities([]); setNoActivitiesMessage('No se encontraron actividades.');
        } else setActivities(actData.slice(0, 3));
      }

    } catch (err) {
      console.error('fetch options error', err);
      setNoFlightsMessage('Error al cargar opciones.');
      setNoHotelsMessage('Error al cargar opciones.');
      setNoActivitiesMessage('Error al cargar opciones.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleShowOptions = async () => {
    setError('');
    if (!destination || !days) {
      setError('Completa destino y días antes de mostrar opciones.');
      return;
    }
    const usedDays = (currentDestinations || []).reduce((s, d) => s + Number(d.dias ?? d.days ?? 0), 0);
    const remaining = totalDays - usedDays;
    if (Number(days) <= 0) {
      setError('El número de días debe ser mayor a 0.');
      return;
    }
    if (Number(days) > remaining) {
      setError(`Solo te quedan ${remaining} días disponibles.`);
      return;
    }
    setError('');
    setShowOptions(true);
    await fetchOptions();
  };

  const handleSaveDestinationAndClose = async () => {
    if (!destination || !days) {
      setError('Completa destino y días antes de guardar.');
      return;
    }

    // ⭐ CAMBIADO — ahora incluye seleccionados
    const newDestination = {
      nombre: destination,
      dias: Number(days),
      flights,
      hotels,
      activities,
      selectedFlight: selectedFlight !== null ? flights[selectedFlight] : null,
      selectedHotel: selectedHotel !== null ? hotels[selectedHotel] : null,
      selectedActivity: selectedActivity !== null ? activities[selectedActivity] : null
    };
    // Aquí construyes el payload
    const payload = {
      id_itinerario: tripData.itineraryId, // asegúrate de tener el id del itinerario
      destino: newDestination
    };

    try {
      const res = await fetch('https://nextstop-app-u9cvd.ondigitalocean.app/api/itinerarios/agregar-destino/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al guardar destino');

      // Si hay función para actualizar el front
      if (addDestination) addDestination(newDestination);
      onClose && onClose();

    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el destino. Intenta de nuevo.');
    }
  };

  const handleSaveDestinationAndContinue = () => {
    if (!destination || !days) {
      setError('Completa destino y días antes de guardar.');
      return;
    }
    const usedDays = (currentDestinations || []).reduce((s, d) => s + Number(d.dias ?? d.days ?? 0), 0);
    const remaining = totalDays - usedDays;
    if (Number(days) > remaining) {
      setError(`Solo te quedan ${remaining} días disponibles.`);
      return;
    }
    // ⭐ CAMBIADO — incluye seleccionados
    const newDestination = {
      nombre: destination,
      dias: Number(days),
      flights,
      hotels,
      activities,
      selectedFlight: selectedFlight !== null ? flights[selectedFlight] : null,
      selectedHotel: selectedHotel !== null ? hotels[selectedHotel] : null,
      selectedActivity: selectedActivity !== null ? activities[selectedActivity] : null
    };
    if (addDestination) addDestination(newDestination);

    setDestination('');
    setDays('');
    setFlights([]); setHotels([]); setActivities([]);
    // ⭐ AÑADIDO — reset selección
    setSelectedFlight(null);
    setSelectedHotel(null);
    setSelectedActivity(null);

    setShowOptions(false);
  };

  // 🔹 Cálculo para mostrar botones correctos
  const usedDays = (currentDestinations || []).reduce((s, d) => s + Number(d.dias ?? d.days ?? 0), 0);
  const remaining = totalDays - usedDays;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="destination-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✕</button>
        <h3 className="modal-title">Agregar destino</h3>

        <div className="modal-content-scroll">
          {!showOptions ? (
            <div className="destination-inputs">
              <div className="form-group" style={{ position: 'relative' }}>
                <label><IoLocationSharp className="icon" /> Destino</label>
                <input
                  type="text"
                  placeholder="Buscar destino..."
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setDestination('');
                  }}
                  className="input-field"
                />
                {loadingSuggestions && <p>Cargando...</p>}
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((item, index) => (
                      <li key={index} onClick={() => handleSelectSuggestion(item)}>
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

              {error && <p className="error-text">{error}</p>}

              <div className="destination-buttons">
                <button className="destination-btn btn-show" onClick={handleShowOptions}>
                  Mostrar opciones
                </button>
                <button className="destination-btn btn-cancel" onClick={onClose}>
                  Cancelar
                </button>
              </div>

              <div className="info-link">
                <IoInformationCircleOutline className="info-icon" />
                <a href="https://www.world-airport-codes.com/" target="_blank" rel="noopener noreferrer">
                  ¿Tienes dudas sobre tus viajes? Haz clic aquí
                </a>
              </div>
            </div>

          ) : (

            <div className="options-section">
              {loadingOptions ? <p>Cargando opciones...</p> : (
                <>
                  {/* ⭐⭐ VUELOS — ahora seleccionables */}
                  <div className="cards-section">
                    <h4>Vuelos disponibles</h4>
                    {flights.map((f, i) => {
                      const segment = f.itineraries?.[0]?.segments?.[0] || {};
                      return (
                        <div
                          key={i}
                          className={`card ${selectedFlight === i ? "selected" : ""}`}
                          onClick={() => setSelectedFlight(i)}
                        >
                          <p>Aerolínea: {segment.carrierCode}</p>
                          <p>{segment.departure.iataCode} → {segment.arrival.iataCode}</p>
                        </div>
                      );
                    })}
                    {/* ⭐ MENSAJE SI NO HAY VUELOS ⭐ */}
                    {noFlightsMessage && <p className="no-options">{noFlightsMessage}</p>}
                  </div>
                  {/* ⭐⭐ HOTELES — seleccionables */}
                  <div className="cards-section">
                    <h4>Hoteles</h4>
                    {hotels.map((h, i) => (
                      <div
                        key={i}
                        className={`card ${selectedHotel === i ? "selected" : ""}`}
                        onClick={() => setSelectedHotel(i)}
                      >
                        <p>{h.name}</p>
                        <p>{h.rating}★</p>
                      </div>
                    ))}
                    {/* ⭐ MENSAJE SI NO HAY HOTELES ⭐ */}
                    {noHotelsMessage && <p className="no-options">{noHotelsMessage}</p>}
                  </div>
                  {/* ⭐⭐ ACTIVIDADES — seleccionables */}
                  <div className="cards-section">
                    <h4>Actividades</h4>
                    {activities.map((a, i) => (
                      <div
                        key={i}
                        className={`card ${selectedActivity === i ? "selected" : ""}`}
                        onClick={() => setSelectedActivity(i)}
                      >
                        <p>{a.name}</p>
                        <p>Tipo: {a.type}</p>
                      </div>
                    ))}
                    {/* ⭐ MENSAJE SI NO HAY ACTIVIDADES ⭐ */}
                    {noActivitiesMessage && <p className="no-options">{noActivitiesMessage}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ✅ BOTONES DE OPCIONES */}
        {showOptions && (
          <div className="destination-buttons">
            <button className="destination-btn btn-back" onClick={() => setShowOptions(false)}>
              Volver
            </button>

            {/* 🔹 Mostrar solo 2 botones cuando se cumplan los días */}
            {remaining - Number(days) <= 0 ? (
              <button className="destination-btn btn-add" onClick={async () => {
                await handleSaveDestinationAndClose();
                onFinalize && onFinalize();
              }}>
                Finalizar itinerario
              </button>
            ) : (
              <>
                <button className="destination-btn btn-save" onClick={handleSaveDestinationAndClose}>
                  Guardar destino
                </button>
                <button className="destination-btn btn-add" onClick={handleSaveDestinationAndContinue}>
                  Agregar otro destino
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationModal;
