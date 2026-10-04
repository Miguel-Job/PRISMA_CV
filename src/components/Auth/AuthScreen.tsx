import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { loginUser, sendVerificationEmail, verifyEmailCode } from '../../services/api';
import { Lock, Mail, Check, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount, credentials?: { username: string; password: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Email Verification Step State
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Generated feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Auto-generate secure password helper
  const handleGeneratePassword = () => {
    const adjectives = ['Solido', 'Agil', 'Pro', 'Experto', 'Vector', 'Optimo', 'Directo'];
    const nouns = ['CV', 'Talento', 'Perfil', 'Carrera', 'Maestro', 'Ingeniero'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '@', '#', '$', '*'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const newPass = `${randomAdj}${randomNoun}${num}${sym}`;
    setRegPassword(newPass);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await loginUser(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Usuario / Correo o contraseña incorrectos.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register initiation -> Dispatches Automated Verification Email
  // El usuario asignado es de forma automatizada el correo electrónico ingresado
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const cleanEmail = regEmail.trim().toLowerCase();
    setRegUsername(cleanEmail);

    try {
      // Dispatch verification email to user's Gmail
      const res = await sendVerificationEmail(cleanEmail, cleanEmail, regFullName.trim(), regPassword);
      if (res.success) {
        setPendingEmail(cleanEmail);
        setVerificationStep(true);
        setSuccessNotice(`Hemos enviado el código de verificación a tu bandeja de Gmail (${cleanEmail}).`);
      } else {
        setErrorMsg(res.error || 'Error al enviar el correo de confirmación.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servicio de correo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit 6-digit code received in Gmail
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setErrorMsg('Ingresa el código completo de 6 dígitos que llegó a tu app de Gmail.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyEmailCode(pendingEmail, verificationCode.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user, {
          username: pendingEmail,
          password: regPassword,
        });
      } else {
        setErrorMsg(res.error || 'Código incorrecto. Revisa el mensaje recibido en tu app de Gmail.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al verificar el código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendVerificationEmail(pendingEmail, pendingEmail, regFullName, regPassword);
      if (res.success) {
        setSuccessNotice(`Nuevo código reenviado a ${pendingEmail}. Revisa tu Gmail.`);
      } else {
        setErrorMsg(res.error || 'No se pudo reenviar el código.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al reenviar el correo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/prisma-logo.png"
              alt="Logotipo PRISMA"
              className="w-24 h-24 object-contain drop-shadow-sm hover:scale-105 transition-transform"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            PRISMA
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Tu perfil profesional. Un CV para cada oportunidad.
          </p>
        </div>

        {/* Auth Container Card */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {!verificationStep ? (
            <>
              {/* Tabs: Iniciar Sesión / Crear Cuenta */}
              <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${
                    tab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${
                    tab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: LOGIN */}
              {tab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Usuario o Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="ejemplo@gmail.com o usuario"
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">Contraseña</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'Verificando...' : 'Acceder al Sistema'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* TAB 2: REGISTER */
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Nombres Completos
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Carlos Pérez"
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                    />
                  </div>

                  {/* Correo Electrónico (Tu Usuario) */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Correo Electrónico (Tu Usuario de Acceso)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="tu-correo@gmail.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Tu correo será automáticamente tu usuario oficial para ingresar al sistema.</span>
                    </p>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">Contraseña</label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Generar segura
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Crea tu contraseña..."
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <span>{isLoading ? 'Enviando código a Gmail...' : 'Crear Cuenta y Recibir Código en Gmail'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          ) : (
            /* STEP 2: VERIFICATION CODE FROM GMAIL INBOX */
            <div className="space-y-5 text-xs">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  Revisa tu Bandeja de Gmail
                </h3>
                <p className="text-neutral-600 leading-relaxed text-xs">
                  Hemos enviado un mensaje automatizado con tu código a:
                  <strong className="block text-neutral-900 font-mono text-sm mt-0.5">{pendingEmail}</strong>
                </p>
              </div>

              {successNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Direct Gmail App Action Box */}
              <div className="p-4 bg-gradient-to-br from-red-50/70 via-white to-amber-50/50 border border-red-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Acción en tu app de Gmail
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Bandeja de Entrada</span>
                </div>

                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Abre tu aplicación de Gmail o tu navegador para copiar el código de 6 dígitos enviado por <strong>PRISMA</strong>.
                </p>

                <a
                  href={`https://mail.google.com/mail/u/?authuser=${encodeURIComponent(pendingEmail)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-white hover:bg-neutral-50 text-red-600 border border-red-200 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs group"
                >
                  <svg className="w-4 h-4 fill-current text-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>Abrir la app de Gmail ({pendingEmail})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-500" />
                </a>
              </div>

              {/* Form to enter 6-digit PIN */}
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1 text-center">
                    Ingresa el Código de 6 Dígitos recibido
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="123456"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center py-3.5 text-2xl font-bold font-mono tracking-widest bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 text-neutral-900"
                  />
                  <p className="text-[11px] text-neutral-500 text-center mt-1.5">
                    Tu usuario de acceso oficial es <strong className="font-mono text-neutral-800">{pendingEmail}</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length < 6}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'Verificando con Gmail...' : 'Confirmar Cuenta y Acceder'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </form>

              {/* Resend and Back controls */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationStep(false);
                    setErrorMsg('');
                  }}
                  className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cambiar correo
                </button>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Reenviar código a Gmail
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security and privacy reassurance badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tus datos y credenciales permanecen bajo tu soberanía</span>
        </div>
      </div>
    </div>
  );
};
