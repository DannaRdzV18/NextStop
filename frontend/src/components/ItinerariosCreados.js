import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { convertToMXN } from '../utils/convertToMXN';
import { FaHotel, FaUmbrellaBeach, FaPlane, FaMapMarkerAlt } from 'react-icons/fa';
import { getAuthHeaders } from '../utils/auth'; // 👈 IMPORTANTE: Importar auth
import './ItinerariosCreados.css';

function ItinerariosCreados() {
  const [itinerarios, setItinerarios] = useState([]);
  const [itinerarioSeleccionado, setItinerarioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    cargarItinerarios();
  }, []);

  // 🔄 FUNCIÓN CARGAR DESDE LA API
  const cargarItinerarios = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      if (!headers) {
        console.warn("No hay sesión activa");
        setLoading(false);
        return;
      }

      const response = await fetch("https://nextstop-app-u9cvd.ondigitalocean.app/api/itinerarios/listar/", {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Error al obtener itinerarios");
      }

      const data = await response.json();
      const listaBackend = data.results ? data.results : data;

      // 🛠️ TRANSFORMACIÓN DE DATOS:
      // Convertimos el formato del Backend al formato que tu UI ya espera (itinerario.datos...)
      const itinerariosFormateados = listaBackend.map(item => {
        // Extraemos los destinos desde 'info_completa' que guardamos en cada detalle
        const destinations = item.detalles ? item.detalles.map(d => d.info_completa) : [];

        // Calculamos el presupuesto sumando lo de los detalles (o tomando el primero si lo guardaste global)
        // Si guardaste el budget en info_completa, lo sacamos de ahí.
        const budget = destinations.length > 0 ? (item.detalles[0].presupuesto || 0) : 0;
        const origin = destinations.length > 0 ? (item.detalles[0].origen || "") : "";

        return {
          id: item.id,
          nombre: item.nombre,
          fechaCreacion: new Date(item.creado_en || item.fecha_inicio).toLocaleDateString(),
          usuario: "Yo", // O podrías sacar el nombre del token si quisieras
          // Aquí reconstruimos el objeto 'datos' que tu UI usa
          datos: {
            destinations: destinations,
            budget: budget,
            origin: origin
          }
        };
      });

      setItinerarios(itinerariosFormateados);

    } catch (error) {
      console.error("Error cargando itinerarios:", error);
      // Si falla la API, podrías intentar cargar del localStorage como respaldo si quisieras
      // const locales = JSON.parse(localStorage.getItem('itinerarios')) || [];
      // setItinerarios(locales);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ ELIMINAR (Por ahora solo local visualmente, luego conectarás el DELETE del backend)
  const eliminarItinerario = async (id) => {
    if(!window.confirm("¿Estás seguro de eliminar este itinerario?")) return;

    // Aquí iría la llamada a la API DELETE:
    // await fetch(`.../api/itinerarios/${id}/`, { method: 'DELETE', ... })

    const nuevosItinerarios = itinerarios.filter(it => it.id !== id);
    setItinerarios(nuevosItinerarios);
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

  // Función para generar PDF (MANTENIDA IGUAL)
  const generarPDF = async () => {
    if (!itinerarioSeleccionado) return;

    try {
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.background = 'white';
      pdfContainer.style.fontSize = '14px';
      pdfContainer.style.lineHeight = '1.4';

      const originalContent = document.getElementById("modal-detalles-content");
      const clonedContent = originalContent.cloneNode(true);

      clonedContent.style.height = 'auto';
      clonedContent.style.overflow = 'visible';
      clonedContent.style.display = 'block';
      clonedContent.style.opacity = '1';

      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
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

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Itinerario_${itinerarioSeleccionado.nombre}.pdf`);
      document.body.removeChild(pdfContainer);

    } catch (err) {
      console.error("Error generando el PDF:", err);
      alert("Ocurrió un error al generar el PDF.");
    }
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '50px'}}><h2>Cargando tus viajes... ✈️</h2></div>;
  }

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
                {/* Eliminamos "Usuario" si siempre soy yo, o lo dejamos fijo */}
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

      {/* Modal de detalles - SE MANTIENE IDÉNTICO */}
      {itinerarioSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-detalles">
            <button className="close-btn" onClick={cerrarDetalles}>×</button>
            <h2>{itinerarioSeleccionado.nombre}</h2>

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

              {itinerarioSeleccionado.datos.destinations?.map((destino, index) => (
                <div key={index} className="detalle-section destino-completo">
                  <h3>Destino {index + 1}: {destino.nombre}</h3>
                  <p><strong>Días:</strong> {destino.dias || "N/A"}</p>

                  {destino.selectedHotel && (
                    <div className="hotel-info">
                      <h4><FaHotel className="icono-hotel" /> Hotel Seleccionado</h4>
                      <p><strong>Nombre:</strong> {destino.selectedHotel.name}</p>
                      <p><strong>Rating:</strong> {destino.selectedHotel.rating || "N/A"}★</p>
                      <p><strong>Precio por noche:</strong> {destino.selectedHotel.price ?
                        `${convertToMXN(destino.selectedHotel.price, destino.selectedHotel.currency).toFixed(2)} MXN`
                        : "N/A"}</p>
                       {/* Agregamos validaciones de null para fechas */}
                      <p><strong>Check-in:</strong> {destino.selectedHotel.checkIn ||
                        (destino.flightDepartureDate ?
                          new Date(destino.flightDepartureDate).toLocaleDateString("es-MX")
                          : "N/A")}
                      </p>
                      <p><strong>Check-out:</strong> {destino.selectedHotel.checkOut ||
                        (destino.flightDepartureDate && destino.dias ?
                           new Date(new Date(destino.flightDepartureDate).getTime() + (Number(destino.dias) * 86400000)).toLocaleDateString("es-MX")
                          : "N/A")}
                      </p>
                    </div>
                  )}

                  {destino.selectedActivity && (
                    <div className="actividad-info">
                      <h4><FaUmbrellaBeach className="icono-actividad" /> Actividad Seleccionada</h4>
                      <p><strong>Nombre:</strong> {destino.selectedActivity.name}</p>
                      {destino.selectedActivity.price && destino.selectedActivity.price !== 'N/A' && (
                        <p><strong>Precio:</strong> {convertToMXN(destino.selectedActivity.price, destino.selectedActivity.currency).toFixed(2)} MXN</p>
                      )}
                    </div>
                  )}

                  {destino.selectedFlight && (
                    <div className="vuelo-info">
                      <h4><FaPlane className="icono-vuelo" /> Vuelo Seleccionado</h4>
                      {destino.selectedFlight.itineraries?.[0]?.segments?.map((segment, segIndex) => (
                        <div key={segIndex} className="segmento-vuelo">
                          <p><strong>Aerolínea:</strong> {segment.carrierCode} {segment.number}</p>
                          <p><strong>Salida:</strong> {segment.departure?.iataCode} ({segment.departure?.at ? new Date(segment.departure.at).toLocaleDateString() : "N/A"})</p>
                          <p><strong>Llegada:</strong> {segment.arrival?.iataCode}</p>
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