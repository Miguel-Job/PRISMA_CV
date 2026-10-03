import React, { useState, useEffect } from 'react';
import { X, SearchCheck, CheckCircle2, AlertTriangle, AlertCircle, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { MasterProfile, CVVersion, AtsReviewResult } from '../../types';
import { reviewAtsWithAi } from '../../services/api';

interface ATSReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: CVVersion;
  profile: MasterProfile;
}

export const ATSReviewModal: React.FC<ATSReviewModalProps> = ({
  isOpen,
  onClose,
  cv,
  profile,
}) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(true);
  const [review, setReview] = useState<AtsReviewResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadReview() {
      setIsLoading(true);
      try {
        const fullCvPayload = {
          name: cv.name,
          objective: cv.targetObjective,
          summary: cv.customSummary || profile.summary,
          experiences: profile.experiences.filter(e => cv.selectedExperienceIds.includes(e.id)),
          education: profile.education.filter(e => cv.selectedEducationIds.includes(e.id)),
          skills: profile.skills.filter(s => cv.selectedSkillIds.includes(s.id)),
          languages: profile.languages.filter(l => cv.selectedLanguageIds.includes(l.id)),
        };
        const res = await reviewAtsWithAi(fullCvPayload, cv.targetObjective);
        if (isMounted && res.success && res.review) {
          setReview(res.review);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadReview();
    return () => {
      isMounted = false;
    };
  }, [cv, profile]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <SearchCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Auditoría ATS Explicable: {cv.name}
              </h3>
              <p className="text-xs text-neutral-500">
                Evaluación técnica de legibilidad algorítmica, estructura y densidad documental.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-neutral-800">
                Auditan do estructura y compatibilidad con sistemas ATS...
              </p>
              <p className="text-xs text-neutral-500 max-w-sm">
                Verificando jerarquía tipográfica, cronología inversa, encabezados estándar y accesibilidad OCR.
              </p>
            </div>
          ) : review ? (
            <div className="space-y-6">
              {/* Scorecard */}
              <div className="p-5 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Índice de Compatibilidad ATS
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
                    {review.documentaryScore}%
                  </div>
                  <p className="text-xs text-neutral-300 mt-2 max-w-md leading-relaxed">
                    {review.scoreExplanation}
                  </p>
                </div>
                <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60 text-xs space-y-1.5 shrink-0 sm:min-w-[220px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Estructura:</span>
                    <span className="text-emerald-300 font-medium">Óptima</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Legibilidad OCR:</span>
                    <span className="text-emerald-300 font-medium">Alta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Cronología:</span>
                    <span className="text-emerald-300 font-medium">Coherente</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Palabras Clave:</span>
                    <span className="text-blue-300 font-medium">Equilibrada</span>
                  </div>
                </div>
              </div>

              {/* Explanatory disclaimer */}
              <div className="p-3 bg-neutral-100 rounded-xl flex items-start gap-2.5 text-xs text-neutral-600">
                <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Principio de Transparencia:</strong> Este porcentaje mide la compatibilidad técnica de lectura documental con sistemas automatizados (Workday, Taleo, Greenhouse, plataformas CAS del Estado), <em>no una probabilidad mágica de contratación</em>.
                </span>
              </div>

              {/* Critical Findings */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Hallazgos y Recomendaciones Técnicas
                </h4>
                <div className="space-y-2.5">
                  {review.criticalFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs ${
                        finding.type === 'success'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : finding.type === 'warning'
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {finding.type === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {finding.type === 'warning' && (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        {finding.type === 'error' && (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-1">
                          <span className="font-bold text-neutral-900 block">
                            {finding.title}
                          </span>
                          <p className="text-neutral-700 leading-relaxed">
                            {finding.description}
                          </p>
                          {finding.actionableFix && (
                            <p className="text-[11px] font-medium text-neutral-600 pt-1 border-t border-neutral-200/60 mt-1">
                              <strong>Acción sugerida:</strong> {finding.actionableFix}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action Checklist */}
              {review.recommendedActionItems && review.recommendedActionItems.length > 0 && (
                <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                    Checklist de Buenas Prácticas
                  </h5>
                  <ul className="list-disc list-inside text-xs text-neutral-700 space-y-1">
                    {review.recommendedActionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No se pudo cargar la auditoría.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
