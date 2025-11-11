import React, { useState, useEffect } from 'react';
import './DestinationModal.css';
import { IoLocationSharp } from 'react-icons/io5';
import { MdOutlineDirectionsTransit } from 'react-icons/md';
import { convertToMXN } from '../utils/convertToMXN';

function DestinationModal({ onClose, addDestination, tripData }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [transport, setTransport] = useState('vuelos');
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

  // Formateo de fechas
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

  // Fetch de sugerencias
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (destination.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await fetch(`http://localhost:8000/api/external/locations/?query=${destination}`);
        if (!response.ok) throw new Error('Error al obtener sugerencias');
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [destination]);

  const handleSelectSuggestion = (item) => {
    setDestination(item.codigo || item.nombre);
    setSuggestions([]);
  };

  // Fetch de opciones
  const fetchOptions = async () => {
    if (!destination || !days || !tripData) return;

    const { origin, departureDate, adults, seniors, children, budget } = tripData;
    const totalPeople = adults + seniors + children;
    const budgetNumber = Number(budget);

    setLoadingOptions(true);

    try {
      // ✈ Vuelos
      if (transport === 'vuelos') {
        const flightRes = await fetch(
          `http://localhost:8000/api/external/vuelos/?origen=${encodeURIComponent(origin)}&destino=${encodeURIComponent(destination)}&fecha_salida=${formattedDeparture}`
        );
        if (!flightRes.ok) throw new Error(`Error vuelos: ${flightRes.status}`);
        const flightData = await flightRes.json();

        if (flightData.length === 0) {
          setFlights([]);
          setNoFlightsMessage('No hay vuelos disponibles en estas fechas.');
        } else {
          const vuelosFiltrados = flightData
            .filter(f => convertToMXN(f.price.total, f.price.currency) <= budgetNumber)
            .slice(0, 3);
          setFlights(vuelosFiltrados);

          setNoFlightsMessage(vuelosFiltrados.length === 0
            ? 'Hay vuelos disponibles, pero ninguno entra en tu presupuesto.'
            : ''
          );
        }
      } else {
        setFlights([]);
        setNoFlightsMessage('');
      }

      // 🏨 Hoteles
      const hotelRes = await fetch(
        `http://localhost:8000/api/external/hoteles/?ciudad=${encodeURIComponent(destination)}&fecha_entrada=${formattedDeparture}&fecha_salida=${formattedCheckOut}&personas=${adults}`
      );
      if (!hotelRes.ok) throw new Error(`Error hoteles: ${hotelRes.status}`);
      const hotelData = await hotelRes.json();

      if (hotelData.length === 0) {
        setHotels([]);
        setNoHotelsMessage('No hay hoteles disponibles en estas fechas.');
      } else {
        const hotelesFiltrados = hotelData
          .filter(h => (convertToMXN(h.price, h.currency) * destinoDias) <= budgetNumber)
          .slice(0, 3);
        setHotels(hotelesFiltrados);

        setNoHotelsMessage(hotelesFiltrados.length === 0
          ? 'Hay hoteles disponibles, pero ninguno entra en tu presupuesto.'
          : ''
        );
      }

      // 🎟 Actividades
      const actRes = await fetch(
        `http://localhost:8000/api/external/activities/?ciudad=${encodeURIComponent(destination)}&fecha_inicio=${formattedDeparture}`
      );
      if (!actRes.ok) throw new Error(`Error actividades: ${actRes.status}`);
      const actData = await actRes.json();

      setActivities(actData.slice(0, 3));
      setNoActivitiesMessage(actData.length === 0 ? 'No se encontraron actividades para estas fechas.' : '');

    } catch (error) {
      console.error('Error al cargar opciones:', error);
      setNoFlightsMessage('Error al cargar vuelos.');
      setNoHotelsMessage('Error al cargar hoteles.');
      setNoActivitiesMessage('Error al cargar actividades.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleShowOptions = async () => {
    setShowOptions(true);
    await fetchOptions();
  };

  const handleSaveDestination = () => {
    if (!destination || !days) return;
    const newDestination = {
      nombre: destination,
      dias: days,
      transporte: transport,
      flights,
      hotels,
      activities,
    };
    if (addDestination) addDestination(newDestination);
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

              <div className="form-group">
                <label><MdOutlineDirectionsTransit className="icon" /> Tipo de transporte</label>
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="input-field"
                >
                  <option value="vuelos">Vuelos</option>
                </select>
              </div>

              <button className="primary-btn" onClick={handleShowOptions}>
                Mostrar opciones
              </button>
            </div>
          ) : (
            <div className="options-section">
              {loadingOptions ? <p>Cargando opciones...</p> : (
                <>
                  {/* Vuelos */}
                  {transport === 'vuelos' && (
                    <div className="cards-section">
                      <h4>Vuelos disponibles</h4>
                      {noFlightsMessage && <p className="no-options-msg">{noFlightsMessage}</p>}
                      {flights.length > 0 && flights.map((f, i) => {
                        const segment = f.itineraries[0].segments[0];
                        return (
                          <div key={i} className="card">
                            <p>Aerolínea: {segment.carrierCode} | Vuelo: {segment.number}</p>
                            <p>{segment.departure.iataCode} → {segment.arrival.iataCode}</p>
                            <p>Salida: {new Date(segment.departure.at).toLocaleString()} | Llegada: {new Date(segment.arrival.at).toLocaleString()}</p>
                            <p>Duración: {f.itineraries[0].duration}</p>
                            <p>Precio: {convertToMXN(f.price.total, f.price.currency).toFixed(2)} MXN</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Hoteles */}
                  <div className="cards-section">
                    <h4>Hoteles</h4>
                    {noHotelsMessage && <p className="no-options-msg">{noHotelsMessage}</p>}
                    {hotels.length > 0 && hotels.map((h, i) => (
                      <div key={i} className="card">
                        <p>{h.name} ({h.rating}★)</p>
                        <p>Precio por noche: {convertToMXN(h.price, h.currency).toFixed(2)} MXN</p>
                        <p>Ubicación: {h.city}</p>
                        <p>Check-in: {h.checkIn || formattedDeparture} | Check-out: {h.checkOut || formattedCheckOut}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actividades */}
                  <div className="cards-section">
                    <h4>Actividades</h4>
                    {noActivitiesMessage && <p className="no-options-msg">{noActivitiesMessage}</p>}
                    {activities.length > 0 && activities.map((a, i) => (
                      <div key={i} className="card">
                        <p>{a.name}</p>
                        <p>Tipo: {a.type || 'N/A'}</p>
                        <p>Duración: {a.duration || 'N/A'}</p>
                        <p>Precio: {a.price && a.price !== 'N/A'
                          ?`${convertToMXN(a.price, a.currency).toFixed(2)} MXN`
                          : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
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