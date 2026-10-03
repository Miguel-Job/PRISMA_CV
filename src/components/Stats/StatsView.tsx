import React from 'react';
import { MasterProfile, CVVersion, JobApplication } from '../../types';
import { BarChart3, TrendingUp, Briefcase, FileText, CheckCircle2, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

interface StatsViewProps {
  profile: MasterProfile;
  cvVersions: CVVersion[];
  applications: JobApplication[];
}

export const StatsView: React.FC<StatsViewProps> = ({
  profile,
  cvVersions,
  applications,
}) => {
  const activeApps = applications.filter(a => a.status !== 'Finalizado' && a.status !== 'Descartado');
  const interviewsCount = applications.filter(a => a.status === 'Entrevista' || a.status === 'Aceptado').length;
  const verifiedExperiences = profile.experiences.filter(e => e.evidenceStatus === 'verified').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          📊 Panel de Métricas y Actividad Profesional
        </h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-xl">
          Indicadores reales de gestión documental y postulaciones activas. Sin índices especulativos ni predicciones no verificadas.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            CVs Generados
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-1 tabular-nums">
            {cvVersions.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Versiones derivadas del maestro
          </span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Postulaciones en Curso
          </span>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
            {activeApps.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {applications.length} registradas en total
          </span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Etapas de Entrevista
          </span>
          <div className="text-2xl font-bold font-mono text-purple-600 mt-1 tabular-nums">
            {interviewsCount}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Procesos avanzados
          </span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Evidencia Verificada
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {verifiedExperiences}/{profile.experiences.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Experiencias con constancia
          </span>
        </div>
      </div>

      {/* Skills Usage and Pipeline Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Habilidades Más Utilizadas en tus Versiones de CV
          </h3>
          <div className="space-y-2">
            {profile.skills.slice(0, 6).map(sk => {
              const timesUsed = cvVersions.filter(v => v.selectedSkillIds.includes(sk.id)).length;
              const percentage = cvVersions.length > 0 ? Math.round((timesUsed / cvVersions.length) * 100) : 0;
              return (
                <div key={sk.id} className="text-xs space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-neutral-800">{sk.name}</span>
                    <span className="font-mono text-neutral-500">{timesUsed} de {cvVersions.length} CVs</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Pipeline de Búsqueda Laboral
          </h3>
          <div className="space-y-2 text-xs">
            {['Preparando', 'Postulado', 'En evaluación', 'Entrevista', 'Aceptado'].map(st => {
              const count = applications.filter(a => a.status === st).length;
              return (
                <div key={st} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="font-medium text-neutral-700">{st}</span>
                  <span className="font-mono font-bold text-neutral-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Principle Disclaimer */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start gap-3 text-xs text-neutral-600">
        <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <p>
          <strong>Política de Transparencia de Datos:</strong> PRISMA no utiliza algoritmos opacos que pretendan predecir si serás contratado. Nuestro objetivo es brindarte trazabilidad de tus postulaciones y asegurar que tus documentos cumplan con los estándares técnicos y fidedignos de cada proceso.
        </p>
      </div>
    </div>
  );
};
