import React from 'react';
import {
  FileText,
  Target,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  SearchCheck,
  Send,
  MessageSquare,
  Lock,
  UserCheck,
  ChevronRight,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface PresentationViewProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  onOpenLogin,
  onOpenRegister,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Contract (3 zones: Brand, Nav links, Action buttons) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-xs">
              <span className="font-mono font-black text-sm tracking-tighter">PR</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-950">
              PRISMA
            </span>
          </div>

          {/* Zone 2: Navigation Links (single line, subtle hover) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#proposito" className="hover:text-slate-950 transition-colors whitespace-nowrap">
              Propósito
            </a>
            <a href="#refraccion" className="hover:text-slate-950 transition-colors whitespace-nowrap">
              Refracción Curricular
            </a>
            <a href="#modulos" className="hover:text-slate-950 transition-colors whitespace-nowrap">
              Módulos del Sistema
            </a>
            <a href="#privacidad" className="hover:text-slate-950 transition-colors whitespace-nowrap">
              Privacidad y Seguridad
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={onOpenRegister}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Registrarse</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Inteligencia Curricular &amp; Refracción Profesional</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
              Tu perfil profesional. <br />
              <span className="text-blue-700">Un CV para cada oportunidad.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              PRISMA descompone tu trayectoria laboral completa en perfiles curriculares adaptados y calibrados con precisión para los filtros ATS de cada convocatoria, protegiendo rigurosamente la privacidad de tus datos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Crear Cuenta y Comenzar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all text-sm border border-slate-200"
              >
                Ya tengo cuenta · Iniciar Sesión
              </button>
            </div>

            {/* Quick Proof Strip */}
            <div className="pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Enfoque</span>
                <p className="text-xs font-semibold text-slate-800">Refracción por Vacante</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verificación</span>
                <p className="text-xs font-semibold text-slate-800">Trazabilidad de Evidencia</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Compatibilidad</span>
                <p className="text-xs font-semibold text-slate-800">100% Estándar ATS</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Privacidad</span>
                <p className="text-xs font-semibold text-slate-800">Soberanía Estricta de Datos</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: PROPÓSITO & EL PRINCIPIO DE REFRACCIÓN */}
        <section id="proposito" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              01. Fundamento Conceptual
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              ¿Por qué PRISMA? La física de tu carrera
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              En óptica, un prisma descompone un haz de luz blanca en todo su espectro cromático. Un profesional moderno no cabe en una única página estática: tiene experiencia técnica, liderazgo, gestión y proyectos. PRISMA refracta tu trayectoria en el ángulo exacto que cada empleador necesita ver.
            </p>
          </div>

          <div id="refraccion" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Old Paradigm vs PRISMA */}
            <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                El Paradigma Tradicional
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Un solo CV genérico enviado a todas partes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El candidato envía el mismo documento PDF a decenas de empresas. Los sistemas ATS descartan la postulación porque no encuentran las palabras clave exactas de los Términos de Referencia, y el reclutador humano tarda menos de 7 segundos en descartarlo.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Tasa de descarte ATS superior al 75%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Obligación de reescribir manualmente cada currículum.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Sin trazabilidad de qué versión se envió a qué empresa.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 sm:p-8 bg-slate-950 text-white border border-slate-800 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                El Paradigma PRISMA
              </div>
              <h3 className="text-lg font-bold text-white">
                Refracción Curricular Inteligente
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Registras tu Perfil Maestro completo una sola vez (educación, proyectos, logros medibles y habilidades). Para cada convocatoria, PRISMA selecciona y pondera las evidencias más relevantes, generando una versión de CV calibrada para pasar los filtros de selección.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Alineación semántica con el perfil de la vacante.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Generación instantánea de múltiples versiones especializadas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cero datos inventados: solo tu historial auténtico respaldado.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 2: LOS 6 MÓDULOS DE PRISMA */}
        <section id="modulos" className="py-16 sm:py-20 bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                02. Arquitectura de Herramientas
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Los 6 Módulos Integrados de PRISMA
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Un ecosistema profesional diseñado para acompañarte desde el registro inicial de tus competencias hasta la preparación de tu entrevista final.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Module 1 */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  1. Perfil Maestro Centralizado
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tu base de datos personal con todo tu historial laboral, educación académica, certificaciones y habilidades. Se llena en casillas limpias guiadas con recomendaciones.
                </p>
              </div>

              {/* Module 2 */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  2. Gestor y Editor de CVs Adaptados
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crea y versiona múltiples currículums (versión técnica, versión ejecutiva, versión investigadora) en plantillas visuales limpias listas para exportar a PDF.
                </p>
              </div>

              {/* Module 3 */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <SearchCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  3. Validador y Escáner ATS
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Audita la legibilidad de tu CV frente a los algoritmos de filtrado automático que usan las empresas. Identifica vacíos, palabras clave faltantes y recomendaciones.
                </p>
              </div>

              {/* Module 4 */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  4. Rastreador de Postulaciones
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lleva el control de cada oportunidad: empresa, cargo, salario pretendido, fecha de cierre y vinculación de qué versión de CV se empleó para cada proceso.
                </p>
              </div>

              {/* Module 5 */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  5. Redactor de Cartas de Presentación
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Redacta cartas de postulación contextualizadas que conectan tus logros demostrables con los requerimientos específicos de la empresa contratante.
                </p>
              </div>

              {/* Module 6 */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  6. Simulador de Entrevistas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Practica con preguntas situacionales y técnicas basadas en tu propio perfil y la vacante deseada, recibiendo retroalimentación constructiva para ganar seguridad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PRIVACIDAD Y SEGURIDAD ESTRICTA */}
        <section id="privacidad" className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 bg-slate-900 text-white rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Garantía de Soberanía
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Privacidad y Aislamiento de Datos por Diseño
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En PRISMA entendemos que tus datos curriculares, remuneraciones históricas, números de documento y constancias académicas son de <strong>suma importancia y estricta confidencialidad</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sin datos compartidos</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tu perfil inicia completamente limpio y solo tú tienes acceso a tus registros y borradores.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Supervisión protegida</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  La Administración General audita el estado del sistema en estricto modo de solo lectura, sin facultad de modificar datos privados.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Verificación por Correo</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Acceso protegido mediante códigos seguros de 6 dígitos enviados a tu cuenta de Gmail.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-mono">
                prisma.dig.office@gmail.com · Oficina Digital de Administración PRISMA
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  Acceso Administrativo / Usuario
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CALL TO ACTION FINAL */}
        <section className="py-16 bg-white border-t border-slate-200 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Empieza a refractar tu carrera hoy mismo
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Crea tu cuenta gratuita, completa tu perfil maestro guiado y genera tu primer CV adaptado a tu próxima meta profesional.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Registrarme en PRISMA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs transition-colors"
              >
                Acceder a mi Cuenta Existente
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER DISCRETO */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-white text-sm">PRISMA</span>
            <span className="text-slate-600">·</span>
            <span>Un CV para cada oportunidad</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a href="#proposito" className="hover:text-white transition-colors">Propósito</a>
            <a href="#modulos" className="hover:text-white transition-colors">Módulos</a>
            <a href="#privacidad" className="hover:text-white transition-colors">Privacidad</a>
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-blue-400 hover:text-blue-300 font-bold"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
