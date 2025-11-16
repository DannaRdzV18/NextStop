// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import './Home.css';
import TripPlanner from '../components/TripPlanner';
import DestinationCard from '../components/DestinationCard';
import ModalVerificacion from '../components/ModalVerificacion';
import FinalItinerary from '../components/FinalItinerary';
import avionGif from '../assets/images/icono_viaje.gif';

function Home() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalEstado, setModalEstado] = useState('');
  const [mensajeModal, setMensajeModal] = useState('');

  // 🔹 Estado para mostrar el itinerario final
  const [tripData, setTripData] = useState(null);
  const [mostrarItinerario, setMostrarItinerario] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const estado = params.get('estado');
    const mensaje = params.get('mensaje');

    if (estado) {
      setModalEstado(estado);
      setMensajeModal(decodeURIComponent(mensaje));
      setMostrarModal(true);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 🔹 Función que recibe los datos finales desde TripPlanner
  const handleTripCompleted = (data) => {
    setTripData(data);
    setMostrarItinerario(true);
  };

  return (
    <div className="home">
      {/* MODAL DE VERIFICACIÓN */}
      {mostrarModal && (
        <ModalVerificacion
          estado={modalEstado}
          mensaje={mensajeModal}
          onClose={() => setMostrarModal(false)}
        />
      )}

      {/* 🔹 MODAL DE ITINERARIO FINAL */}
      {mostrarItinerario && tripData && (
        <FinalItinerary
          tripData={tripData}
          onClose={() => setMostrarItinerario(false)}
        />
      )}

      <div className="home-container">
        <div className="left-section">
          <div className="hero-section">
            <h1>Planificador de viajes rápido y sencillo</h1>
            <p>Elige un estilo y descubre los principales destinos en el mundo</p>
          </div>

          {/* 🔹 Hasta ahora TripPlanner NO enviaba la señal. Ya está corregido */}
          <TripPlanner onTripCompleted={handleTripCompleted} />
        </div>

        <div className="right-section">
          <div className="inspiration-header">
            <img src={avionGif} alt="Avión" className="plane-icon" />
            <h2>Lugares que te pueden inspirar</h2>
          </div>

          <div className="destination-cards">
            <DestinationCard
              image="https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=500"
              name="Busan, Corea"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500"
              name="Suiza"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500"
              name="Florencia, Italia"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
