import React, { useState } from 'react';
import './LoginModal.css';
import logo from '../assets/images/logo_nextstop.png';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { IoClose } from 'react-icons/io5';
import { FaUser, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';

function LoginModal({ onClose, onLogin }) {
    const [step, setStep] = useState('options');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const API_URL = 'http://127.0.0.1:8000/api/usuarios/';

    // 🔹 Iniciar sesión
    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}login/`, {
                email: formData.email,
                password: formData.password
            });

            const usuarioData = response.data.usuario;
            setMessage('Inicio de sesión exitoso ✅');
            console.log('Usuario logueado:', usuarioData);

            // ✅ Guardar en localStorage y actualizar estado global
            localStorage.setItem('usuario', JSON.stringify(usuarioData));
            onLogin(usuarioData);
            onClose();
        } catch (error) {
            console.error(error);
            setMessage('❌ Correo o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Registrar usuario y enviar código
    const handleSendVerification = async () => {
        try {
            const payload = {
                nombre: formData.name,
                email: formData.email,
                password: formData.password,
                recaptcha_token: 'fake-token'
            };

            await axios.post(`${API_URL}registrar/`, payload);
            setStep('verify');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || "Error al registrar usuario");
        }
    };

    // 🔹 Verificar código
    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        try {
            setLoading(true);
            await axios.post(`${API_URL}verificar/`, {
                email: formData.email,
                codigo: code
            });

            setMessage('Cuenta verificada correctamente ✅');
            setTimeout(() => setStep('login'), 1500);
        } catch (error) {
            console.error(error);
            setMessage('Código inválido o expirado ❌');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeInput = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);
            if (value && index < 3) {
                document.getElementById(`code-${index + 1}`).focus();
            }
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const passwordValid =
        formData.password.length >= 10 &&
        /[A-Z]/.test(formData.password) &&
        /[0-9]/.test(formData.password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <IoClose />
                </button>

                <div className="modal-header">
                    <img src={logo} alt="NextStop" className="modal-logo" />
                    <h2>NEXTSTOP</h2>
                    <p className="modal-subtitle">Travel Planner</p>
                </div>

                {message && <p className="status-message">{message}</p>}

                {step === 'options' && (
                    <div className="options-step">
                        <h3>Accede para crear itinerarios</h3>

                        <button className="primary-btn" onClick={() => setStep('login')}>
                            <FaUser /> Iniciar sesión
                        </button>

                        <button className="secondary-btn" onClick={() => setStep('register')}>
                            <FaEnvelope /> Crear cuenta
                        </button>

                        <p className="terms-text">
                            Al crear una cuenta, aceptas nuestro{' '}
                            <a href="#terms">aviso de privacidad</a> y los{' '}
                            <a href="#terms">términos de uso</a>.
                        </p>
                    </div>
                )}

                {step === 'login' && (
                    <div className="login-step">
                        <h3>Iniciar sesión</h3>

                        <div className="input-group">
                            <label>Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="ejemplo@gmail.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="email-input"
                            />
                        </div>

                        <div className="input-group">
                            <label>Contraseña</label>
                            <div className="password-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="password-input"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                                </button>
                            </div>
                        </div>

                        <button
                            className="primary-btn"
                            onClick={handleLogin}
                            disabled={!formData.email || !formData.password || loading}
                        >
                            {loading ? 'Cargando...' : 'Iniciar sesión'}
                        </button>

                        <button className="text-btn" onClick={() => setStep('options')}>
                            ← Volver
                        </button>
                    </div>
                )}

                {step === 'register' && (
                    <div className="register-step">
                        <h3>Crea una contraseña para tu nueva cuenta</h3>

                        <div className="input-group">
                            <label>Nombre completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="email-input"
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className="input-group">
                            <label>Correo</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="email-input"
                                placeholder="ejemplo@gmail.com"
                            />
                        </div>

                        <div className="input-group">
                            <label>Contraseña</label>
                            <div className="password-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="password-input"
                                    placeholder="••••••••••"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                                </button>
                            </div>
                        </div>

                        <div className="password-requirements">
                            <p>La contraseña debe tener al menos:</p>
                            <div className={`requirement ${formData.password.length >= 10 ? 'valid' : ''}`}>
                                • 10 caracteres {formData.password.length >= 10 && '✓'}
                            </div>
                            <div className={`requirement ${/[A-Z]/.test(formData.password) ? 'valid' : ''}`}>
                                • 1 letra mayúscula {/[A-Z]/.test(formData.password) && '✓'}
                            </div>
                            <div className={`requirement ${/[0-9]/.test(formData.password) ? 'valid' : ''}`}>
                                • 1 número {/[0-9]/.test(formData.password) && '✓'}
                            </div>
                            <div className={`requirement ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}`}>
                                • 1 carácter especial (!@#$%...) {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) && '✓'}
                            </div>
                        </div>

                        <button
                            className="primary-btn"
                            onClick={handleSendVerification}
                            disabled={!formData.name || !formData.email || !passwordValid || loading}
                        >
                            {loading ? 'Enviando...' : 'Crear cuenta'}
                        </button>

                        <button className="text-btn" onClick={() => setStep('options')}>
                            ← Volver
                        </button>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="verify-step">
                        <h3>Se envió un código de verificación a tu correo</h3>
                        <p className="verify-subtitle">Por favor ingrésalo aquí</p>

                        <div className="code-inputs">
                            {[0, 1, 2, 3].map((index) => (
                                <input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={verificationCode[index]}
                                    onChange={(e) => handleCodeInput(index, e.target.value)}
                                    className="code-input"
                                />
                            ))}
                        </div>

                        <button
                            className="primary-btn"
                            onClick={handleVerifyCode}
                            disabled={verificationCode.join('').length < 4 || loading}
                        >
                            {loading ? 'Verificando...' : 'Verificar'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginModal;
