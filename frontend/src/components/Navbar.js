import React, { useState, useEffect } from 'react';
import './Navbar.css';
import LoginModal from './LoginModal';
import logo from '../assets/images/logo_nextstop.png';
import { FaUser } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';

function Navbar() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('usuario');
        if (storedUser) {
            setUsuario(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = (userData) => {
        setUsuario(userData);
        localStorage.setItem('usuario', JSON.stringify(userData));
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <div className="logo">
                        <div className="logo-icon">
                            <img src={logo} alt="NextStop Logo" className="logo-image" />
                        </div>
                        <div className="logo-text">
                            <h1>NEXTSTOP</h1>
                            <p>Travel Planner</p>
                        </div>
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="language">
                        <img
                            src="https://flagcdn.com/w40/mx.png"
                            alt="México"
                            style={{ width: '24px', height: '16px' }}
                        />
                        <span>MXN</span>
                    </div>

                    <button className="login-btn" onClick={() => setShowLoginModal(true)}>
                        <FaUser className="user-icon" />
                        {usuario ? usuario.nombre : "Iniciar sesión"}
                    </button>

                    <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
                        <HiMenu className="menu-icon" />
                        Menú
                    </button>
                </div>
            </nav>

            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onLogin={handleLogin}
                />
            )}
        </>
    );
}

export default Navbar;
