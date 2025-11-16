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

  const GOOGLE_KEY = "AQUI_VA_TU_API_KEY_REAL";

  // ============================================================
  //          FUNCIÓN CORREGIDA PARA GENERAR EL PDF
  // ============================================================
  const handleDownloadPDF = async () => {
    const input = document.getElementById("final-itinerary");
    if (!input) return;

    const iframes = Array.from(input.querySelectorAll("iframe"));
    const originalDisplays = iframes.map((f) => f.style.display);

    try {
      iframes.forEach((f) => (f.style.display = "none"));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const scale = 2;
      let canvas;

      try {
        canvas = await html2canvas(input, {
          scale,
          useCORS: true,
          scrollY: -window.scrollY,
          windowWidth: input.scrollWidth,
          windowHeight: input.scrollHeight,
        });
      } catch (err) {
        console.error("html2canvas error:", err);
        alert("No fue posible generar el PDF. Revisa la consola para más detalles.");
        return;
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pxPerMm = canvas.width / pdfWidth;
      const pageHeightPx = Math.floor(pdfHeight * pxPerMm);

      let y = 0;
      let pageIndex = 0;

      while (y < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pageHeightPx, canvas.height - y);

        const pageCtx = pageCanvas.getContext("2d");
        pageCtx.drawImage(
          canvas,
          0,
          y,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        const imgData = pageCanvas.toDataURL("image/png");
        const imgHeightMm = (pageCanvas.height * pdfWidth) / canvas.width;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightMm);

        y += pageHeightPx;
        pageIndex++;
      }

      pdf.save("Itinerario.pdf");
    } finally {
      iframes.forEach((f, i) => (f.style.display = originalDisplays[i] || ""));
      if (typeof onClose === "function") onClose();
    }
  };

  const calcularCostoTotal = () =>
    Number(budget).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

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
                const vuelo = destino.flight || {};

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

                      {vuelo.origen || vuelo.destino ? (
                        <div className="flight-info">
                          <div className="flight-title">
                            <FaPlaneDeparture /> &nbsp;
                            <strong>Vuelos</strong>
                          </div>
                          <p>
                            <FaPlaneDeparture className="flight-icon" />{" "}
                            <strong>Salida:</strong> {vuelo.origen || "N/A"}{" "}
                            {vuelo.horaSalida && `(${vuelo.horaSalida})`}
                            <br />
                            <FaPlaneArrival className="flight-icon" />{" "}
                            <strong>Llegada:</strong> {vuelo.destino || "N/A"}{" "}
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

            {/* MAPA (URL CORREGIDA SIN SALTOS DE LÍNEA) */}
            <div className="map-container">
              {destinations.length > 0 ? (
                <iframe
                  title="Mapa del recorrido"
                  width="100%"
                  height="250"
                  style={{ borderRadius: "12px", border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_KEY}&origin=${encodeURIComponent(
                    origin || destinations[0]?.nombre
                  )}&destination=${encodeURIComponent(
                    destinations[destinations.length - 1]?.nombre
                  )}&waypoints=${encodeURIComponent(
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
