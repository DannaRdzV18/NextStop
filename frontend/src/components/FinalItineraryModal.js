import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaFlag, FaGlobeAmericas, FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import "./FinalItineraryModal.css";

function FinalItineraryModal({ onClose, tripData }) {
  if (!tripData) return null;

  const { destinations = [], budget = 0, origin = "", userName = "Usuario" } = tripData;

  const handleDownloadPDF = async () => {
  const input = document.getElementById("final-itinerary");
  if (!input) return;

  // Genera el canvas completo con buena calidad
  const scale = 2;
  const canvas = await html2canvas(input, {
    scale,
    useCORS: true,
    scrollY: -window.scrollY,
    windowWidth: input.scrollWidth,
    windowHeight: input.scrollHeight,
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Calcula cuántos píxeles del canvas representan la altura de una página PDF
  // ratio = px_per_mm = canvas.width / pdfWidth (px per mm)
  const pxPerMm = canvas.width / pdfWidth;
  const pageHeightPx = Math.floor(pdfHeight * pxPerMm);

  let y = 0;
  let pageIndex = 0;

  while (y < canvas.height) {
    // crea canvas temporal que contendrá solo la "porción de página"
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.min(pageHeightPx, canvas.height - y);

    const pageCtx = pageCanvas.getContext("2d");
    // dibuja la porción correspondiente del canvas grande en el canvas de página
    pageCtx.drawImage(
      canvas,
      0,          // sx
      y,          // sy
      canvas.width,        // sWidth
      pageCanvas.height,   // sHeight
      0,          // dx
      0,          // dy
      pageCanvas.width,    // dWidth
      pageCanvas.height    // dHeight
    );

    const imgData = pageCanvas.toDataURL("image/png");

    // Calcula la altura en mm que ocupará esta imagen en el PDF
    const imgHeightMm = (pageCanvas.height * pdfWidth) / canvas.width;

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightMm);

    y += pageHeightPx;
    pageIndex += 1;
  }

  pdf.save("Itinerario.pdf");

  // cierra el modal después de guardar
  if (typeof onClose === "function") onClose();
};


  const calcularCostoTotal = () => {
    return Number(budget).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
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
              ¡NextStop dándote la mejor organización para tus viajes!
            </p>
          </div>

          {/* Columna central */}
          <div className="itinerary-days">
            {destinations.length === 0 ? (
              <p>No se agregaron destinos.</p>
            ) : (
              destinations.map((destino, index) => {
                const hotel = destino.hotels?.[0];
                const actividad = destino.activities?.[0];
                const vuelo = destino.flight || {}; // 🔹 Información de vuelo

                return (
                  <div key={index} className="day-card">
                    <div className="day-header">
                      <span>DESTINO {index + 1}</span>
                      <span className="city-names">{destino.nombre}</span>
                    </div>

                    <p className="day-description">
                      <strong>Días:</strong> {destino.dias} <br />
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
                      <strong>Actividad recomendada:</strong>{" "}
                      {actividad?.name || "No seleccionada"}
                      <br />
                      {actividad?.duration && (
                        <>
                          <strong>Duración:</strong> {actividad.duration}
                          <br />
                        </>
                      )}

                      {/* 🔹 Bloque de vuelos */}
                      {vuelo.origen || vuelo.destino ? (
                        <div className="flight-info">
                          <div className="flight-title">
                            <FaPlaneDeparture /> &nbsp;
                            <strong>Vuelos</strong>
                          </div>
                          <p>
                            <FaPlaneDeparture className="flight-icon" />{" "}
                            <strong>Salida:</strong>{" "}
                            {vuelo.origen || "No especificado"}{" "}
                            {vuelo.horaSalida && `(${vuelo.horaSalida})`}
                            <br />
                            <FaPlaneArrival className="flight-icon" />{" "}
                            <strong>Llegada:</strong>{" "}
                            {vuelo.destino || "No especificado"}{" "}
                            {vuelo.horaLlegada && `(${vuelo.horaLlegada})`}
                            <br />
                            {vuelo.aerolinea && (
                              <>
                                <strong>Aerolínea:</strong> {vuelo.aerolinea}
                              </>
                            )}
                          </p>
                        </div>
                      ) : (
                        <em>No se registraron vuelos para este destino.</em>
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
              {destinations.length > 0 ? (
                <iframe
                  title="Mapa del recorrido"
                  width="100%"
                  height="250"
                  style={{ borderRadius: "12px", border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyB3EjCz-YourGoogleMapsAPIKeyHere
                    &origin=${encodeURIComponent(origin || destinations[0]?.nombre)}
                    &destination=${encodeURIComponent(
                      destinations[destinations.length - 1]?.nombre
                    )}
                    &waypoints=${encodeURIComponent(
                      destinations
                        .slice(1, destinations.length - 1)
                        .map((d) => d.nombre)
                        .join("|")
                    )}`}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              ) : (
                <p>No hay destinos para mostrar en el mapa.</p>
              )}
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
