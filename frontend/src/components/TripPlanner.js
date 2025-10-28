import React, { useState } from 'react';
import './TripPlanner.css';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import { IoLocationSharp } from 'react-icons/io5';
import { MdCalendarToday } from 'react-icons/md';
import { IoPeople } from 'react-icons/io5';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';

registerLocale('es', es);

function TripPlanner() {
    const [tripData, setTripData] = useState({
        origin: '',
        departureDate: null,
        returnDate: null,
        adults: 1,
        seniors: 0,
        children: 0,
        budget: '',
        destinations: []
    });

    const [showPersonModal, setShowPersonModal] = useState(false);

    const handleInputChange = (field, value) => {
        setTripData({ ...tripData, [field]: value });
    };

    const calculateDuration = () => {
        if (tripData.departureDate && tripData.returnDate) {
            const start = tripData.departureDate instanceof Date ? tripData.departureDate : new Date(tripData.departureDate);
            const end = tripData.returnDate instanceof Date ? tripData.returnDate : new Date(tripData.returnDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return days > 0 ? days : 0;
        }
        return 0;
    };

    const totalPeople = tripData.adults + tripData.seniors + tripData.children;

    return (
        <div className="trip-planner">
            <h3 className="trip-title">Crea y planea tu viaje</h3>
            <p className="trip-subtitle">Comencemos con los datos básicos de tu viaje</p>

            {/* Origen */}
            <div className="form-group">
                <label>
                    <IoLocationSharp className="icon" />
                    ¿Desde dónde inicias tu viaje?
                </label>
                <input
                    type="text"
                    placeholder="Escribe tu ciudad de origen..."
                    value={tripData.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className="input-field"
                />
            </div>

            {/* Fechas */}
            <div className="form-row">
                <div className="form-group">
                    <label>
                        <MdCalendarToday className="icon" />
                        Fecha de salida
                    </label>
                    <DatePicker
                        selected={tripData.departureDate}
                        onChange={(date) => handleInputChange('departureDate', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="dd/mm/aaaa"
                        className="input-field"
                        minDate={new Date()}
                        locale="es"
                    />
                </div>

                <div className="form-group">
                    <label>
                        <MdCalendarToday className="icon" />
                        Fecha de regreso
                    </label>
                    <DatePicker
                        selected={tripData.returnDate}
                        onChange={(date) => handleInputChange('returnDate', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="dd/mm/aaaa"
                        className="input-field"
                        minDate={tripData.departureDate || new Date()}
                        locale="es"
                    />
                </div>
            </div>

            {/* Duración */}
            <div className="duration-display">
                <strong>Duración del viaje:</strong> {calculateDuration()} días
            </div>

            {/* Personas y Presupuesto */}
            <div className="form-row">
                <div className="form-group">
                    <label>
                        <IoPeople className="icon" />
                        ¿Cuántas personas van?
                    </label>
                    <div
                        className="person-selector"
                        onClick={() => setShowPersonModal(true)}
                    >
                        {totalPeople} {totalPeople === 1 ? 'persona' : 'personas'}
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        <RiMoneyDollarCircleFill className="icon" />
                        Presupuesto aproximado
                    </label>
                    <input
                        type="text"
                        placeholder="¿Cuánto planeas gastar?"
                        value={tripData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Botón agregar destinos */}
            <button className="add-destination-btn">
                Agregar destinos →
            </button>

            {/* Modal de personas */}
            {showPersonModal && (
                <div className="modal-overlay" onClick={() => setShowPersonModal(false)}>
                    <div className="person-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="close-modal-btn"
                            onClick={() => setShowPersonModal(false)}
                        >
                            ✕
                        </button>
                        <h3>Personas</h3>
                        <p className="modal-subtitle">¿Cuántos van?</p>

                        <div className="person-row">
                            <div className="person-info">
                                <strong>Adultos (de 18 a 64 años)</strong>
                            </div>
                            <div className="person-controls">
                                <button
                                    onClick={() => handleInputChange('adults', Math.max(1, tripData.adults - 1))}
                                    className="control-btn"
                                >
                                    −
                                </button>
                                <span className="person-count">{tripData.adults}</span>
                                <button
                                    onClick={() => handleInputChange('adults', tripData.adults + 1)}
                                    className="control-btn"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="person-row">
                            <div className="person-info">
                                <strong>Adultos mayor (65 años en adelante)</strong>
                            </div>
                            <div className="person-controls">
                                <button
                                    onClick={() => handleInputChange('seniors', Math.max(0, tripData.seniors - 1))}
                                    className="control-btn"
                                >
                                    −
                                </button>
                                <span className="person-count">{tripData.seniors}</span>
                                <button
                                    onClick={() => handleInputChange('seniors', tripData.seniors + 1)}
                                    className="control-btn"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="person-row">
                            <div className="person-info">
                                <strong>Niños (0 a 17 años)</strong>
                            </div>
                            <div className="person-controls">
                                <button
                                    onClick={() => handleInputChange('children', Math.max(0, tripData.children - 1))}
                                    className="control-btn"
                                >
                                    −
                                </button>
                                <span className="person-count">{tripData.children}</span>
                                <button
                                    onClick={() => handleInputChange('children', tripData.children + 1)}
                                    className="control-btn"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TripPlanner;