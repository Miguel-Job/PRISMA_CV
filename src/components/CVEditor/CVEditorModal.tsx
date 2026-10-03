import React, { useState } from 'react';
import { X, Download, Printer, FileText, Sparkles, Check, SearchCheck, Layers, Layout, ChevronRight, Eye } from 'lucide-react';
import { MasterProfile, CVVersion, TemplateId } from '../../types';
import { CVRenderer } from '../CVPreview/CVRenderer';
import { downloadCvAsDocx } from '../../utils/docxExport';
import { printCv } from '../../utils/pdfExport';
import { ATSReviewModal } from '../ATSReview/ATSReviewModal';
import { EvidenceBadge } from '../EvidenceBadge';

interface CVEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: CVVersion;
  profile: MasterProfile;
  onSaveCv: (updatedCv: CVVersion) => void;
}

export const CVEditorModal: React.FC<CVEditorModalProps> = ({
  isOpen,
  onClose,
  cv,
  profile,
  onSaveCv,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'experience' | 'education' | 'skills' | 'template'>('experience');
  const [currentCv, setCurrentCv] = useState<CVVersion>({ ...cv });
  const [showAtsReview, setShowAtsReview] = useState(false);
  const [mobileShowPreview, setMobileShowPreview] = useState(false);

  const handleToggleExperience = (id: string) => {
    const ids = currentCv.selectedExperienceIds.includes(id)
      ? currentCv.selectedExperienceIds.filter(x => x !== id)
      : [...currentCv.selectedExperienceIds, id];
    setCurrentCv({ ...currentCv, selectedExperienceIds: ids, updatedAt: new Date().toISOString() });
  };

  const handleToggleEducation = (id: string) => {
    const ids = currentCv.selectedEducationIds.includes(id)
      ? currentCv.selectedEducationIds.filter(x => x !== id)
      : [...currentCv.selectedEducationIds, id];
    setCurrentCv({ ...currentCv, selectedEducationIds: ids, updatedAt: new Date().toISOString() });
  };

  const handleToggleSkill = (id: string) => {
    const ids = currentCv.selectedSkillIds.includes(id)
      ? currentCv.selectedSkillIds.filter(x => x !== id)
      : [...currentCv.selectedSkillIds, id];
    setCurrentCv({ ...currentCv, selectedSkillIds: ids, updatedAt: new Date().toISOString() });
  };

  const handleSelectTemplate = (templateId: TemplateId) => {
    setCurrentCv({ ...currentCv, templateId, updatedAt: new Date().toISOString() });
  };

  const handleSave = () => {
    onSaveCv(currentCv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-100 w-full h-full flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="px-6 py-3.5 bg-white border-b border-neutral-200 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentCv.name}
                  onChange={e => setCurrentCv({ ...currentCv, name: e.target.value })}
                  className="font-bold text-sm text-neutral-900 bg-transparent hover:bg-neutral-100 px-1.5 py-0.5 rounded focus:bg-white focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-xs text-neutral-400 font-mono">v{currentCv.versionNumber}</span>
              </div>
              <p className="text-xs text-neutral-500 truncate max-w-md">
                {currentCv.targetObjective || 'CV derivado del perfil maestro'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Toggle Preview */}
            <button
              type="button"
              onClick={() => setMobileShowPreview(!mobileShowPreview)}
              className="lg:hidden px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-700 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              {mobileShowPreview ? 'Editar' : 'Vista Previa'}
            </button>

            {/* ATS Audit */}
            <button
              type="button"
              onClick={() => setShowAtsReview(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <SearchCheck className="w-4 h-4 text-emerald-600" />
              Auditoría ATS
            </button>

            {/* Export DOCX */}
            <button
              type="button"
              onClick={() => downloadCvAsDocx(profile, currentCv)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              DOCX (Word)
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={printCv}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Descargar PDF / Imprimir
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Guardar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Workspace Layout: Left Sidebar Selectors & Right A4 Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Selectors from Master Profile */}
          <div
            className={`w-full lg:w-[460px] xl:w-[500px] bg-white border-r border-neutral-200 flex flex-col shrink-0 overflow-hidden ${
              mobileShowPreview ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Sub-navigation tabs */}
            <div className="flex items-center gap-1 p-2 bg-neutral-50 border-b border-neutral-200 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'experience'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Experiencia ({currentCv.selectedExperienceIds.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('education')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'education'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Educación ({currentCv.selectedEducationIds.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'skills'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Habilidades ({currentCv.selectedSkillIds.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'template'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Plantilla
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'info'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Resumen / Objetivo
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {/* TAB: EXPERIENCIAS */}
              {activeTab === 'experience' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Selecciona las experiencias a incluir en este CV</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentCv({
                          ...currentCv,
                          selectedExperienceIds:
                            currentCv.selectedExperienceIds.length === profile.experiences.length
                              ? []
                              : profile.experiences.map(e => e.id),
                        })
                      }
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {currentCv.selectedExperienceIds.length === profile.experiences.length
                        ? 'Deseleccionar todas'
                        : 'Seleccionar todas'}
                    </button>
                  </div>

                  {profile.experiences.map(exp => {
                    const isSelected = currentCv.selectedExperienceIds.includes(exp.id);
                    return (
                      <div
                        key={exp.id}
                        onClick={() => handleToggleExperience(exp.id)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                            : 'bg-neutral-50/60 border-neutral-200 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-900">{exp.position}</span>
                              <EvidenceBadge status={exp.evidenceStatus} showLabel={false} />
                            </div>
                            <p className="text-neutral-600 mt-0.5">{exp.company} · {exp.location}</p>
                            <p className="text-neutral-400 font-mono text-[11px] mt-0.5">
                              {exp.startDate} – {exp.isCurrent ? 'Presente' : exp.endDate}
                            </p>
                            <p className="text-neutral-500 text-[11px] mt-1 line-clamp-2">
                              {exp.bullets?.[0] || exp.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB: EDUCACIÓN */}
              {activeTab === 'education' && (
                <div className="space-y-3">
                  <span className="text-xs text-neutral-500 block">
                    Selecciona los grados y estudios a incluir
                  </span>
                  {profile.education.map(edu => {
                    const isSelected = currentCv.selectedEducationIds.includes(edu.id);
                    return (
                      <div
                        key={edu.id}
                        onClick={() => handleToggleEducation(edu.id)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                            : 'bg-neutral-50/60 border-neutral-200 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 rounded text-blue-600"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-900">{edu.degree}</span>
                              <EvidenceBadge status={edu.evidenceStatus} showLabel={false} />
                            </div>
                            <p className="text-neutral-600 mt-0.5">{edu.institution}</p>
                            <p className="text-neutral-400 font-mono text-[11px]">{edu.startDate} – {edu.endDate}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB: HABILIDADES */}
              {activeTab === 'skills' && (
                <div className="space-y-3">
                  <span className="text-xs text-neutral-500 block">
                    Haz clic en una habilidad para agregarla o quitarla de esta versión de CV
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(sk => {
                      const isSelected = currentCv.selectedSkillIds.includes(sk.id);
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          onClick={() => handleToggleSkill(sk.id)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-slate-900 border-slate-900 text-white font-medium shadow-xs'
                              : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                          }`}
                        >
                          <span>{sk.name}</span>
                          <span className="text-[10px] opacity-70">({sk.category})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: PLANTILLA */}
              {activeTab === 'template' && (
                <div className="space-y-3">
                  <span className="text-xs text-neutral-500 block">
                    Selecciona el estilo de documento recomendado para tu objetivo
                  </span>

                  {/* Template Option: ATS Estándar */}
                  <div
                    onClick={() => handleSelectTemplate('ats_standard')}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                      currentCv.templateId === 'ats_standard'
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900">1. ATS Profesional Estándar</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                        Recomendado ATS (100% Parser)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Columna única universal, máxima legibilidad algorítmica y jerarquía limpia para sistemas de selección corporativos.
                    </p>
                  </div>

                  {/* Template Option: Ejecutivo Moderno */}
                  <div
                    onClick={() => handleSelectTemplate('executive_modern')}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                      currentCv.templateId === 'executive_modern'
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900">2. Ejecutivo / Consultoría</span>
                      <span className="text-[10px] text-neutral-500">2 Columnas</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Diseño distinguido con barra lateral para competencias y certificaciones. Ideal para mandos medios y consultores.
                    </p>
                  </div>

                  {/* Template Option: Oficial Perú */}
                  <div
                    onClick={() => handleSelectTemplate('peru_official')}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                      currentCv.templateId === 'peru_official'
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900">3. Oficial Perú (CAS / SUNEDU / CIP)</span>
                      <span className="text-[10px] bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded font-semibold">
                        Sector Público
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Estructura tabular estandarizada con declaración jurada, DNI, número de colegiatura y cuadros de formación.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: INFO Y OBJETIVO */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Objetivo de esta versión de CV
                    </label>
                    <input
                      type="text"
                      value={currentCv.targetObjective}
                      onChange={e => setCurrentCv({ ...currentCv, targetObjective: e.target.value })}
                      placeholder="Ej. Postulación a puesto de Hidrología en Sector Minero"
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Resumen adaptado para este CV (opcional)
                    </label>
                    <textarea
                      value={currentCv.customSummary ?? profile.summary}
                      onChange={e => setCurrentCv({ ...currentCv, customSummary: e.target.value })}
                      rows={5}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white leading-relaxed"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Si lo modificas aquí, solo cambiará en este CV sin alterar el Perfil Maestro.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Live A4 Real-Time Preview */}
          <div
            className={`flex-1 bg-neutral-200/70 p-4 sm:p-6 lg:p-8 overflow-y-auto items-center justify-center ${
              !mobileShowPreview ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="w-full max-w-[820px] transition-all duration-200">
              <CVRenderer
                profile={profile}
                cv={currentCv}
                templateId={currentCv.templateId}
              />
            </div>
          </div>
        </div>

        {/* ATS Review Modal */}
        <ATSReviewModal
          isOpen={showAtsReview}
          onClose={() => setShowAtsReview(false)}
          cv={currentCv}
          profile={profile}
        />
      </div>
    </div>
  );
};
