import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { convertToMXN } from '../utils/convertToMXN';
import { FaHotel, FaUmbrellaBeach, FaPlane, FaMapMarkerAlt } from 'react-icons/fa';
import './ItinerariosCreados.css';

function ItinerariosCreados() {
  const [itinerarios, setItinerarios] = useState([]);
  const [itinerarioSeleccionado, setItinerarioSeleccionado] = useState(null);

  useEffect(() => {
    cargarItinerarios();
  }, []);

  const cargarItinerarios = () => {
    const itinerariosGuardados = JSON.parse(localStorage.getItem('itinerarios')) || [];
    setItinerarios(itinerariosGuardados);
  };

  const eliminarItinerario = (id) => {
    const nuevosItinerarios = itinerarios.filter(it => it.id !== id);
    setItinerarios(nuevosItinerarios);
    localStorage.setItem('itinerarios', JSON.stringify(nuevosItinerarios));
  };

  const verDetalles = (itinerario) => {
    setItinerarioSeleccionado(itinerario);
  };

  const cerrarDetalles = () => {
    setItinerarioSeleccionado(null);
  };

  // Función para formatear la duración del vuelo
  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  // Función para generar PDF - MEJORADA
  const generarPDF = async () => {
    if (!itinerarioSeleccionado) return;

    const input = document.getElementById("modal-detalles-content");
    if (!input) return;

    try {
      // Crear un clon del elemento para no afectar la visualización
      const clone = input.cloneNode(true);
      clone.style.width = '700px'; // Ancho fijo para el PDF
      clone.style.padding = '20px';
      clone.style.fontSize = '12px'; // Tamaño de fuente más pequeño para PDF
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2, // Mayor calidad
        useCORS: true,
        logging: false,
        width: 700, // Ancho específico
        height: clone.scrollHeight,
        windowWidth: 700,
        scrollX: 0,
        scrollY: 0
      });

      // Remover el clon
      document.body.removeChild(clone);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Calcular cuántas páginas necesitamos
      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // Primera página
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        pageNumber++;
      }

      pdf.save(`Itinerario_${itinerarioSeleccionado.nombre}.pdf`);
    } catch (err) {
      console.error("Error generando el PDF:", err);
      alert("Ocurrió un error al generar el PDF.");
    }
  };

  return (
    <div className="itinerarios-container">
      <div className="itinerarios-header">
        <h1>Mis Itinerarios Creados</h1>
        <p>Gestiona y revisa todos tus planes de viaje</p>
      </div>

      {itinerarios.length === 0 ? (
        <div className="sin-itinerarios">
          <h3>No tienes itinerarios guardados</h3>
          <p>Crea tu primer itinerario en el planificador de viajes</p>
        </div>
      ) : (
        <div className="itinerarios-list">
          {itinerarios.map((itinerario) => (
            <div key={itinerario.id} className="itinerario-card">
              <div className="itinerario-info">
                <h3>{itinerario.nombre}</h3>
                <p><strong>Creado:</strong> {itinerario.fechaCreacion}</p>
                <p><strong>Usuario:</strong> {itinerario.usuario}</p>
                <p><strong>Destinos:</strong> {itinerario.datos.destinations?.length || 0}</p>
                <p><strong>Presupuesto:</strong> {Number(itinerario.datos.budget || 0).toLocaleString('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                })}</p>
              </div>
              <div className="itinerario-actions">
                <button 
                  className="btn-ver"
                  onClick={() => verDetalles(itinerario)}
                >
                  Ver Detalles
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => eliminarItinerario(itinerario.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {itinerarioSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-detalles">
            <button className="close-btn" onClick={cerrarDetalles}>×</button>
            <h2>{itinerarioSeleccionado.nombre}</h2>

            {/* Botón para descargar PDF */}
            <div className="modal-actions">
              <button className="btn-descargar-pdf" onClick={generarPDF}>
                Descargar PDF
              </button>
            </div>
            
            <div id="modal-detalles-content" className="detalles-content">
              <div className="detalle-section">
                <h3>Información General</h3>
                <p><strong>Origen:</strong> {itinerarioSeleccionado.datos.origin || "No especificado"}</p>
                <p><strong>Total de destinos:</strong> {itinerarioSeleccionado.datos.destinations?.length || 0}</p>
                <p><strong>Presupuesto:</strong> {Number(itinerarioSeleccionado.datos.budget || 0).toLocaleString('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                })}</p>
              </div>

              {/* Ruta del Viaje */}
              <div className="detalle-section">
                <h3>Ruta de Viaje</h3>
                <div className="ruta-viaje">
                  <span className="ciudad">
                    <FaMapMarkerAlt className="icono-ciudad" />
                    {itinerarioSeleccionado.datos.origin}
                  </span>
                  {itinerarioSeleccionado.datos.destinations?.map((destino, index) => (
                    <React.Fragment key={index}>
                      <span className="flecha">→</span>
                      <span className="ciudad">
                        <FaMapMarkerAlt className="icono-ciudad" />
                        {destino.nombre}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Destinos con información completa */}
              {itinerarioSeleccionado.datos.destinations?.map((destino, index) => (
                <div key={index} className="detalle-section destino-completo">
                  <h3>Destino {index + 1}: {destino.nombre}</h3>
                  <p><strong>Días:</strong> {destino.dias || "N/A"}</p>

                  {/* Información de Hotel */}
                  {destino.selectedHotel && (
                    <div className="hotel-info">
                      <h4>
                        <FaHotel className="icono-hotel" />
                        Hotel Seleccionado
                      </h4>
                      <p><strong>Nombre:</strong> {destino.selectedHotel.name}</p>
                      <p><strong>Rating:</strong> {destino.selectedHotel.rating || "N/A"}★</p>
                      <p><strong>Precio por noche:</strong> {destino.selectedHotel.price ? 
                        `${convertToMXN(destino.selectedHotel.price, destino.selectedHotel.currency).toFixed(2)} MXN` 
                        : "N/A"}</p>
                    </div>
                  )}

                  {/* Información de Actividad */}
                  {destino.selectedActivity && (
                    <div className="actividad-info">
                      <h4>
                        <FaUmbrellaBeach className="icono-actividad" />
                        Actividad Seleccionada
                      </h4>
                      <p><strong>Nombre:</strong> {destino.selectedActivity.name}</p>
                      {destino.selectedActivity.price && destino.selectedActivity.price !== 'N/A' && (
                        <p><strong>Precio:</strong> {convertToMXN(destino.selectedActivity.price, destino.selectedActivity.currency).toFixed(2)} MXN</p>
                      )}
                    </div>
                  )}

                  {/* Información de Vuelo */}
                  {destino.selectedFlight && (
                    <div className="vuelo-info">
                      <h4>
                        <FaPlane className="icono-vuelo" />
                        Vuelo Seleccionado
                      </h4>
                      {destino.selectedFlight.itineraries?.[0]?.segments?.map((segment, segIndex) => (
                        <div key={segIndex} className="segmento-vuelo">
                          <p><strong>Aerolínea:</strong> {segment.carrierCode} {segment.number}</p>
                          <p><strong>Salida:</strong> {segment.departure?.iataCode} ({segment.departure?.at ? 
                            new Date(segment.departure.at).toLocaleDateString() + ", " + 
                            new Date(segment.departure.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : "N/A"})</p>
                          <p><strong>Llegada:</strong> {segment.arrival?.iataCode} ({segment.arrival?.at ? 
                            new Date(segment.arrival.at).toLocaleDateString() + ", " + 
                            new Date(segment.arrival.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : "N/A"})</p>
                          <p><strong>Duración:</strong> {formatDuration(destino.selectedFlight.itineraries?.[0]?.duration)}</p>
                          <p><strong>Precio:</strong> {destino.selectedFlight.price?.total ? 
                            `${convertToMXN(destino.selectedFlight.price.total, destino.selectedFlight.price.currency).toFixed(2)} MXN`
                            : "N/A"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItinerariosCreados;