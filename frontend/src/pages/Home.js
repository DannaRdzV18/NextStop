// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import './Home.css';
import TripPlanner from '../components/TripPlanner';
import DestinationCard from '../components/DestinationCard';
import ModalVerificacion from '../components/ModalVerificacion';
import avionGif from '../assets/images/icono_viaje.gif';

// 📸 IMPORTAR IMÁGENES DE DESTINOS
import parisImg from '../assets/images/destinos/paris.jpg';
import romaImg from '../assets/images/destinos/roma.jpg';
import cancunImg from '../assets/images/destinos/cancun.jpg';
import nycImg from '../assets/images/destinos/nyc.jpg';
import barcelonaImg from '../assets/images/destinos/barcelona.jpg';
import veracruzImg from '../assets/images/destinos/veracruz.jpg';
import madridImg from '../assets/images/destinos/madrid.jpg';
import monterreyImg from '../assets/images/destinos/monterrey.jpg';
import londresImg from '../assets/images/destinos/londres.jpg';
import losangelesImg from '../assets/images/destinos/losangeles.jpg';
import houstonImg from '../assets/images/destinos/houston.jpg';
import acapulcoImg from '../assets/images/destinos/acapulco.jpg';
import denverImg from '../assets/images/destinos/denver.jpg';
import delhiImg from '../assets/images/destinos/delhi.jpg';
import veneciaImg from '../assets/images/destinos/venecia.jpg';

function Home() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalEstado, setModalEstado] = useState('');
  const [mensajeModal, setMensajeModal] = useState('');

  // 🎠 CARRUSEL: Estado para controlar qué destinos mostrar
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🌍 ARRAY DE DESTINOS CON IMÁGENES LOCALES
  const destinations = [
    {
      image: parisImg,
      name: "París, Francia"
    },
    {
      image: romaImg,
      name: "Roma, Italia"
    },
    {
      image: cancunImg,
      name: "Cancún, México"
    },
    {
      image: nycImg,
      name: "NYC, Nueva York"
    },
    {
      image: barcelonaImg,
      name: "Barcelona, España"
    },
    {
      image: veracruzImg,
      name: "Veracruz, México"
    },
    {
      image: madridImg,
      name: "Madrid, España"
    },
    {
      image: monterreyImg,
      name: "Monterrey, México"
    },
    {
      image: londresImg,
      name: "Londres, Reino Unido"
    },
    {
      image: losangelesImg,
      name: "Los Ángeles, California"
    },
    {
      image: houstonImg,
      name: "Houston, Texas"
    },
    {
      image: acapulcoImg,
      name: "Acapulco, México"
    },
    {
      image: denverImg,
      name: "Denver, Colorado"
    },
    {
      image: delhiImg,
      name: "Delhi, India"
    },
    {
      image: veneciaImg,
      name: "Venecia, Italia"
    }
  ];

  // ⏱️ ROTACIÓN AUTOMÁTICA cada 5 segundos (más tiempo para disfrutar)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 3;
        if (nextIndex >= destinations.length) {
          return 0;
        }
        return nextIndex;
      });
    }, 5000); // 5 segundos = más tiempo de visualización

    return () => clearInterval(interval);
  }, [destinations.length]);

  // 📋 OBTENER LOS 3 DESTINOS ACTUALES
  const getVisibleDestinations = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % destinations.length;
      visible.push(destinations[index]);
    }
    return visible;
  };

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

  return (
    <div className="home">
      {mostrarModal && (
        <ModalVerificacion
          estado={modalEstado}
          mensaje={mensajeModal}
          onClose={() => setMostrarModal(false)}
        />
      )}

      <div className="home-container">
        <div className="left-section">
          <div className="hero-section">
            <h1>Planificador de viajes rápido y sencillo</h1>
            <p>Elige un estilo y descubre los principales destinos en el mundo</p>
          </div>
          <TripPlanner />
        </div>

        <div className="right-section">
          <div className="inspiration-header">
            <img src={avionGif} alt="Avión" className="plane-icon" />
            <h2>Lugares que te pueden inspirar</h2>
          </div>

          {/* 🎠 CARRUSEL DE DESTINOS CON ANIMACIÓN SUAVE */}
          <div className="destination-cards" key={currentIndex}>
            {getVisibleDestinations().map((destination, index) => (
              <DestinationCard
                key={`${destination.name}-${currentIndex}-${index}`}
                image={destination.image}
                name={destination.name}
              />
            ))}
          </div>

          {/* 🔘 INDICADORES */}
          <div className="carousel-indicators">
            {Array.from({ length: Math.ceil(destinations.length / 3) }).map((_, idx) => (
              <span
                key={idx}
                className={`indicator ${Math.floor(currentIndex / 3) === idx ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx * 3)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;