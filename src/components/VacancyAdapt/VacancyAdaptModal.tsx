import React, { useState } from 'react';
import { X, Target, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Loader2, Copy, FileCheck } from 'lucide-react';
import { MasterProfile, CVVersion, VacancyAnalysisResult } from '../../types';
import { analyzeVacancyWithAi } from '../../services/api';

interface VacancyAdaptModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterProfile: MasterProfile;
  onGenerateTailoredCv: (tailoredCv: Partial<CVVersion>, jobInfo: { company: string; position: string }) => void;
}

export const VacancyAdaptModal: React.FC<VacancyAdaptModalProps> = ({
  isOpen,
  onClose,
  masterProfile,
  onGenerateTailoredCv,
}) => {
  if (!isOpen) return null;

  const [vacancyText, setVacancyText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VacancyAnalysisResult | null>(null);

  const sampleVacancy = `CONVOCATORIA: ESPECIALISTA EN RECURSOS HÍDRICOS Y MODELAMIENTO SIG
Entidad: Consorcio Hidroambiental del Sur / Proyecto Cuencas
Requisitos:
1. Bachiller o Titulado en Ingeniería Agrícola, Civil o Ambiental. Colegiado y hábil.
2. Mínimo 2 años de experiencia específica en estudios de hidrología, delimitación de fajas marginales o máximas avenidas.
3. Dominio demostrado en software QGIS o ArcGIS para procesamiento ráster y delimitación de cuencas hidrográficas.
4. Conocimiento en modelamiento hidráulico con HEC-RAS (1D/2D) o HEC-HMS.
5. Experiencia de campo en aforos hidrométricos y calibración de estaciones.
6. Competencias en elaboración de informes técnicos para la Autoridad Nacional del Agua (ANA).`;

  const handleLoadSample = () => {
    setVacancyText(sampleVacancy);
  };

  const handleAnalyze = async () => {
    if (!vacancyText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeVacancyWithAi(vacancyText, masterProfile);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateCv = () => {
    if (!analysis) return;

    // Filter experiences matching job keywords
    const selectedExp = masterProfile.experiences.map(e => e.id);
    const selectedEdu = masterProfile.education.map(e => e.id);
    const selectedSkills = masterProfile.skills.map(s => s.id);

    const tailoredCv: Partial<CVVersion> = {
      name: `CV Adaptado - ${analysis.jobTitleIdentified || 'Convocatoria'}`,
      targetObjective: `Postulación formal orientada a ${analysis.jobTitleIdentified} en ${analysis.companyOrEntity}.`,
      templateId: 'ats_standard',
      customSummary: analysis.tailoredSummaryDraft || masterProfile.summary,
      selectedExperienceIds: selectedExp,
      selectedEducationIds: selectedEdu,
      selectedSkillIds: selectedSkills,
      selectedLanguageIds: masterProfile.languages.map(l => l.id),
      selectedCertificationIds: masterProfile.certifications.map(c => c.id),
      selectedProjectIds: masterProfile.projects.map(p => p.id),
      tags: ['Adaptado', 'Vacante', analysis.jobTitleIdentified.slice(0, 15)],
      relatedJobOffer: `${analysis.jobTitleIdentified} - ${analysis.companyOrEntity}`,
      isLocked: false,
    };

    onGenerateTailoredCv(tailoredCv, {
      company: analysis.companyOrEntity || 'Entidad Convocante',
      position: analysis.jobTitleIdentified || 'Puesto Requerido',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-neutral-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                🎯 Adaptar CV a una Vacante / Convocatoria
              </h3>
              <p className="text-xs text-neutral-500">
                Extracción de requisitos vs evidencia del perfil. Sin inventar datos para cubrir brechas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!analysis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">
                  Pega la descripción del puesto, TDR o convocatoria
                </label>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Cargar ejemplo de vacante técnica
                </button>
              </div>

              <textarea
                value={vacancyText}
                onChange={e => setVacancyText(e.target.value)}
                rows={12}
                placeholder="Pega aquí los requisitos, funciones, perfil del puesto o convocatoria..."
                className="w-full text-xs font-mono p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-800 leading-relaxed"
              />

              <div className="p-3.5 bg-neutral-100/70 border border-neutral-200 rounded-xl text-xs text-neutral-600 space-y-1">
                <span className="font-semibold text-neutral-900 block">Principio Anti-Alucinación:</span>
                <p>
                  Si la vacante solicita un requisito no presente en tu perfil maestro (por ejemplo, 5 años en un área donde tienes 2), el sistema marcará <span className="text-rose-600 font-semibold">🔴 No identificado</span> y te asesorará cómo enfocar honestamente tus fortalezas reales, sin fabricar información.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score and Overview */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider block">
                    Puesto identificado
                  </span>
                  <h4 className="text-base font-bold text-neutral-900">
                    {analysis.jobTitleIdentified} · <span className="font-normal text-neutral-600">{analysis.companyOrEntity}</span>
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1 max-w-xl">
                    {analysis.matchExplanation}
                  </p>
                </div>
                <div className="text-center sm:text-right shrink-0 bg-white p-3 rounded-lg border border-blue-100 shadow-xs">
                  <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
                    {analysis.matchPercentage}%
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Coincidencia documental
                  </span>
                </div>
              </div>

              {/* Requirement Match Matrix */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                  Matriz de Comparación: Requisitos vs Tu Perfil Maestro
                </h5>
                <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-200">
                  {analysis.requirements.map(req => (
                    <div key={req.id} className="p-3.5 bg-white flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-500 text-[11px] uppercase">
                            {req.category}
                          </span>
                        </div>
                        <p className="font-medium text-neutral-900">{req.requirement}</p>
                        <p className="text-neutral-500 text-[11px]">
                          <strong>Evidencia en tu perfil:</strong> {req.candidateEvidence}
                        </p>
                        {req.recommendation && (
                          <p className="text-blue-700 text-[11px] italic">
                            💡 Sugerencia: {req.recommendation}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 self-start">
                        {req.candidateMatchStatus === 'Coincide' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Coincide
                          </span>
                        )}
                        {req.candidateMatchStatus === 'Revisar' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Revisar / Declarado
                          </span>
                        )}
                        {req.candidateMatchStatus === 'No identificado' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            No identificado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Keywords & Honest Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50">
                  <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                    Palabras Clave Recomendadas a Resaltar
                  </h6>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.recommendedKeywordsToHighlight.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-800 text-xs rounded-md font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-amber-200 rounded-xl bg-amber-50/40">
                  <h6 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Brechas Reales a Tratar con Honestidad
                  </h6>
                  <ul className="list-disc list-inside text-xs text-amber-950 space-y-1">
                    {analysis.gapsToAddressHonestly.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tailored Summary Proposal */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50">
                <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Propuesta de Resumen Enfocado al Puesto (Sin inventar datos)
                </h6>
                <p className="text-xs text-neutral-800 leading-relaxed font-sans bg-white p-3 rounded-lg border border-neutral-200">
                  {analysis.tailoredSummaryDraft}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cerrar
          </button>

          {!analysis ? (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !vacancyText.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Comparando perfil con vacante...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analizar Requisitos y Comparar
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAnalysis(null)}
                className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Analizar otra oferta
              </button>
              <button
                onClick={handleCreateCv}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition-all"
              >
                <FileCheck className="w-4 h-4" />
                Generar CV Adaptado para esta Vacante
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
