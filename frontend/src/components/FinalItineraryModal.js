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

  return (
    <div className="final-itinerary-overlay">
      <div className="final-itinerary-modal" id="final-itinerary">
        <button className="close-modal-btn" onClick={onClose}>✕</button>
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
                // ✅ Usar selectedHotel, selectedActivity, selectedFlight
                const hotel = destino.selectedHotel || destino.hotels?.[0];
                const actividad = destino.selectedActivity || destino.activities?.[0];
                const vuelo = destino.selectedFlight || {};

                return (
                  <div key={index} className="day-card">
                    <div className="day-header">
                      <span>DESTINO {index + 1}</span>
                      <span className="city-names">{destino.nombre}</span>
                    </div>

                    <p className="day-description">
                      <strong>Días:</strong> {destino.dias || "N/A"} <br />
                      
                      <strong>Hotel:</strong>{" "}
                      {hotel?.name
                        ? `${hotel.name} (${hotel.rating || "N/A"}★)`
                        : "No seleccionado"}
                      <br />
                      
                      <strong>Precio por noche:</strong>{" "}
                      {hotel?.price
                        ? `${hotel.price.toFixed(2)} ${hotel.currency || "MXN"}`
                        : "N/A"}
                      <br />
                      
                      <strong>Actividad:</strong>{" "}
                      {actividad?.name || "No seleccionada"}
                      <br />

                      {/* ✅ Vuelos con nueva estructura */}
                      {vuelo && vuelo.itineraries ? (
                        (() => {
                          const segment = vuelo.itineraries?.[0]?.segments?.[0] || {};
                          return (
                            <div className="flight-info">
                              <div className="flight-title">
                                <FaPlaneDeparture /> &nbsp;
                                <strong>Vuelo</strong>
                              </div>

                              <p>
                                <strong>Aerolínea:</strong> {segment.carrierCode || "N/A"} {segment.number || ""}
                                <br />
                                
                                <FaPlaneDeparture className="flight-icon" />{" "}
                                <strong>Salida:</strong>{" "}
                                {segment.departure?.iataCode || "N/A"}{" "}
                                ({segment.departure?.at ? new Date(segment.departure.at).toLocaleString('es-MX') : "N/A"})
                                <br />

                                <FaPlaneArrival className="flight-icon" />{" "}
                                <strong>Llegada:</strong>{" "}
                                {segment.arrival?.iataCode || "N/A"}{" "}
                                ({segment.arrival?.at ? new Date(segment.arrival.at).toLocaleString('es-MX') : "N/A"})
                                <br />

                                <strong>Duración:</strong> {vuelo.itineraries?.[0]?.duration || "N/A"}
                                <br />

                                <strong>Precio:</strong> {vuelo.price?.total || "N/A"} {vuelo.price?.currency || "USD"}
                              </p>
                            </div>
                          );
                        })()
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
