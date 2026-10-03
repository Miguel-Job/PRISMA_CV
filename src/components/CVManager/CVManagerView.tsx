import React from 'react';
import { CVVersion, MasterProfile } from '../../types';
import { FileText, Copy, Edit3, Download, Lock, SearchCheck, Plus, Sparkles, Target, ArrowUpRight } from 'lucide-react';
import { downloadCvAsDocx } from '../../utils/docxExport';
import { printCv } from '../../utils/pdfExport';

interface CVManagerViewProps {
  cvVersions: CVVersion[];
  profile: MasterProfile;
  onEditCv: (cv: CVVersion) => void;
  onDuplicateCv: (cv: CVVersion) => void;
  onCreateNewCv: () => void;
  onAdaptCv: () => void;
  onAtsReviewCv: (cv: CVVersion) => void;
}

export const CVManagerView: React.FC<CVManagerViewProps> = ({
  cvVersions,
  profile,
  onEditCv,
  onDuplicateCv,
  onCreateNewCv,
  onAdaptCv,
  onAtsReviewCv,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Mis Versiones de CV ({cvVersions.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            Cada CV es una proyección adaptada de tu Perfil Maestro. Puedes crear versiones para convocatorias específicas sin duplicar tus datos originales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAdaptCv}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-colors"
          >
            <Target className="w-4 h-4" />
            Adaptar a Vacante
          </button>
          <button
            type="button"
            onClick={onCreateNewCv}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva Versión de CV
          </button>
        </div>
      </div>

      {/* Grid of Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cvVersions.map(cv => {
          const experiencesCount = cv.selectedExperienceIds.length;
          const skillsCount = cv.selectedSkillIds.length;
          const educationCount = cv.selectedEducationIds.length;

          return (
            <div
              key={cv.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                cv.isLocked ? 'border-neutral-300 ring-1 ring-neutral-200' : 'border-neutral-200'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                      v{cv.versionNumber}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {new Date(cv.updatedAt).toLocaleDateString('es-PE')}
                    </span>
                  </div>

                  {cv.isLocked ? (
                    <span
                      title="Esta versión está bloqueada para preservar la trazabilidad de una postulación ya enviada."
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                    >
                      <Lock className="w-3 h-3 text-amber-600" />
                      Bloqueado por Postulación
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Activo / Editable
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                    {cv.name}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                    {cv.targetObjective}
                  </p>
                </div>

                {cv.relatedJobOffer && (
                  <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200/80 text-[11px] text-neutral-600">
                    <strong className="text-neutral-800">Convocatoria:</strong> {cv.relatedJobOffer}
                  </div>
                )}

                {/* Scope Stats */}
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 font-mono">
                  <span>{experiencesCount} experiencias</span>
                  <span>·</span>
                  <span>{educationCount} estudios</span>
                  <span>·</span>
                  <span>{skillsCount} habilidades</span>
                </div>

                {/* Template Tag */}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-neutral-400">Plantilla:</span>
                  <span className="font-semibold text-neutral-700 uppercase tracking-wider text-[10px]">
                    {cv.templateId === 'ats_standard'
                      ? 'ATS Estándar'
                      : cv.templateId === 'executive_modern'
                      ? 'Ejecutivo 2 Col'
                      : 'Oficial Perú'}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAtsReviewCv(cv)}
                    title="Auditoría ATS"
                    className="p-2 text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <SearchCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateCv(cv)}
                    title="Duplicar para otra convocatoria"
                    className="p-2 text-neutral-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCvAsDocx(profile, cv)}
                    title="Descargar en Word DOCX"
                    className="p-2 text-neutral-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onEditCv(cv)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Abrir Editor
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
