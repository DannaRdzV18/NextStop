import React from "react";
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
import{refreshAccessToken} from '../utils/auth'

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}
function FinalItineraryModal({ onClose, tripData }) {
  if (!tripData) return null;

  const { destinations = [], budget = 0, origin = "", userName = "Usuario" } = tripData;

  // Función para guardar el itinerario en localStorage
  const guardarItinerario = async () => {
  try {
    let token = localStorage.getItem("access_token");

    // Si no hay token, intentamos refrescar
    if (!token) {
      token = await refreshAccessToken();
    }
    // Si el token existe pero está expirado → refrescar
    const test = parseJwt(token);
    if (test && (test.exp * 1000) < Date.now()) {
      token = await refreshAccessToken();
    }
    if (!token) {
      alert("Tu sesión expiró. Inicia sesión nuevamente.");
    return;
    }

    // Construimos los DETALLES como tu backend los espera
    const detalles = tripData.destinations.map((destino, index) => ({
      origen: tripData.origin || "",
      destinos: destino.nombre || "",
      fecha_salida: null,
      fecha_llegada: null,
      costo_estimado: destino.selectedHotel?.price || 0,
      orden: index + 1,
      personas: tripData.people || 1,
      presupuesto: tripData.budget || 0,
      info_completa: destino // guardamos todo por si lo necesitas
    }));

    const response = await fetch(
      `https://nextstop-app-u9cvd.ondigitalocean.app/api/itinerarios/crear/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: `Itinerario ${new Date().toLocaleDateString('es-MX')}`,
          fecha_inicio: null,
          fecha_fin: null,
          notas: "",
          detalles: detalles
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
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Itinerario.pdf");
      
      // ✅ GUARDAR ITINERARIO después de generar PDF
      guardarItinerario();
      
    } catch (err) {
      console.error("Error generando el PDF:", err);
      alert("Ocurrió un error al generar el PDF.");
    }

    if (typeof onClose === "function") onClose();
  };

  // ... (el resto de tus funciones se mantienen igual)
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
          {/* Columna izquierda */}
          <div className="itinerary-sidebar">
            <FaFlag size={30} className="flag-icon" />
            <h3 className="user-name">{userName}</h3>
            <hr className="sidebar-divider" />
            <FaGlobeAmericas size={40} className="globe-icon" />
            <p className="globe-text">
              ¡NextStop organizando tu viaje a la perfección!
            </p>
          </div>

          {/* Columna central */}
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
                      
                      {/* HOTEL - CON CONVERSIÓN A MXN */}
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
                      
                      {/* ACTIVIDAD - CON CONVERSIÓN A MXN */}
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

                      {/* VUELO - CON CONVERSIÓN A MXN */}
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

          {/* Columna derecha */}
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
              <p>Ruta del viaje no disponible (mapa desactivado).</p>
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