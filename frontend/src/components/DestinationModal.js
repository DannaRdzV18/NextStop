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

  // Estados para selección
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

  // ✅ CORREGIDO: Calcular el origen correcto para el vuelo
  const getFlightOrigin = () => {
    // Si no hay destinos previos, usar el origen del tripData
    if (!currentDestinations || currentDestinations.length === 0) {
      return tripData?.origin || '';
    }
    
    // Si hay destinos previos, usar el ÚLTIMO destino como origen
    const lastDestination = currentDestinations[currentDestinations.length - 1];
    return lastDestination.nombre || '';
  };

  // ✅ CORREGIDO: Calcular la fecha de salida correcta
  const getFlightDepartureDate = () => {
    if (!currentDestinations || currentDestinations.length === 0) {
      return tripData?.departureDate ? formatDate(tripData.departureDate) : '';
    }
    
    // Calcular fecha acumulando días de destinos anteriores
    let accumulatedDays = 0;
    currentDestinations.forEach(dest => {
      accumulatedDays += Number(dest.dias || 0);
    });
    
    const baseDate = new Date(tripData?.departureDate || new Date());
    baseDate.setDate(baseDate.getDate() + accumulatedDays);
    return formatDate(baseDate);
  };

  const flightOrigin = getFlightOrigin();
  const flightDepartureDate = getFlightDepartureDate();
  const formattedDepartureDate = flightDepartureDate
  ? new Date(flightDepartureDate).toLocaleDateString("es-MX"):"Sin fecha";

  const destinoDias = Number(days) || 0;
  const checkInDate = new Date(flightDepartureDate);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + destinoDias);
  const formattedCheckOut = formatDate(checkOutDate);

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
    const { adults } = tripData;
    const totalPeople = adults;

    setLoadingOptions(true);
    setFlights([]); setHotels([]); setActivities([]);
    setNoFlightsMessage(''); setNoHotelsMessage(''); setNoActivitiesMessage('');

    try {
      // ✅ CORREGIDO: Usar flightOrigin y flightDepartureDate en lugar del origen inicial
      const flightRes = await fetch(
        `https://nextstop-app-u9cvd.ondigitalocean.app/api/external/vuelos/?origen=${encodeURIComponent(flightOrigin)}&destino=${encodeURIComponent(destination)}&fecha_salida=${flightDepartureDate}`
      );
      
      if (flightRes.ok) {
        const flightData = await flightRes.json();
        if (!Array.isArray(flightData) || flightData.length === 0) {
          setFlights([]); 
          setNoFlightsMessage('No hay vuelos disponibles en estas fechas.');
        } else {
          setFlights(flightData.slice(0, 3));
        }
      }

      const hotelRes = await fetch(
        `https://nextstop-app-u9cvd.ondigitalocean.app/api/external/hoteles/?ciudad=${encodeURIComponent(destination)}&fecha_entrada=${flightDepartureDate}&fecha_salida=${formattedCheckOut}&personas=${totalPeople}`
      );
      
      if (hotelRes.ok) {
        const hotelData = await hotelRes.json();
        if (!Array.isArray(hotelData) || hotelData.length === 0) {
          setHotels([]); 
          setNoHotelsMessage('No hay hoteles disponibles en estas fechas.');
        } else {
          setHotels(hotelData.slice(0, 3));
        }
      }

      const actRes = await fetch(
        `https://nextstop-app-u9cvd.ondigitalocean.app/api/external/activities/?ciudad=${encodeURIComponent(destination)}&fecha_inicio=${flightDepartureDate}`
      );
      
      if (actRes.ok) {
        const actData = await actRes.json();
        if (!Array.isArray(actData) || actData.length === 0) {
          setActivities([]); 
          setNoActivitiesMessage('No se encontraron actividades.');
        } else {
          setActivities(actData.slice(0, 3));
        }
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

  // ⭐⭐ FUNCIÓN SIMPLIFICADA PARA GUARDAR DESTINO
  const handleSaveDestination = async (action = 'close') => {
    console.log('🔄 Guardando destino...', { destination, days, action });
    
    if (!destination || !days) {
      setError('Completa destino y días antes de guardar.');
      return;
    }

    try {
      // ⭐⭐ SIEMPRE crear el destino, incluso sin selecciones
      const newDestination = {
        nombre: destination,
        ciudad: displayName,
        dias: Number(days),
        flights: flights || [],
        hotels: hotels || [],
        activities: activities || [],
        selectedFlight: selectedFlight !== null ? flights[selectedFlight] : null,
        selectedHotel: selectedHotel !== null ? hotels[selectedHotel] : null,
        selectedActivity: selectedActivity !== null ? activities[selectedActivity] : null,
        // ✅ AGREGADO: Información de origen y fecha real del vuelo
        flightOrigin: flightOrigin,
        flightDepartureDate: flightDepartureDate
      };

      console.log('📦 Nuevo destino a guardar:', newDestination);

      // ⭐⭐ SIEMPRE llamar a addDestination para actualizar el estado del padre
      if (addDestination) {
        console.log('🔄 Llamando addDestination...');
        addDestination(newDestination);
      } else {
        console.warn('⚠️ addDestination no está definido');
      }

      // ⭐⭐ Diferentes acciones después de guardar
      if (action === 'close') {
        console.log('🚪 Cerrando modal...');
        onClose && onClose();
      } else if (action === 'finalize') {
        console.log('🎯 Finalizando itinerario...');
        onClose && onClose();
        onFinalize && onFinalize();
      } else if (action === 'continue') {
        console.log('🔄 Continuando con siguiente destino...');
        // Limpiar TODO para el siguiente destino
        setDestination('');
        setDisplayName('');
        setDays('');
        setFlights([]);
        setHotels([]);
        setActivities([]);
        setSelectedFlight(null);
        setSelectedHotel(null);
        setSelectedActivity(null);
        setShowOptions(false);
        setError('');
        setNoFlightsMessage('');
        setNoHotelsMessage('');
        setNoActivitiesMessage('');
      }

    } catch (err) {
      console.error('❌ Error al guardar destino:', err);
      setError('No se pudo guardar el destino. Intenta de nuevo.');
    }
  };

  // 🔹 Cálculo para mostrar botones correctos
  const usedDays = (currentDestinations || []).reduce((s, d) => s + Number(d.dias ?? d.days ?? 0), 0);
  const remaining = totalDays - usedDays;
  const isLastDestination = remaining - Number(days) <= 0;

  return (
    <div className="modal-overlay">
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

              {/* ✅ AGREGADO: Mostrar información de ruta actual */}
              <div className="ruta-info">
                <p><strong>Ruta actual:</strong> {flightOrigin} → {destination || '?'}</p>
                <p><strong>Fecha de salida:</strong> {flightDepartureDate}</p>
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
                  {/* ✅ AGREGADO: Información de ruta en la sección de opciones */}
                  <div className="ruta-header">
                    <h4> Vuelos de {flightOrigin} a {destination}</h4>
                    <p>Fecha de salida: {flightDepartureDate}</p>
                  </div>

                  {/* VUELOS */}
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
                          <p><strong>Aerolínea:</strong> {segment.carrierCode} | <strong>Vuelo:</strong> {segment.number}</p>
                          <p><strong>Ruta:</strong> {segment.departure?.iataCode} → {segment.arrival?.iataCode}</p>
                          <p><strong>Salida:</strong> {segment.departure?.at ? new Date(segment.departure.at).toLocaleString() : 'N/A'}</p>
                          <p><strong>Llegada:</strong> {segment.arrival?.at ? new Date(segment.arrival.at).toLocaleString() : 'N/A'}</p>
                          <p><strong>Duración:</strong> {f.itineraries?.[0]?.duration || 'N/A'}</p>
                          <p><strong>Precio:</strong> {f.price ? convertToMXN(f.price.total, f.price.currency).toFixed(2) + ' MXN' : 'N/A'}</p>
                        </div>
                      );
                    })}
                    {noFlightsMessage && <p className="no-options">{noFlightsMessage}</p>}
                  </div>

                  {/* HOTELES */}
                  <div className="cards-section">
                    <h4>Hoteles</h4>
                    {hotels.map((h, i) => (
                      <div
                        key={i}
                        className={`card ${selectedHotel === i ? "selected" : ""}`}
                        onClick={() => setSelectedHotel(i)}
                      >
                        <p><strong>{h.name}</strong> ({h.rating}★)</p>
                        <p><strong>Precio por noche:</strong> {convertToMXN(h.price, h.currency).toFixed(2)} MXN</p>
                        <p><strong>Ubicación:</strong> {h.city}</p>
                        <p><strong>Check-in: {h.checkIn && h.checkIn !== "" ? h.checkIn : formattedDepartureDate} | Check-out: {h.checkOut && h.checkOut !== "" ? h.checkOut : formattedCheckOut}</strong></p>
                      </div>
                    ))}
                    {noHotelsMessage && <p className="no-options">{noHotelsMessage}</p>}
                  </div>

                  {/* ACTIVIDADES */}
                  <div className="cards-section">
                    <h4>Actividades</h4>
                    {activities.map((a, i) => (
                      <div
                        key={i}
                        className={`card ${selectedActivity === i ? "selected" : ""}`}
                        onClick={() => setSelectedActivity(i)}
                      >
                        <p><strong>{a.name}</strong></p>
                        <p><strong>Tipo:</strong> {a.type || 'N/A'}</p>
                        <p><strong>Precio:</strong> {a.price && a.price !== 'N/A'
                          ? `${convertToMXN(a.price, a.currency).toFixed(2)} MXN`
                          : 'N/A'}
                        </p>
                      </div>
                    ))}
                    {noActivitiesMessage && <p className="no-options">{noActivitiesMessage}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ✅ BOTONES SIMPLIFICADOS */}
        {showOptions && (
          <div className="destination-buttons">
            <button className="destination-btn btn-back" onClick={() => setShowOptions(false)}>
              Volver
            </button>

            {/* 🔹 Solo mostrar "Agregar destino" o "Finalizar itinerario" */}
            {isLastDestination ? (
              <button 
                className="destination-btn btn-add" 
                onClick={() => handleSaveDestination('finalize')}
              >
                Finalizar itinerario
              </button>
            ) : (
              <button 
                className="destination-btn btn-add" 
                onClick={() => handleSaveDestination('continue')}
              >
                Agregar destino
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationModal;