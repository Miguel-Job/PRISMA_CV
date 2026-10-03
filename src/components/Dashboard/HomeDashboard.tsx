import React from 'react';
import { MasterProfile, CVVersion, JobApplication } from '../../types';
import { UserCheck, Upload, FilePlus, Target, SearchCheck, ArrowRight, ShieldCheck, Briefcase, FileText } from 'lucide-react';

interface HomeDashboardProps {
  profile: MasterProfile;
  cvVersions: CVVersion[];
  applications: JobApplication[];
  onNavigate: (tab: string) => void;
  onOpenImport: () => void;
  onOpenAdapt: () => void;
  onOpenCreateCv: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  cvVersions,
  applications,
  onNavigate,
  onOpenImport,
  onOpenAdapt,
  onOpenCreateCv,
}) => {
  const verifiedCount = profile.experiences.filter(e => e.evidenceStatus === 'verified').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Sistema de Gestión de Perfil y CVs Adaptables
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            Tu perfil profesional.<br />
            <span className="text-blue-700">Un CV para cada oportunidad.</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Registra tu trayectoria laboral, grados y habilidades una sola vez. Genera documentos específicos con revisión ATS, trazabilidad de evidencia y sin datos inventados por IA.
          </p>

          {/* Core Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenAdapt}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Adaptar a una Vacante
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenImport}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar CV Existente
            </button>

            <button
              type="button"
              onClick={onOpenCreateCv}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4" />
              Nuevo CV
            </button>
          </div>
        </div>

        {/* Quiet Quick Overview Strip */}
        <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Perfil Maestro</span>
            <span className="font-bold text-neutral-900 text-sm">{profile.personalInfo.fullName.split(' ')[0]}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Versiones Activas</span>
            <span className="font-bold text-blue-700 text-sm">{cvVersions.length} CVs</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Postulaciones</span>
            <span className="font-bold text-purple-700 text-sm">{applications.length} en curso</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Evidencia Verificada</span>
            <span className="font-bold text-emerald-700 text-sm">{verifiedCount} registradas</span>
          </div>
        </div>
      </div>

      {/* 5 Main Pillars Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: Perfil Maestro */}
        <div
          onClick={() => onNavigate('profile')}
          className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-6 shadow-xs cursor-pointer transition-all hover:shadow-md flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="p-2.5 bg-neutral-100 text-neutral-800 rounded-xl w-fit group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              1. Mi Perfil Maestro
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              La fuente única de la verdad: experiencias, formación, software y habilidades con insignias de evidencia (🟢 / 🔵 / 🟡).
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Gestionar Perfil Maestro <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Module 2: Mis CVs y Versiones */}
        <div
          onClick={() => onNavigate('cvs')}
          className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-6 shadow-xs cursor-pointer transition-all hover:shadow-md flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              2. Mis Versiones de CV
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Proyecta tu perfil a diferentes convocatorias sin duplicar datos. Plantillas ATS, Ejecutivo y Oficial Perú.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Ver las {cvVersions.length} versiones <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Module 3: Postulaciones */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-6 shadow-xs cursor-pointer transition-all hover:shadow-md flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              3. Mis Postulaciones
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Seguimiento por etapas (Postulado, Evaluación, Entrevista). Cada postulación conserva el CV exacto enviado.
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Seguimiento de procesos <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Secondary Features Banner: Expediente & Privacidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate('documents')}
          className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Expediente Profesional
              </h4>
              <p className="text-xs text-emerald-800">
                Sustenta tu formación y experiencia con títulos SUNEDU y constancias de trabajo.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-700 shrink-0" />
        </div>

        <div
          onClick={() => onNavigate('privacy')}
          className="p-4 bg-neutral-100/70 border border-neutral-200 rounded-2xl cursor-pointer hover:bg-neutral-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-200 text-neutral-800 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Soberanía & Privacidad
              </h4>
              <p className="text-xs text-neutral-600">
                Control total de visibilidad, permisos de IA y descarga en formato JSON.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-700 shrink-0" />
        </div>
      </div>
    </div>
  );
};
