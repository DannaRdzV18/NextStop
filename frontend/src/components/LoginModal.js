import React, { useState } from 'react';
import './LoginModal.css';
import logo from '../assets/images/logo_nextstop.png';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { IoClose } from 'react-icons/io5';
import { FaUser, FaEnvelope } from 'react-icons/fa';

function LoginModal({ onClose }) {
    const [step, setStep] = useState('options');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        console.log('Iniciando sesión:', { email: formData.email, password: formData.password });
        onClose();
    };

    const handleSendVerification = () => {
        if (formData.name && formData.email && passwordValid) {
            console.log('Creando cuenta y enviando código a:', formData.email);
            setStep('verify');
        }
    };

    const handleVerifyCode = () => {
        const code = verificationCode.join('');
        console.log('Verificando código:', code);
        onClose();
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

                {step === 'options' && (
                    <div className="options-step">
                        <h3>Accede para crear itinerarios</h3>

                        <button
                            className="primary-btn"
                            onClick={() => setStep('login')}
                        >
                            <FaUser /> Iniciar sesión
                        </button>

                        <button
                            className="secondary-btn"
                            onClick={() => setStep('register')}
                        >
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
                            disabled={!formData.email || !formData.password}
                        >
                            Iniciar sesión
                        </button>

                        <button
                            className="text-btn"
                            onClick={() => setStep('options')}
                        >
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
                            disabled={!formData.name || !formData.email || !passwordValid}
                        >
                            Crear cuenta
                        </button>

                        <button
                            className="text-btn"
                            onClick={() => setStep('options')}
                        >
                            ← Volver
                        </button>

                        <p className="terms-text">
                            Al crear una cuenta, aceptas nuestro{' '}
                            <a href="#terms">aviso de privacidad</a> y los{' '}
                            <a href="#terms">términos de uso</a>.
                        </p>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="verify-step">
                        <h3>Se enviará un código de verificación a tu correo</h3>
                        <p className="verify-subtitle">Por favor ingresa el código</p>

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
                            disabled={verificationCode.join('').length < 4}
                        >
                            Verificar
                        </button>

                        <p className="resend-text">
                            Al crear una cuenta, aceptas nuestro{' '}
                            <a href="#terms">aviso de privacidad</a> y los{' '}
                            <a href="#terms">términos de uso</a>.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginModal;