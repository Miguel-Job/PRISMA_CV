import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { loginUser, registerUser, generateCredentialsApi, sendVerificationEmail, verifyEmailCode, fetchInboxMessages } from '../../services/api';
import { Lock, User, Mail, Sparkles, Key, Check, Eye, EyeOff, ArrowRight, ShieldCheck, Copy, RefreshCw, AlertCircle, Inbox, Send, ExternalLink, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount, credentials?: { username: string; password: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('carlos.mendoza');
  const [loginPassword, setLoginPassword] = useState('Talento2026!');
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
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);

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

  // Suggest username helper based on name
  const handleSuggestUsername = () => {
    const base = regFullName
      ? regFullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '.')
      : 'usuario.pro';
    const rand = Math.floor(100 + Math.random() * 900);
    const suggested = `${base.slice(0, 14)}.${rand}`;
    setRegUsername(suggested);
    if (!regEmail && regFullName) {
      setRegEmail(`${suggested}@gmail.com`);
    }
  };

  // 1-Click Instant User & Password Generation
  const handleQuickAccessGeneration = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await generateCredentialsApi('Profesional Invitado');
      if (res.success && res.user && res.generatedPassword) {
        // Also dispatch welcome email
        await sendVerificationEmail(
          res.generatedEmail || res.user.email,
          res.generatedUsername || res.user.username,
          res.user.fullName,
          res.generatedPassword
        );

        onLoginSuccess(res.user, {
          username: res.generatedUsername || res.user.username,
          password: res.generatedPassword,
        });
      } else {
        setErrorMsg('No se pudo generar el acceso automático.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al generar credenciales.');
    } finally {
      setIsLoading(false);
    }
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
        setErrorMsg(res.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register initiation -> Dispatches Automated Verification Email
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regUsername || !regPassword || !regEmail) {
      setErrorMsg('Por favor completa todos los campos, incluyendo tu correo electrónico para enviarte la confirmación.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Dispatch verification email to user's inbox
      const res = await sendVerificationEmail(regEmail, regUsername, regFullName, regPassword);
      if (res.success) {
        setPendingEmail(regEmail);
        setPreviewCode(res.previewCode || null);
        setVerificationStep(true);
        setSuccessNotice(`Se ha enviado un mensaje automatizado a ${regEmail} con tu código y credenciales.`);

        // Fetch messages for the live inbox view
        const msgs = await fetchInboxMessages(regEmail);
        setInboxEmails(msgs);
      } else {
        setErrorMsg(res.error || 'Error al enviar el correo de confirmación.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servicio de correo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit 6-digit code received by email
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setErrorMsg('Ingresa el código completo de 6 dígitos que llegó a tu correo.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyEmailCode(pendingEmail, verificationCode);
      if (res.success && res.user) {
        onLoginSuccess(res.user, {
          username: regUsername,
          password: regPassword,
        });
      } else {
        setErrorMsg(res.error || 'Código incorrecto o expirado.');
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
      const res = await sendVerificationEmail(pendingEmail, regUsername, regFullName, regPassword);
      if (res.success) {
        setPreviewCode(res.previewCode || null);
        setSuccessNotice('Nuevo código de verificación enviado a tu bandeja.');
        const msgs = await fetchInboxMessages(pendingEmail);
        setInboxEmails(msgs);
      }
    } catch (err) {
      setErrorMsg('No se pudo reenviar el mensaje.');
    } finally {
      setIsLoading(false);
    }
  };

  const openInboxViewer = async () => {
    const msgs = await fetchInboxMessages(pendingEmail);
    setInboxEmails(msgs);
    setShowInboxModal(true);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-md text-xl font-black mb-1">
            P
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
              {/* Tabs: Iniciar Sesión / Crear Cuenta con Generador */}
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
                  Crear Cuenta & Clave
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
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="carlos.mendoza"
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

                  {/* Demo Pre-filled Credentials Helper */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 space-y-1">
                    <span className="font-bold text-neutral-800 block">Credenciales de prueba listas:</span>
                    <div className="flex items-center justify-between font-mono bg-white p-2 rounded-lg border border-neutral-200">
                      <div>
                        <span className="text-neutral-500">Usuario:</span> <strong className="text-neutral-900">carlos.mendoza</strong><br />
                        <span className="text-neutral-500">Clave:</span> <strong className="text-neutral-900">Talento2026!</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('carlos.mendoza');
                          setLoginPassword('Talento2026!');
                        }}
                        className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[10px] font-sans font-semibold"
                      >
                        Rellenar
                      </button>
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
                /* TAB 2: REGISTER WITH EMAIL & CREDENTIAL GENERATOR */
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Elena Torres Sánchez"
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">Nombre de Usuario</label>
                      <button
                        type="button"
                        onClick={handleSuggestUsername}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Sugerir usuario
                      </button>
                    </div>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="maria.torres.2026"
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                      />
                    </div>
                  </div>

                  {/* Email Field with Automated Notification Indicator */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Correo Electrónico (Recibirá el mensaje automatizado)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="maria.torres@gmail.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      Te enviaremos un correo con tu código de verificación y tus credenciales de acceso.
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Generar clave segura
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Crea o genera tu contraseña..."
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {regPassword && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                        <span className="text-neutral-500">Fortaleza:</span>
                        <span className={`font-semibold ${regPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {regPassword.length >= 8 ? '🟢 Segura y Robusta' : '🟡 Aumenta a más de 8 caracteres'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'Enviando correo...' : 'Crear Cuenta y Enviar Correo Automatizado'}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-400 font-medium">o acceso en 1 segundo</span>
                </div>
              </div>

              {/* Quick 1-Click Generator for Instant Entry */}
              <button
                type="button"
                onClick={handleQuickAccessGeneration}
                disabled={isLoading}
                className="w-full py-2.5 border-2 border-dashed border-neutral-300 hover:border-slate-800 bg-neutral-50/70 hover:bg-neutral-50 rounded-2xl text-xs font-semibold text-neutral-800 flex items-center justify-center gap-2 transition-all group"
              >
                <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>⚡ Generar Usuario & Contraseña Instantáneos</span>
              </button>
            </>
          ) : (
            /* STEP 2: VERIFICATION CODE FROM EMAIL INBOX */
            <div className="space-y-5 text-xs">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <Mail className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  Revisa tu Bandeja de Correo
                </h3>
                <p className="text-neutral-600 leading-relaxed text-xs">
                  Hemos enviado un mensaje automatizado a:
                  <strong className="block text-neutral-900 font-mono text-[13px] mt-0.5">{pendingEmail}</strong>
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

              {/* Live Inbox Simulator Button */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2 text-center">
                <span className="text-[11px] font-semibold text-blue-900 block">
                  ¿Quieres inspeccionar el mensaje recibido ahora mismo?
                </span>
                <button
                  type="button"
                  onClick={openInboxViewer}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 text-xs"
                >
                  <Inbox className="w-4 h-4" />
                  <span>Abrir Bandeja de Entrada en Vivo</span>
                </button>
                {previewCode && (
                  <p className="text-[11px] text-blue-700 font-mono mt-1">
                    Código de verificación detectado: <strong>{previewCode}</strong>
                  </p>
                )}
              </div>

              {/* Form to enter 6-digit PIN */}
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1 text-center">
                    Ingresa el Código de 6 Dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="123456"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center py-3 text-2xl font-bold font-mono tracking-widest bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 text-neutral-900"
                  />
                  {previewCode && (
                    <button
                      type="button"
                      onClick={() => setVerificationCode(previewCode)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium block mx-auto mt-1"
                    >
                      Autocompletar código recibido ({previewCode})
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'Verificando...' : 'Confirmar Cuenta y Acceder'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </form>

              {/* Resend and Back controls */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                <button
                  type="button"
                  onClick={() => setVerificationStep(false)}
                  className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Corregir datos
                </button>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Reenviar correo
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

      {/* Simulated Live Inbox Modal to view automated email */}
      {showInboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Bandeja de Correo Recibido en Vivo
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Destinatario: {pendingEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInboxModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Email message body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {inboxEmails.length > 0 ? (
                inboxEmails.map(mail => (
                  <div key={mail.id} className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-neutral-50 p-3.5 border-b border-neutral-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-neutral-800 block text-sm">{mail.subject}</span>
                        <span className="text-neutral-500 font-mono text-[11px]">De: notificaciones@prisma.app</span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {new Date(mail.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {/* Render exact HTML body */}
                    <div
                      className="p-4 bg-white"
                      dangerouslySetInnerHTML={{ __html: mail.htmlBody }}
                    />
                    <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-xs">
                      <span className="text-neutral-600 font-mono text-[11px]">
                        Código: <strong>{mail.verificationCode}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationCode(mail.verificationCode);
                          setShowInboxModal(false);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                      >
                        Usar este código en el formulario
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Esperando entrega del correo automatizado...
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInboxModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900"
              >
                Cerrar Bandeja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
