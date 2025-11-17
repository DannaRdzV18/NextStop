import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaFlag,
  FaGlobeAmericas,
  FaPlaneDeparture,
  FaPlaneArrival,
} from "react-icons/fa";
import "./FinalItineraryModal.css";

function FinalItineraryModal({ onClose, tripData }) {
  if (!tripData) return null;

  const { destinations = [], budget = 0, origin = "", userName = "Usuario" } =
    tripData;

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
    } catch (err) {
      console.error("Error generando el PDF:", err);
      alert("Ocurrió un error al generar el PDF.");
    }

    if (typeof onClose === "function") onClose();
  };

  const calcularCostoTotal = () => {
    return Number(budget).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  // Función para formatear la duración del vuelo
  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    // Remover "PT" y formatear la duración
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  return (
    <div className="final-itinerary-overlay" onClick={onClose}>
      <div
        className="final-itinerary-modal"
        id="final-itinerary"
        onClick={(e) => e.stopPropagation()}
      >
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
                // ⭐ CORREGIDO - Usar selectedFlight, selectedHotel, selectedActivity
                const selectedFlight = destino.selectedFlight;
                const selectedHotel = destino.selectedHotel;
                const selectedActivity = destino.selectedActivity;

                return (
                  <div key={index} className="day-card">
                    <div className="day-header">
                      <span>DESTINO {index + 1}</span>
                      <span className="city-names">{destino.nombre}</span>
                    </div>

                    <p className="day-description">
                      <strong>Días:</strong> {destino.dias || "N/A"} <br />
                      
                      {/* ⭐ HOTEL - usando selectedHotel */}
                      <strong>Hotel:</strong>{" "}
                      {selectedHotel?.name
                        ? `${selectedHotel.name} (${selectedHotel.rating || "N/A"}★)`
                        : "No seleccionado"}
                      <br />
                      <strong>Precio por noche:</strong>{" "}
                      {selectedHotel?.price
                        ? `${selectedHotel.price.toFixed(2)} ${selectedHotel.currency || "MXN"}`
                        : "N/A"}
                      <br />
                      
                      {/* ⭐ ACTIVIDAD - usando selectedActivity */}
                      <strong>Actividad:</strong>{" "}
                      {selectedActivity?.name || "No seleccionada"}
                      <br />

                      {/* ⭐ VUELO - usando selectedFlight */}
                      {selectedFlight ? (
                        <div className="flight-info">
                          <div className="flight-title">
                            <FaPlaneDeparture /> &nbsp;
                            <strong>Vuelo</strong>
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
                                <strong>Precio:</strong> {selectedFlight.price?.total || "N/A"} {selectedFlight.price?.currency || ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <em>No se seleccionó vuelo para este destino.</em>
                      )}
                    </p>
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

            {/* SIN MAPA */}
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