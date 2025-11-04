import React from 'react';
import './Home.css';
import TripPlanner from '../components/TripPlanner';
import DestinationCard from '../components/DestinationCard';
import avionGif from '../assets/images/icono_viaje.gif';

function Home() {
    return (
        <div className="home">
            <div className="home-container">
                <div className="left-section">
                    <div className="hero-section">
                        <h1>Planificador de viajes rápido y sencillo</h1>
                        <p>Elige un estilo y descubre los principales destinos en todo el mundo</p>
                    </div>

                    <TripPlanner />
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