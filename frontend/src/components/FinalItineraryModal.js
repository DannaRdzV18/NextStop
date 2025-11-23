import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaFlag,
  FaGlobeAmericas,
  FaPlaneDeparture,
  FaPlaneArrival,
} from "react-icons/fa";
import { convertToMXN } from '../utils/convertToMXN';
import "./FinalItineraryModal.css";
import { getAuthHeaders } from '../utils/auth';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// ✅ NUEVO COMPONENTE: Mapa de Google Maps
function TravelMap({ origin, destinations, tripData }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Cargar el script de Google Maps si no está cargado
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyBfeh1UInKlOVWDkUHaCpS_uRWKZoF5giE'}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [origin, destinations, tripData]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    // Geocodificar ubicaciones y crear el mapa
    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    
    // Inicializar el mapa con vista mundial
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 2,
      center: { lat: 20, lng: 0 }, // Vista mundial
      mapTypeControl: false,
      streetViewControl: false,
    });
    
    mapInstanceRef.current = map;

    // Ciudades mexicanas conocidas
    const mexicanCities = [
      'mexico', 'cdmx', 'guadalajara', 'monterrey', 'cancun', 'cancún', 
      'puebla', 'tijuana', 'mérida', 'merida', 'veracruz', 'acapulco',
      'mazatlán', 'mazatlan', 'oaxaca', 'querétaro', 'queretaro', 
      'toluca', 'chihuahua', 'morelia', 'aguascalientes', 'hermosillo',
      'saltillo', 'mexicali', 'culiacán', 'culiacan', 'san luis potosí',
      'san luis potosi', 'tampico', 'cuernavaca', 'durango', 'zacatecas',
      'los cabos', 'puerto vallarta', 'playa del carmen', 'tulum'
    ];

    // Función para determinar si es una ciudad mexicana
    const isMexicanCity = (cityName) => {
      if (!cityName) return false;
      const normalized = cityName.toLowerCase().trim();
      return mexicanCities.some(city => normalized.includes(city));
    };

    // Función para geocodificar con reintentos
    const geocodeWithFallback = (cityName, markerConfig) => {
      if (!cityName) return;
      
      const isMexico = isMexicanCity(cityName);
      
      // Primera búsqueda: con país específico
      let searchAddress = cityName.length <= 3 
        ? `${cityName} airport` 
        : isMexico 
          ? `${cityName}, Mexico` 
          : cityName;
      
      console.log(`🔍 Buscando: "${searchAddress}"`);
      
      geocoder.geocode({ address: searchAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          console.log(`✅ ${markerConfig.title} geocodificado:`, results[0].formatted_address);
          
          new window.google.maps.Marker({
            position: location,
            map: map,
            ...markerConfig
          });
          
          bounds.extend(location);
          map.fitBounds(bounds);
        } else {
          // Reintento sin ", Mexico"
          console.log(`⚠️ Reintentando sin país: "${cityName}"`);
          geocoder.geocode({ address: cityName }, (results2, status2) => {
            if (status2 === 'OK' && results2[0]) {
              const location = results2[0].geometry.location;
              console.log(`✅ ${markerConfig.title} geocodificado (reintento):`, results2[0].formatted_address);
              
              new window.google.maps.Marker({
                position: location,
                map: map,
                ...markerConfig
              });
              
              bounds.extend(location);
              map.fitBounds(bounds);
            } else {
              console.error(`❌ No se pudo geocodificar:`, cityName, status2);
            }
          });
        }
      });
    };

    // Obtener el origen correcto
    let originCity = origin;
    if (tripData?.originCity) {
      originCity = tripData.originCity;
    } else if (tripData?.origin) {
      originCity = tripData.origin;
    }
    
    // Si el origen es un código de aeropuerto de 3 letras, buscar en ciudades comunes
    const airportToCityMap = {
      // MÉXICO
      'VER': 'Veracruz, Mexico',
      'CUN': 'Cancún, Mexico',
      'GDL': 'Guadalajara, Mexico',
      'MTY': 'Monterrey, Mexico',
      'MEX': 'Ciudad de México, Mexico',
      'TIJ': 'Tijuana, Mexico',
      'MID': 'Mérida, Mexico',
      'PVR': 'Puerto Vallarta, Mexico',
      'SJD': 'Los Cabos, Mexico',
      'HMO': 'Hermosillo, Mexico',
      'OAX': 'Oaxaca, Mexico',
      'TAM': 'Tampico, Mexico',
      'ACA': 'Acapulco, Mexico',
      'ZIH': 'Ixtapa-Zihuatanejo, Mexico',
      'CUU': 'Chihuahua, Mexico',
      'AGU': 'Aguascalientes, Mexico',
      'BJX': 'León, Mexico',
      'QRO': 'Querétaro, Mexico',
      'SLP': 'San Luis Potosí, Mexico',
      'REX': 'Reynosa, Mexico',
      'MZT': 'Mazatlán, Mexico',
      'CUL': 'Culiacán, Mexico',
      'LAP': 'La Paz, Mexico',
      'ZCL': 'Zacatecas, Mexico',
      'DGO': 'Durango, Mexico',
      'CVJ': 'Cuernavaca, Mexico',
      'MLM': 'Morelia, Mexico',
      'VSA': 'Villahermosa, Mexico',
      'CPE': 'Campeche, Mexico',
      'TRC': 'Torreón, Mexico',
      'CME': 'Ciudad del Carmen, Mexico',
      'TAP': 'Tapachula, Mexico',
      'CJS': 'Ciudad Juárez, Mexico',
      'NLD': 'Nuevo Laredo, Mexico',
      'PAZ': 'Poza Rica, Mexico',
      'UPN': 'Uruapan, Mexico',
      'ZLO': 'Manzanillo, Mexico',
      
      // ESTADOS UNIDOS
      'JFK': 'New York, USA',
      'LAX': 'Los Angeles, USA',
      'MIA': 'Miami, USA',
      'ORD': 'Chicago, USA',
      'DFW': 'Dallas, USA',
      'IAH': 'Houston, USA',
      'ATL': 'Atlanta, USA',
      'SFO': 'San Francisco, USA',
      'LAS': 'Las Vegas, USA',
      'MCO': 'Orlando, USA',
      'SEA': 'Seattle, USA',
      'BOS': 'Boston, USA',
      'PHX': 'Phoenix, USA',
      'DEN': 'Denver, USA',
      'MSP': 'Minneapolis, USA',
      'DTW': 'Detroit, USA',
      'PHL': 'Philadelphia, USA',
      'CLT': 'Charlotte, USA',
      'SAN': 'San Diego, USA',
      'PDX': 'Portland, USA',
      'AUS': 'Austin, USA',
      'BWI': 'Baltimore, USA',
      'MSY': 'New Orleans, USA',
      'SLC': 'Salt Lake City, USA',
      'TPA': 'Tampa, USA',
      
      // EUROPA
      'LHR': 'London, United Kingdom',
      'CDG': 'Paris, France',
      'MAD': 'Madrid, Spain',
      'BCN': 'Barcelona, Spain',
      'FCO': 'Rome, Italy',
      'AMS': 'Amsterdam, Netherlands',
      'FRA': 'Frankfurt, Germany',
      'MUC': 'Munich, Germany',
      'BER': 'Berlin, Germany',
      'ZRH': 'Zurich, Switzerland',
      'VIE': 'Vienna, Austria',
      'LIS': 'Lisbon, Portugal',
      'DUB': 'Dublin, Ireland',
      'ATH': 'Athens, Greece',
      'IST': 'Istanbul, Turkey',
      'CPH': 'Copenhagen, Denmark',
      'OSL': 'Oslo, Norway',
      'ARN': 'Stockholm, Sweden',
      'HEL': 'Helsinki, Finland',
      'WAW': 'Warsaw, Poland',
      'PRG': 'Prague, Czech Republic',
      'BUD': 'Budapest, Hungary',
      'OTP': 'Bucharest, Romania',
      'SOF': 'Sofia, Bulgaria',
      'BRU': 'Brussels, Belgium',
      'MXP': 'Milan, Italy',
      'VCE': 'Venice, Italy',
      'NAP': 'Naples, Italy',
      
      // AMÉRICA DEL SUR
      'GRU': 'São Paulo, Brazil',
      'GIG': 'Rio de Janeiro, Brazil',
      'EZE': 'Buenos Aires, Argentina',
      'BOG': 'Bogotá, Colombia',
      'LIM': 'Lima, Peru',
      'SCL': 'Santiago, Chile',
      'UIO': 'Quito, Ecuador',
      'GYE': 'Guayaquil, Ecuador',
      'CCS': 'Caracas, Venezuela',
      'PTY': 'Panama City, Panama',
      'MVD': 'Montevideo, Uruguay',
      'ASU': 'Asunción, Paraguay',
      
      // ASIA
      'NRT': 'Tokyo, Japan',
      'HND': 'Tokyo, Japan',
      'PEK': 'Beijing, China',
      'PVG': 'Shanghai, China',
      'HKG': 'Hong Kong',
      'SIN': 'Singapore',
      'ICN': 'Seoul, South Korea',
      'BKK': 'Bangkok, Thailand',
      'KUL': 'Kuala Lumpur, Malaysia',
      'MNL': 'Manila, Philippines',
      'DEL': 'New Delhi, India',
      'BOM': 'Mumbai, India',
      'DXB': 'Dubai, UAE',
      'DOH': 'Doha, Qatar',
      'TLV': 'Tel Aviv, Israel',
      
      // CANADÁ
      'YYZ': 'Toronto, Canada',
      'YVR': 'Vancouver, Canada',
      'YUL': 'Montreal, Canada',
      'YYC': 'Calgary, Canada',
      'YEG': 'Edmonton, Canada',
      'YOW': 'Ottawa, Canada',
      
      // OCEANÍA
      'SYD': 'Sydney, Australia',
      'MEL': 'Melbourne, Australia',
      'BNE': 'Brisbane, Australia',
      'AKL': 'Auckland, New Zealand',
      
      // CARIBE Y CENTROAMÉRICA
      'SJO': 'San José, Costa Rica',
      'SAL': 'San Salvador, El Salvador',
      'GUA': 'Guatemala City, Guatemala',
      'TGU': 'Tegucigalpa, Honduras',
      'MGA': 'Managua, Nicaragua',
      'HAV': 'Havana, Cuba',
      'SJU': 'San Juan, Puerto Rico',
      'PUJ': 'Punta Cana, Dominican Republic',
      'SDQ': 'Santo Domingo, Dominican Republic',
      'KIN': 'Kingston, Jamaica',
      'BZE': 'Belize City, Belize'
    };
    
    // Si es un código de aeropuerto, convertirlo
    if (originCity && originCity.length === 3 && airportToCityMap[originCity.toUpperCase()]) {
      originCity = airportToCityMap[originCity.toUpperCase()];
      console.log('🔄 Código de aeropuerto detectado, convertido a:', originCity);
    }
    
    console.log('🗺️ Origen para mapa:', originCity);

    // Geocodificar origen
    if (originCity) {
      geocodeWithFallback(originCity, {
        title: originCity,
        label: {
          text: 'O',
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#DC2626',
          fillOpacity: 1,
          strokeColor: '#991B1B',
          strokeWeight: 2,
        }
      });
    }

    // Geocodificar destinos
    destinations.forEach((destino, index) => {
      let destinoNombre = destino.nombre || destino.city || destino.destination;
      
      // Convertir códigos de aeropuerto a nombres de ciudades
      if (destinoNombre && destinoNombre.length === 3 && airportToCityMap[destinoNombre.toUpperCase()]) {
        destinoNombre = airportToCityMap[destinoNombre.toUpperCase()];
        console.log(`🔄 Destino ${index + 1} - Código de aeropuerto detectado, convertido a:`, destinoNombre);
      }
      
      console.log(`🗺️ Destino ${index + 1}:`, destinoNombre);
      
      if (destinoNombre) {
        geocodeWithFallback(destinoNombre, {
          title: destinoNombre,
          label: {
            text: (index + 1).toString(),
            color: 'white',
            fontWeight: 'bold'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#DC2626',
            fillOpacity: 1,
            strokeColor: '#991B1B',
            strokeWeight: 2,
          }
        });
      }
    });
  };

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '200px', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}
    />
  );
}

function FinalItineraryModal({ onClose, tripData }) {
  if (!tripData) return null;

  const { destinations = [], budget = 0, origin = "", userName = "Usuario", departureDate, returnDate } = tripData;

  const guardarItinerario = async () => {
    try {
      const headers = await getAuthHeaders();

      if (headers) {
        try {
          const token = headers.Authorization.split(" ")[1];
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log("========================================");
          console.log("🕵️ REVISIÓN DE DIAGNÓSTICO");
          console.log("🔑 Token Payload:", payload);
          console.log("🆔 User ID en Token:", payload.user_id || payload.id || payload.sub);
          console.log("🌍 URL a la que vas a pegar:", "https://nextstop-app-u9cvd.ondigitalocean.app/api/itinerarios/crear/");
          console.log("========================================");
        } catch (err) {
          console.log("Error imprimiendo debug:", err);
        }
      }

      if (!headers) {
        alert("Tu sesión expiró. Inicia sesión nuevamente.");
        return;
      }

      const detalles = tripData.destinations.map((destino, index) => ({
        origen: tripData.origin || "",
        destinos: destino.nombre || "",
        departureDate,
        returnDate,
        costo_estimado: destino.selectedHotel?.price || 0,
        orden: index + 1,
        personas: tripData.people || 1,
        presupuesto: tripData.budget || 0,
        info_completa: destino
      }));

      const response = await fetch(
        "https://nextstop-app-u9cvd.ondigitalocean.app/api/itinerarios/crear/",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            nombre: `Itinerario ${new Date().toLocaleDateString("es-MX")}`,
            fecha_inicio: departureDate ? new Date(departureDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            fecha_fin: returnDate ? new Date(returnDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            notas: "",
            detalles: detalles,
          }),
        }
      );

      if (!response.ok) {
        console.error("Error al guardar", await response.text());
        alert("No se pudo guardar el itinerario.");
        return;
      }

      const data = await response.json();
      console.log("Itinerario guardado correctamente:", data);
    } catch (e) {
      console.error("Error:", e);
      alert("Error al guardar el itinerario.");
    }
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById("final-itinerary");
    if (!input) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      input.style.display = 'block';
      input.style.opacity = '1';
      input.style.height = 'auto';
      input.style.overflow = 'visible';

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("final-itinerary");
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.opacity = '1';
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
          }
        }
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("Itinerario.pdf");
      
      guardarItinerario();
      
    } catch (err) {
      console.error("Error generando el PDF:", err);
      alert("Ocurrió un error al generar el PDF.");
    }

    if (typeof onClose === "function") onClose();
  };

  const handleClose = () => {
    if (typeof onClose === "function") onClose();
  };

  const calcularCostoTotal = () => {
    return Number(budget).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  const hasOptions = (destino, type) => {
    if (type === 'flight') return destino.flights && destino.flights.length > 0;
    if (type === 'hotel') return destino.hotels && destino.hotels.length > 0;
    if (type === 'activity') return destino.activities && destino.activities.length > 0;
    return false;
  };

  return (
    <div className="final-itinerary-overlay">
      <div className="final-itinerary-modal" id="final-itinerary">
        <button className="close-modal-btn" onClick={handleClose}>×</button>
        <h2 className="itinerary-title">Tu Itinerario</h2>

        <div className="itinerary-content">
          <div className="itinerary-sidebar">
            <FaFlag size={30} className="flag-icon" />
            <h3 className="user-name">{userName}</h3>
            <hr className="sidebar-divider" />
            <FaGlobeAmericas size={40} className="globe-icon" />
            <p className="globe-text">
              ¡NextStop organizando tu viaje a la perfección!
            </p>
          </div>

          <div className="itinerary-days">
            {destinations.length === 0 ? (
              <p>No se agregaron destinos.</p>
            ) : (
              destinations.map((destino, index) => {
                const selectedFlight = destino.selectedFlight;
                const selectedHotel = destino.selectedHotel;
                const selectedActivity = destino.selectedActivity;

                return (
                  <div key={index} className="day-card">
                    <div className="day-header">
                      <span>DESTINO {index + 1}</span>
                      <span className="city-names">{destino.nombre}</span>
                    </div>

                    <div className="day-description">
                      <p><strong>Días:</strong> {destino.dias || "N/A"}</p>
                      
                      <p>
                        <strong>Hotel:</strong>{" "}
                        {selectedHotel?.name
                          ? `${selectedHotel.name} (${selectedHotel.rating || "N/A"}★)`
                          : hasOptions(destino, 'hotel') 
                            ? "No seleccionado" 
                            : "No disponible"}
                      </p>
                      <p>
                        <strong>Precio por noche:</strong>{" "}
                        {selectedHotel?.price
                          ? `${convertToMXN(selectedHotel.price, selectedHotel.currency).toFixed(2)} MXN`
                          : hasOptions(destino, 'hotel') 
                            ? "Selecciona un hotel" 
                            : "N/A"}
                      </p>
                      
                      <p>
                        <strong>Actividad:</strong>{" "}
                        {selectedActivity?.name || 
                          (hasOptions(destino, 'activity') 
                            ? "No seleccionada" 
                            : "No disponible")}
                      </p>
                      {selectedActivity?.price && selectedActivity.price !== 'N/A' && (
                        <p>
                          <strong>Precio actividad:</strong>{" "}
                          {convertToMXN(selectedActivity.price, selectedActivity.currency).toFixed(2)} MXN
                        </p>
                      )}

                      <div className="flight-section">
                        {selectedFlight ? (
                          <div className="flight-info">
                            <div className="flight-title">
                              <FaPlaneDeparture /> &nbsp;
                              <strong>Vuelo Seleccionado</strong>
                            </div>
                            
                            {selectedFlight.itineraries?.[0]?.segments?.map((segment, segIndex) => (
                              <div key={segIndex} className="flight-segment">
                                <p>
                                  <strong>Aerolínea:</strong> {segment.carrierCode} {segment.number}
                                </p>
                                <p>
                                  <FaPlaneDeparture className="flight-icon" />{" "}
                                  <strong>Salida:</strong> {segment.departure?.iataCode} 
                                  {" "}({segment.departure?.at ? 
                                    new Date(segment.departure.at).toLocaleDateString() + ", " + 
                                    new Date(segment.departure.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                    : "N/A"})
                                </p>
                                <p>
                                  <FaPlaneArrival className="flight-icon" />{" "}
                                  <strong>Llegada:</strong> {segment.arrival?.iataCode}
                                  {" "}({segment.arrival?.at ? 
                                    new Date(segment.arrival.at).toLocaleDateString() + ", " + 
                                    new Date(segment.arrival.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                    : "N/A"})
                                </p>
                                <p>
                                  <strong>Duración:</strong> {formatDuration(selectedFlight.itineraries?.[0]?.duration)}
                                </p>
                                <p>
                                  <strong>Precio:</strong> {selectedFlight.price?.total ? 
                                    `${convertToMXN(selectedFlight.price.total, selectedFlight.price.currency).toFixed(2)} MXN`
                                    : "N/A"}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : hasOptions(destino, 'flight') ? (
                          <div className="flight-info no-selection">
                            <em>Vuelos disponibles pero no seleccionados</em>
                          </div>
                        ) : (
                          <div className="flight-info no-availability">
                            <em>No hay vuelos disponibles para este destino</em>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="itinerary-summary">
            <h3>Resumen del viaje</h3>

            <p>
              <strong>Origen:</strong> {origin || "No especificado"}
            </p>

            <p>
              <strong>Total de destinos:</strong> {destinations.length}
            </p>

            <p className="total-cost">{calcularCostoTotal()}</p>

            <div className="map-container">
              {/* ✅ NUEVO: Componente del mapa */}
              <TravelMap origin={origin} destinations={destinations} tripData={tripData} />
            </div>

            <button className="save-close-btn" onClick={handleDownloadPDF}>
              Guardar y cerrar itinerario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalItineraryModal;