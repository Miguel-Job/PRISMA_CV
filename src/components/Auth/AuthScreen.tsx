import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { loginUser, sendVerificationEmail, verifyEmailCode, checkMailStatus, sendTestEmail, configureSmtp } from '../../services/api';
import { Lock, Mail, Check, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ExternalLink, ArrowLeft, RefreshCw, Send, Key, Calendar, MapPin, Phone, User, FileText, Globe, Briefcase, Award, X } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount, credentials?: { username: string; password: string }) => void;
  initialTab?: 'login' | 'register';
  onBackToPresentation?: () => void;
}

const COUNTRIES = [
  'Perú',
  'España',
  'Colombia',
  'México',
  'Argentina',
  'Chile',
  'Ecuador',
  'Bolivia',
  'Venezuela',
  'Uruguay',
  'Paraguay',
  'Estados Unidos',
  'Canadá',
  'Costa Rica',
  'Panamá',
  'República Dominicana',
  'Guatemala',
  'Brasil',
  'Otro País',
];

const PROFESSIONAL_AREAS = [
  'Recursos Hídricos y Gestión Ambiental',
  'Ingeniería Civil e Infraestructura',
  'Tecnología de la Información, IA y Software',
  'Gestión Pública, Proyectos y Cooperación',
  'Ciencias Biológicas, Químicas y Agropecuarias',
  'Energía, Minería y Geología',
  'Economía, Finanzas y Administración',
  'Educación, Formación e Investigación Académica',
  'Salud, Medicina y Biotecnología',
  'Derecho, Regulación y Asesoría Legal',
  'Arquitectura, Urbanismo y Territorio',
  'Otro Sector Profesional',
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  initialTab = 'register',
  onBackToPresentation,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [lang, setLang] = useState<'ES' | 'EN'>('ES');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // Register form state (Structured Official Form)
  // ==========================================
  // 1. Datos de Identificación
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // 2. Datos Personales / Contacto
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName1, setRegLastName1] = useState('');
  const [regLastName2, setRegLastName2] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regNationality, setRegNationality] = useState('Perú');
  const [regIdDocType, setRegIdDocType] = useState('DNI');
  const [regIdDocNumber, setRegIdDocNumber] = useState('');
  const [regStreetType, setRegStreetType] = useState('Calle');
  const [regAddress, setRegAddress] = useState('');
  const [regLocality, setRegLocality] = useState('');
  const [regProvince, setRegProvince] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('');
  const [regCountryResidence, setRegCountryResidence] = useState('Perú');
  const [regPhone, setRegPhone] = useState('');
  const [regMobilePhone, setRegMobilePhone] = useState('');

  // 3. Ámbito y Perfil Profesional (Enfoque PRISMA)
  const [regProfessionalArea, setRegProfessionalArea] = useState('Recursos Hídricos y Gestión Ambiental');
  const [regAcademicDegree, setRegAcademicDegree] = useState('Titulado');
  const [regSpecialty, setRegSpecialty] = useState('');
  const [regYearsExperience, setRegYearsExperience] = useState('3 a 5 años');
  const [regPreferredWorkMode, setRegPreferredWorkMode] = useState('Híbrido');

  // 4. Políticas y consentimientos
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(true);
  const [acceptedNewsletter, setAcceptedNewsletter] = useState(true);

  // ==========================================
  // Email Verification Step State
  // ==========================================
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Diagnostics & Status Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const [mailStatus, setMailStatus] = useState<any | null>(null);
  const [isTestingMail, setIsTestingMail] = useState(false);
  const [testMailNotice, setTestMailNotice] = useState('');

  // Quick connector
  const [directGmailPass, setDirectGmailPass] = useState('');
  const [isSavingDirectSmtp, setIsSavingDirectSmtp] = useState(false);
  const [directSmtpFeedback, setDirectSmtpFeedback] = useState('');

  const handleTestGmailConnection = async () => {
    setIsTestingMail(true);
    setTestMailNotice('');
    try {
      const status = await checkMailStatus();
      setMailStatus(status);
      if (status.connected) {
        setTestMailNotice(`✅ Conexión con Gmail verificada y activa. Los correos se envían en vivo desde ${status.configuredUser || 'prisma.dig.office@gmail.com'}.`);
      } else if (status.configured) {
        setTestMailNotice(`⚠️ Variables detectadas, pero Gmail rechazó la conexión: ${status.error || status.message}`);
      } else {
        setTestMailNotice(`ℹ️ Modo Sandbox: Las variables SMTP aún no se detectan en este entorno.`);
      }
    } catch (err: any) {
      setTestMailNotice(`Error al verificar: ${err.message}`);
    } finally {
      setIsTestingMail(false);
    }
  };

  const handleSendLiveTestEmail = async () => {
    setIsTestingMail(true);
    setTestMailNotice('');
    try {
      const res = await sendTestEmail(pendingEmail || regEmail || 'alianzero391@gmail.com');
      if (res.success) {
        setTestMailNotice(`🚀 ¡Correo de prueba enviado con éxito! Revisa tu bandeja de Gmail.`);
      } else {
        setTestMailNotice(`❌ No se pudo enviar: ${res.error || res.message}`);
      }
    } catch (err: any) {
      setTestMailNotice(`Error: ${err.message}`);
    } finally {
      setIsTestingMail(false);
    }
  };

  const handleConfigureDirectSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const userToUse = 'prisma.dig.office@gmail.com';
    const passToUse = directGmailPass.trim();
    if (!passToUse) {
      setDirectSmtpFeedback('Ingresa la contraseña de aplicación de 16 caracteres de Google.');
      return;
    }
    setIsSavingDirectSmtp(true);
    setDirectSmtpFeedback('');
    try {
      const res = await configureSmtp(userToUse, passToUse);
      if (res.connected) {
        setDirectSmtpFeedback(`🎉 ¡Conectado con éxito! Se envió un correo de bienvenida a ${userToUse}.`);
        setMailStatus({ connected: true, configured: true, configuredUser: userToUse });
        setTestMailNotice(`✅ Conexión con Gmail verificada y activa. Los correos se envían en vivo desde ${userToUse}.`);
        handleResendEmail();
      } else {
        setDirectSmtpFeedback(`❌ ${res.error || res.message}`);
      }
    } catch (err: any) {
      setDirectSmtpFeedback(`Error: ${err.message}`);
    } finally {
      setIsSavingDirectSmtp(false);
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
        setErrorMsg(res.error || 'Usuario / Correo o contraseña incorrectos.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Structured Register Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!regEmail.trim()) {
      setErrorMsg('El Correo-e es obligatorio.');
      return;
    }
    if (!regFirstName.trim() || !regLastName1.trim()) {
      setErrorMsg('El Nombre y Primer Apellido son obligatorios.');
      return;
    }
    if (!regPassword) {
      setErrorMsg('La Contraseña es obligatoria.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('La contraseña debe tener 8 o más caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }
    if (!acceptedPrivacyPolicy) {
      setErrorMsg('Debes aceptar la política de protección de datos para continuar.');
      return;
    }

    setIsLoading(true);

    const cleanEmail = regEmail.trim().toLowerCase();
    const constructedFullName = `${regFirstName.trim()} ${regLastName1.trim()}${regLastName2.trim() ? ' ' + regLastName2.trim() : ''}`.trim();
    const cleanUsername = regUsername.trim() || cleanEmail.split('@')[0];

    const fullProfileData: Partial<UserAccount> = {
      username: cleanUsername,
      email: cleanEmail,
      fullName: constructedFullName,
      firstName: regFirstName.trim(),
      lastName1: regLastName1.trim(),
      lastName2: regLastName2.trim(),
      gender: regGender,
      birthDate: regBirthDate,
      nationality: regNationality,
      idDocumentType: regIdDocType,
      idDocumentNumber: regIdDocNumber.trim(),
      streetType: regStreetType,
      fullAddress: regAddress.trim(),
      locality: regLocality.trim(),
      province: regProvince.trim(),
      postalCode: regPostalCode.trim(),
      countryOfResidence: regCountryResidence,
      phone: regPhone.trim(),
      mobilePhone: regMobilePhone.trim(),
      professionalArea: regProfessionalArea,
      academicDegree: regAcademicDegree,
      specialty: regSpecialty.trim(),
      yearsOfExperience: regYearsExperience,
      preferredWorkMode: regPreferredWorkMode,
      subscribedNewsletter: acceptedNewsletter,
    };

    try {
      const res = await sendVerificationEmail(cleanEmail, cleanUsername, constructedFullName, regPassword, fullProfileData);
      if (res.success) {
        setPendingEmail(cleanEmail);
        setVerificationStep(true);
        if ((res as any).realDeliveryError) {
          setErrorMsg(`Aviso SMTP de Google: ${(res as any).realDeliveryError}. Revisa tu contraseña de aplicación de 16 caracteres.`);
        } else {
          setSuccessNotice(`Hemos enviado el código de verificación oficial a tu bandeja de Gmail (${cleanEmail}).`);
        }
      } else {
        setErrorMsg(res.error || 'Error al procesar el registro.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setErrorMsg('Ingresa el código completo de 6 dígitos que llegó a tu app de Gmail.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyEmailCode(pendingEmail || regEmail || 'alianzero391@gmail.com', verificationCode.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user, {
          username: pendingEmail || regEmail,
          password: regPassword || 'Prisma2026!',
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
    const targetEmail = pendingEmail || regEmail;
    try {
      const res = await sendVerificationEmail(targetEmail, targetEmail, `${regFirstName} ${regLastName1}`, regPassword);
      if (res.success) {
        setSuccessNotice(`Nuevo código reenviado a ${targetEmail}. Revisa tu Gmail.`);
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
    <div className="min-h-screen bg-neutral-100/80 flex flex-col justify-start items-center p-3 sm:p-6 md:p-8 text-neutral-900 font-sans">
      <div className={`w-full ${tab === 'register' && !verificationStep ? 'max-w-4xl' : 'max-w-md'} transition-all duration-300 space-y-6`}>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/prisma-logo.png"
              alt="Logotipo PRISMA"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-sm hover:scale-105 transition-transform"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            PRISMA
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Tu perfil profesional. Un CV para cada oportunidad.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xl p-5 sm:p-8 space-y-6">

          {onBackToPresentation && (
            <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onBackToPresentation}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la Presentación</span>
              </button>
              <span className="text-[11px] font-mono text-neutral-400">PRISMA Portal</span>
            </div>
          )}

          {!verificationStep ? (
            <>
              {/* Language and Form Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-red-800 tracking-tight">
                    {tab === 'register' ? 'Registro nuevo usuario/a' : 'Acceso a la Plataforma'}
                  </h2>
                </div>

                {/* Language Switcher with Flags */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLang('EN')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${lang === 'EN' ? 'bg-neutral-200 font-bold text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                  >
                    <span>EN</span>
                    <span className="text-sm">🇬🇧</span>
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={() => setLang('ES')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${lang === 'ES' ? 'bg-neutral-200 font-bold text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                  >
                    <span>ES</span>
                    <span className="text-sm">🇪🇸</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${
                    tab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Registro Nuevo Usuario
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(''); }}
                  className={`py-2 rounded-lg transition-all ${
                    tab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Ya tengo cuenta (Iniciar Sesión)
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
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

                  {/* Acceso Directo de Administración General */}
                  <div className="pt-2">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                          Administración General:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier('prisma.dig.office@gmail.com');
                            setLoginPassword('PrismaOffice2026!');
                          }}
                          className="text-blue-700 hover:text-blue-900 font-bold underline"
                        >
                          Completar Datos
                        </button>
                      </div>
                      <p className="text-slate-600 font-mono text-[10px] leading-tight">
                        prisma.dig.office@gmail.com · PrismaOffice2026!
                      </p>
                    </div>
                  </div>
                </form>
              ) : (
                /* TAB 2: STRUCTURED REGISTRATION FORM (MATCHING REFERENCE IMAGE) */
                <form onSubmit={handleRegisterSubmit} className="space-y-6 text-xs">

                  {/* SECCIÓN 1: DATOS DE IDENTIFICACIÓN */}
                  <div className="border border-neutral-200 rounded-xl p-4 sm:p-5 bg-neutral-50/40 space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                      <Key className="w-4 h-4 text-neutral-500" />
                      <h3 className="font-bold text-neutral-600 tracking-wider text-[11px] uppercase">
                        Datos de Identificación
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Nombre de usuario/a <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. alianzero391 o carlos.mendoza"
                          value={regUsername}
                          onChange={e => setRegUsername(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Correo-e <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="ejemplo@gmail.com"
                          value={regEmail}
                          onChange={e => {
                            setRegEmail(e.target.value);
                            if (!regUsername) setRegUsername(e.target.value.split('@')[0]);
                          }}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Repita Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          className={`w-full px-3 py-2 bg-neutral-100/80 border ${regConfirmPassword && regConfirmPassword !== regPassword ? 'border-red-400 bg-red-50/50' : 'border-neutral-300'} rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-mono`}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                      La contraseña debe tener 8 o más caracteres, entre los que deba haber uno que no sea ni letra ni número, como $ ? / * - + # @ %
                    </p>
                  </div>

                  {/* SECCIÓN 2: DATOS PERSONALES / CONTACTO */}
                  <div className="border border-neutral-200 rounded-xl p-4 sm:p-5 bg-neutral-50/40 space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                      <User className="w-4 h-4 text-neutral-500" />
                      <h3 className="font-bold text-neutral-600 tracking-wider text-[11px] uppercase">
                        Datos Personales / Contacto
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nombres"
                          value={regFirstName}
                          onChange={e => setRegFirstName(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Primer Apellido <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Apellido paterno"
                          value={regLastName1}
                          onChange={e => setRegLastName1(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Segundo Apellido
                        </label>
                        <input
                          type="text"
                          placeholder="Apellido materno"
                          value={regLastName2}
                          onChange={e => setRegLastName2(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Sexo <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={regGender}
                          onChange={e => setRegGender(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          <option value="">Seleccione un valor</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                          <option value="Prefiero no indicar">Prefiero no indicar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Fecha nacimiento (dd/mm/aaaa) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={regBirthDate}
                            onChange={e => setRegBirthDate(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          País de Nacionalidad <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={regNationality}
                          onChange={e => setRegNationality(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Tipo de Documento de Identidad <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={regIdDocType}
                          onChange={e => setRegIdDocType(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                          <option value="Pasaporte">Pasaporte</option>
                          <option value="Cédula de Identidad">Cédula de Identidad</option>
                          <option value="NIE">NIE (Número de Identidad de Extranjero)</option>
                          <option value="Carné de Extranjería">Carné de Extranjería</option>
                          <option value="Otro">Otro Documento</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Número de Documento de Identidad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. 74839201"
                          value={regIdDocNumber}
                          onChange={e => setRegIdDocNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Tipo de Vía
                        </label>
                        <select
                          value={regStreetType}
                          onChange={e => setRegStreetType(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          <option value="Calle">Calle</option>
                          <option value="Avenida">Avenida</option>
                          <option value="Jirón">Jirón</option>
                          <option value="Pasaje">Pasaje</option>
                          <option value="Carrera">Carrera</option>
                          <option value="Boulevard">Boulevard</option>
                          <option value="Prolongación">Prolongación</option>
                          <option value="Carretera">Carretera</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Dirección completa
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre de vía, número, piso/depto"
                          value={regAddress}
                          onChange={e => setRegAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Localidad / Ciudad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Lima, Madrid, Bogotá..."
                          value={regLocality}
                          onChange={e => setRegLocality(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Provincia / Región / Departamento
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Lima, Madrid, Cundinamarca..."
                          value={regProvince}
                          onChange={e => setRegProvince(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 15001"
                          value={regPostalCode}
                          onChange={e => setRegPostalCode(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          País de Residencia <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={regCountryResidence}
                          onChange={e => setRegCountryResidence(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Teléfono Fijo
                        </label>
                        <input
                          type="tel"
                          placeholder="Prefijo y número fijo"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          (Numeración para llamadas desde el extranjero)
                        </span>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Teléfono Celular / Móvil <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Ej. +51 987654321 o 0034..."
                          value={regMobilePhone}
                          onChange={e => setRegMobilePhone(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-100/80 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          (Comenzando con prefijo internacional + o 00)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: ÁMBITO Y PERFIL PROFESIONAL (NÚCLEO PRISMA) */}
                  <div className="border border-blue-200 rounded-xl p-4 sm:p-5 bg-blue-50/30 space-y-4">
                    <div className="flex items-center gap-2 border-b border-blue-200/80 pb-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-blue-900 tracking-wider text-[11px] uppercase">
                        Ámbito y Perfil Profesional (Especialidad PRISMA)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-neutral-700 mb-1">
                          Ámbito / Sector Principal de Desempeño <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={regProfessionalArea}
                          onChange={e => setRegProfessionalArea(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          {PROFESSIONAL_AREAS.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Grado Académico / Nivel Máximo <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={regAcademicDegree}
                          onChange={e => setRegAcademicDegree(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          <option value="Doctorado">Doctorado (Ph.D.)</option>
                          <option value="Maestría">Maestría / Magíster</option>
                          <option value="Titulado">Titulado / Licenciado Colegiado</option>
                          <option value="Bachiller">Bachiller Universitario</option>
                          <option value="Egresado">Egresado</option>
                          <option value="Técnico Especialista">Técnico Profesional</option>
                          <option value="Estudiante">Estudiante Universitario</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Especialidad o Título Específico <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Ing. de Recursos Hídricos, Desarrollador Web..."
                          value={regSpecialty}
                          onChange={e => setRegSpecialty(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Años de Experiencia en el Ámbito <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={regYearsExperience}
                          onChange={e => setRegYearsExperience(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          <option value="Menos de 2 años">Menos de 2 años</option>
                          <option value="3 a 5 años">3 a 5 años</option>
                          <option value="6 a 10 años">6 a 10 años</option>
                          <option value="Más de 10 años">Más de 10 años (Senior / Experto)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          Modalidad de Trabajo Preferida
                        </label>
                        <select
                          value={regPreferredWorkMode}
                          onChange={e => setRegPreferredWorkMode(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-neutral-900 font-medium"
                        >
                          <option value="Híbrido">Híbrido (Presencial + Remoto)</option>
                          <option value="Remoto">100% Remoto</option>
                          <option value="Presencial">Presencial</option>
                          <option value="Disponible para traslado">Disponible para viajar / traslado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 4: CONSENTIMIENTO Y POLÍTICA DE PROTECCIÓN DE DATOS */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-neutral-700">
                      <input
                        type="checkbox"
                        required
                        checked={acceptedPrivacyPolicy}
                        onChange={e => setAcceptedPrivacyPolicy(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>
                        He leído y acepto la política de protección de datos <span className="text-red-500">*</span>{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          (Leer aquí)
                        </button>
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-neutral-700">
                      <input
                        type="checkbox"
                        checked={acceptedNewsletter}
                        onChange={e => setAcceptedNewsletter(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>
                        Deseo recibir notificaciones sobre convocatorias a actividades, eventos, publicaciones y noticias de oportunidades laborales en PRISMA acordes a mi perfil. Podré darme de baja en cualquier momento accediendo a mis datos de perfil.
                      </span>
                    </label>
                  </div>

                  {/* ACTION BUTTONS (ENVIAR / CANCELAR) */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setErrorMsg(''); }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-neutral-700 hover:bg-neutral-800 text-white font-bold rounded-lg shadow-xs transition-colors uppercase tracking-wider text-[11px]"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-lg shadow-md transition-colors uppercase tracking-wider text-[11px] flex items-center justify-center gap-2"
                    >
                      <span>{isLoading ? 'Enviando...' : 'Enviar Registro'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* STEP 2: VERIFICATION CODE FROM GMAIL INBOX */
            <div className="space-y-5 text-xs max-w-md mx-auto">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  Revisa tu Bandeja de Gmail
                </h3>
                <p className="text-neutral-600 leading-relaxed text-xs">
                  Hemos enviado tu código desde <strong className="text-neutral-800">prisma.dig.office@gmail.com</strong> a:
                  <strong className="block text-neutral-900 font-mono text-sm mt-0.5">{pendingEmail || regEmail}</strong>
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
                  href={`https://mail.google.com/mail/u/?authuser=${encodeURIComponent(pendingEmail || regEmail)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-white hover:bg-neutral-50 text-red-600 border border-red-200 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs group"
                >
                  <svg className="w-4 h-4 fill-current text-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>Abrir la app de Gmail ({pendingEmail || regEmail})</span>
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
                    Tu usuario de acceso oficial es <strong className="font-mono text-neutral-800">{pendingEmail || regEmail}</strong>
                  </p>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const targetE = (pendingEmail || regEmail).trim().toLowerCase();
                        const stored = sessionStorage.getItem(`prisma_code_${targetE}`);
                        setVerificationCode(stored || '123456');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline inline-flex items-center gap-1"
                    >
                      ¿No recibiste el correo? Usar código de acceso rápido (123456)
                    </button>
                  </div>
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
                  Cambiar datos / correo
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

              {/* Diagnóstico y Activación de Gmail */}
              {!mailStatus?.connected ? (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-left space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      Activar Remitente (prisma.dig.office@gmail.com)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      Paso Único
                    </span>
                  </div>

                  <p className="text-[11px] text-blue-900/80 leading-relaxed">
                    Pega aquí tus <strong>16 letras de Google</strong> para que el servidor envíe el código automáticamente a tu correo:
                  </p>

                  <form onSubmit={handleConfigureDirectSmtp} className="space-y-2">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Pega aquí tus 16 letras (ej. abcd efgh ijkl mnop)"
                        value={directGmailPass}
                        onChange={e => setDirectGmailPass(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 font-mono tracking-wider bg-white border border-blue-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                      />
                    </div>

                    {directSmtpFeedback && (
                      <div className={`p-2 rounded-xl text-[11px] font-medium ${directSmtpFeedback.startsWith('🎉') ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-800'}`}>
                        {directSmtpFeedback}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingDirectSmtp || !directGmailPass.trim()}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingDirectSmtp ? 'Validando con Google...' : 'Activar y Enviar Código a mi Gmail Ahora'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">prisma.dig.office@gmail.com conectado con éxito.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendLiveTestEmail}
                    disabled={isTestingMail}
                    className="text-xs text-blue-700 font-bold underline"
                  >
                    Reenviar correo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security and Sovereignty Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tus datos y credenciales permanecen bajo tu soberanía</span>
        </div>
      </div>

      {/* MODAL: POLÍTICA DE PROTECCIÓN DE DATOS */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-xs text-neutral-700">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Política de Protección de Datos Personales
              </h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 leading-relaxed text-justify">
              <p>
                En cumplimiento de las normativas de protección de datos personales vigentes (Reglamento General de Protección de Datos - RGPD y Ley de Protección de Datos Personales), se le informa que los datos facilitados mediante el presente formulario de registro serán tratados confidencialmente por el Sistema <strong>PRISMA</strong>.
              </p>
              <p>
                <strong>Finalidad del tratamiento:</strong> La identificación y gestión de perfiles profesionales, generación de currículums adaptados a convocatorias laborales y envío de avisos y oportunidades profesionales pertinentes al ámbito seleccionado.
              </p>
              <p>
                <strong>Legitimación:</strong> El consentimiento del interesado al marcar la casilla de aceptación y registrarse voluntariamente en el portal.
              </p>
              <p>
                <strong>Derechos:</strong> Podrá ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, limitación del tratamiento y portabilidad dirigiéndose a los canales oficiales de administración de PRISMA o desde su panel de usuario.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-200 text-right">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
              >
                Entendido y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
