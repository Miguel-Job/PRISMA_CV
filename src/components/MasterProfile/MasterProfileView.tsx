import React, { useState } from 'react';
import { MasterProfile, ExperienceItem, EducationItem, SkillItem, LanguageItem, CertificationItem, ProjectItem } from '../../types';
import { EvidenceBadge } from '../EvidenceBadge';
import { Sparkles, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, FileCheck, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { optimizeTextWithAi, OptimizeTextResult } from '../../services/api';
import { DiffViewerModal } from '../DiffViewer/DiffViewerModal';

interface MasterProfileViewProps {
  profile: MasterProfile;
  onUpdateProfile: (updated: MasterProfile) => void;
  onOpenDocuments: () => void;
}

export const MasterProfileView: React.FC<MasterProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenDocuments,
}) => {
  // Diff viewer state
  const [diffData, setDiffData] = useState<OptimizeTextResult | null>(null);
  const [diffTargetField, setDiffTargetField] = useState<{ type: 'summary' | 'bullet'; expId?: string; bulletIndex?: number } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Profile completeness calculation
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.personalInfo.fullName) score += 15;
    if (profile.personalInfo.professionalTitle) score += 10;
    if (profile.personalInfo.email && profile.personalInfo.phone) score += 10;
    if (profile.summary.length > 50) score += 15;
    if (profile.experiences.length > 0) score += 20;
    if (profile.education.length > 0) score += 15;
    if (profile.skills.length >= 4) score += 10;
    if (profile.certifications.length > 0 || profile.languages.length > 0) score += 5;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  const handleOptimizeSummary = async () => {
    setIsOptimizing(true);
    try {
      const res = await optimizeTextWithAi(
        profile.summary,
        `Perfil de ${profile.personalInfo.professionalTitle}`,
        'Especialista'
      );
      setDiffData(res);
      setDiffTargetField({ type: 'summary' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimizeBullet = async (expId: string, bulletText: string, bulletIndex: number) => {
    setIsOptimizing(true);
    try {
      const res = await optimizeTextWithAi(
        bulletText,
        'Experiencia laboral en CV',
        'Ingeniería y Proyectos'
      );
      setDiffData(res);
      setDiffTargetField({ type: 'bullet', expId, bulletIndex });
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyDiff = (approvedText: string) => {
    if (!diffTargetField) return;

    if (diffTargetField.type === 'summary') {
      onUpdateProfile({
        ...profile,
        summary: approvedText,
        updatedAt: new Date().toISOString(),
      });
    } else if (diffTargetField.type === 'bullet' && diffTargetField.expId) {
      const updatedExperiences = profile.experiences.map(exp => {
        if (exp.id === diffTargetField.expId) {
          const newBullets = [...exp.bullets];
          if (typeof diffTargetField.bulletIndex === 'number') {
            newBullets[diffTargetField.bulletIndex] = approvedText;
          }
          return { ...exp, bullets: newBullets };
        }
        return exp;
      });
      onUpdateProfile({
        ...profile,
        experiences: updatedExperiences,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner & Completeness */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                {profile.personalInfo.fullName}
              </h2>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                Perfil Maestro Centralizado
              </span>
            </div>
            <p className="text-sm font-medium text-neutral-600">
              {profile.personalInfo.professionalTitle}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 font-mono pt-1">
              <span>{profile.personalInfo.email}</span>
              <span>·</span>
              <span>{profile.personalInfo.phone}</span>
              <span>·</span>
              <span>{profile.personalInfo.location}</span>
              {profile.personalInfo.collegeNumber && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-neutral-700">{profile.personalInfo.collegeNumber}</span>
                </>
              )}
            </div>
          </div>

          {/* Completeness Card */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl min-w-[240px] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-neutral-700">Completitud del Perfil</span>
              <span className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                {completeness}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-2">
              Registrado una vez: listo para derivar múltiples CVs adaptados.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: RESUMEN / PERFIL PROFESIONAL */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Perfil / Resumen Profesional Maestro
            </h3>
            <EvidenceBadge status="declared" showLabel={false} />
          </div>
          <button
            type="button"
            onClick={handleOptimizeSummary}
            disabled={isOptimizing}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Optimizar redacción con IA
          </button>
        </div>

        <p className="text-sm text-neutral-700 leading-relaxed text-justify bg-neutral-50/60 p-4 rounded-xl border border-neutral-200">
          {profile.summary}
        </p>
      </section>

      {/* SECTION: EXPERIENCIA LABORAL */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Historial de Experiencias Laborales ({profile.experiences.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Cada experiencia sustenta tu trayectoria y puede activarse en los CVs que desees.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDocuments}
            className="text-xs text-emerald-700 font-semibold hover:text-emerald-900 flex items-center gap-1 underline"
          >
            <FileCheck className="w-4 h-4" />
            Vincular constancias de trabajo
          </button>
        </div>

        <div className="divide-y divide-neutral-200">
          {profile.experiences.map(exp => (
            <div key={exp.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-neutral-900">{exp.position}</h4>
                    <EvidenceBadge status={exp.evidenceStatus} />
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    <strong>{exp.company}</strong> · {exp.location} · Sector {exp.sector}
                  </p>
                </div>
                <span className="text-xs font-mono text-neutral-500 tabular-nums self-start bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  {exp.startDate} a {exp.isCurrent ? 'Presente' : exp.endDate}
                </span>
              </div>

              {exp.description && (
                <p className="text-xs text-neutral-600 italic">{exp.description}</p>
              )}

              {/* Bullets with individual AI optimization */}
              <div className="space-y-1.5 pl-2 border-l-2 border-neutral-200">
                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start justify-between gap-3 text-xs group">
                    <p className="text-neutral-700 flex-1 leading-relaxed">
                      • {bullet}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOptimizeBullet(exp.id, bullet, bIdx)}
                      title="Mejorar redacción con verbos de acción fidedignos"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 shrink-0 px-2 py-0.5 bg-blue-50 rounded"
                    >
                      <Sparkles className="w-3 h-3" />
                      Mejorar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: EDUCACIÓN Y FORMACIÓN */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Formación Académica y Grados ({profile.education.length})
          </h3>
          <button
            type="button"
            onClick={onOpenDocuments}
            className="text-xs text-emerald-700 font-semibold hover:text-emerald-900 flex items-center gap-1 underline"
          >
            <ShieldCheck className="w-4 h-4" />
            Verificar con constancia SUNEDU
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.education.map(edu => (
            <div key={edu.id} className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50 space-y-1">
              <div className="flex items-start justify-between">
                <span className="font-bold text-sm text-neutral-900">{edu.degree}</span>
                <EvidenceBadge status={edu.evidenceStatus} />
              </div>
              <p className="text-xs font-medium text-neutral-700">{edu.institution}</p>
              <p className="text-xs text-neutral-500">{edu.fieldOfStudy}</p>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80 text-[11px] font-mono text-neutral-500">
                <span>{edu.startDate} – {edu.endDate}</span>
                <span className="font-semibold text-emerald-800">{edu.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: HABILIDADES, SOFTWARE E IDIOMAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Habilidades Técnicas y Software ({profile.skills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(sk => (
              <div
                key={sk.id}
                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs flex items-center gap-2"
              >
                <span className="font-semibold text-neutral-800">{sk.name}</span>
                <EvidenceBadge status={sk.evidenceStatus} showLabel={false} />
              </div>
            ))}
          </div>
        </section>

        {/* Languages & Certifications */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Idiomas y Certificaciones
          </h3>
          <div className="space-y-2 text-xs">
            {profile.languages.map(l => (
              <div key={l.id} className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="font-medium text-neutral-900">{l.language}</span>
                <span className="text-neutral-500 font-mono">{l.level}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Certificaciones Acreditadas
            </span>
            {profile.certifications.map(c => (
              <div key={c.id} className="text-xs p-2 bg-emerald-50/40 border border-emerald-200/60 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-900 block">{c.title}</span>
                  <span className="text-neutral-500 text-[11px]">{c.issuer}</span>
                </div>
                <EvidenceBadge status={c.evidenceStatus} showLabel={false} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Diff Viewer Modal for AI changes */}
      <DiffViewerModal
        isOpen={Boolean(diffData)}
        onClose={() => setDiffData(null)}
        diffData={diffData}
        onApply={handleApplyDiff}
      />
    </div>
  );
};
