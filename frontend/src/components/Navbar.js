import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import LoginModal from './LoginModal';
import logo from '../assets/images/logo_nextstop.png';
import { FaUser } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';
import { Link } from 'react-router-dom';

function Navbar() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [usuario, setUsuario] = useState(null);

    const menuRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('usuario');
        if (storedUser) {
            setUsuario(JSON.parse(storedUser));
        }

        // Cerrar menús al hacer clic fuera
        const handleClickOutside = (event) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                userMenuRef.current && !userMenuRef.current.contains(event.target)
            ) {
                setShowMenu(false);
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogin = (userData) => {
        setUsuario(userData);
        localStorage.setItem('usuario', JSON.stringify(userData));
    };

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        setUsuario(null);
        setShowUserMenu(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <img src={logo} alt="NextStop Logo" className="logo-image" />
                        </div>
                        <div className="logo-text">
                            <h1>NEXTSTOP</h1>
                            <p>Travel Planner</p>
                        </div>
                    </Link>
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

                    {/* Botón de usuario */}
                    <div className="dropdown" ref={userMenuRef}>
                        <button
                            className="login-btn"
                            onClick={() => {
                                if (usuario) {
                                    // ✅ Cerrar el menú principal si está abierto
                                    setShowMenu(false);
                                    setShowUserMenu(!showUserMenu);
                                } else {
                                    setShowLoginModal(true);
                                }
                            }}
                        >
                            <FaUser className="user-icon" />
                            {usuario ? usuario.nombre : "Iniciar sesión"}
                        </button>

                        {showUserMenu && usuario && (
                            <div className="dropdown-menu">
                                <button onClick={handleLogout}>Cerrar sesión</button>
                            </div>
                        )}
                    </div>

                    {/* ✅ SOLO MOSTRAR MENÚ SI HAY USUARIO LOGUEADO */}
                    {usuario && (
                        <div className="dropdown" ref={menuRef}>
                            <button
                                className="menu-btn"
                                onClick={() => {
                                    setShowUserMenu(false);
                                    setShowMenu(!showMenu);
                                }}
                            >
                                <HiMenu className="menu-icon" />
                                Menú
                            </button>

                            {showMenu && (
                                <div className="dropdown-menu">
                                    <Link to="/itinerarios" onClick={() => setShowMenu(false)}>
                                        Itinerarios creados
                                    </Link>
                                    <Link to="/soporte" onClick={() => setShowMenu(false)}>
                                        Contactar a soporte
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
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