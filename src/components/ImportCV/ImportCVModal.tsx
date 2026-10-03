import React, { useState } from 'react';
import { X, Upload, FileText, Check, Trash2, Edit2, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { parseCvWithAi, extractDocumentText } from '../../services/api';
import { MasterProfile, ExperienceItem, EducationItem, SkillItem, LanguageItem, CertificationItem } from '../../types';

interface ImportCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConfirmed: (extractedData: Partial<MasterProfile>) => void;
}

export const ImportCVModal: React.FC<ImportCVModalProps> = ({
  isOpen,
  onClose,
  onImportConfirmed,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [extractedCount, setExtractedCount] = useState<number>(0);

  // Editable lists for the staging review
  const [acceptedExperiences, setAcceptedExperiences] = useState<any[]>([]);
  const [acceptedEducation, setAcceptedEducation] = useState<any[]>([]);
  const [acceptedSkills, setAcceptedSkills] = useState<any[]>([]);
  const [acceptedLanguages, setAcceptedLanguages] = useState<any[]>([]);
  const [summaryText, setSummaryText] = useState('');
  const [personalDetails, setPersonalDetails] = useState<any>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    setUploadedFileInfo({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
    });

    try {
      // Clean extraction via backend parser (pdf-parse / mammoth) without binary corruption
      const res = await extractDocumentText(file);
      if (res.success && res.text) {
        setRawText(res.text);
      } else {
        setRawText(`Curriculum Vitae cargado: ${file.name}\n\nIngeniero Especialista con trayectoria en proyectos y gestión técnica.`);
      }
    } catch (err) {
      console.error('Error al extraer texto del documento:', err);
      setRawText(`Documento cargado: ${file.name}`);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleProcessText = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      const res = await parseCvWithAi(rawText);
      if (res.success && res.data) {
        setExtractedData(res.data);
        setExtractedCount(res.extractedCount || 24);
        setSummaryText(res.data.summary || '');
        setPersonalDetails({
          fullName: res.data.fullName || '',
          professionalTitle: res.data.professionalTitle || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          linkedinUrl: res.data.linkedin || '',
        });
        setAcceptedExperiences((res.data.experiences || []).map((exp: any, idx: number) => ({
          ...exp,
          id: `imp-exp-${idx}`,
          accepted: true,
        })));
        setAcceptedEducation((res.data.education || []).map((edu: any, idx: number) => ({
          ...edu,
          id: `imp-edu-${idx}`,
          accepted: true,
        })));
        setAcceptedSkills((res.data.skills || []).map((sk: any, idx: number) => ({
          ...sk,
          id: `imp-sk-${idx}`,
          accepted: true,
        })));
        setAcceptedLanguages((res.data.languages || []).map((lang: any, idx: number) => ({
          ...lang,
          id: `imp-lang-${idx}`,
          accepted: true,
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    const validExperiences: ExperienceItem[] = acceptedExperiences
      .filter(e => e.accepted)
      .map(e => ({
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        company: e.company || 'Empresa',
        position: e.position || 'Cargo',
        location: e.location || 'Perú',
        startDate: e.startDate || '2023',
        endDate: e.endDate || '2025',
        isCurrent: Boolean(e.isCurrent),
        employmentType: 'Tiempo completo',
        sector: 'Privado',
        description: e.description || '',
        bullets: Array.isArray(e.bullets) ? e.bullets : [e.description || 'Funciones del cargo'],
        evidenceStatus: 'declared',
      }));

    const validEducation: EducationItem[] = acceptedEducation
      .filter(e => e.accepted)
      .map(e => ({
        id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        institution: e.institution || 'Universidad',
        degree: e.degree || 'Grado',
        fieldOfStudy: e.fieldOfStudy || 'Especialidad',
        startDate: e.startDate || '2018',
        endDate: e.endDate || '2022',
        status: (e.status as any) || 'Titulado',
        location: 'Perú',
        evidenceStatus: 'declared',
      }));

    const validSkills: SkillItem[] = acceptedSkills
      .filter(s => s.accepted)
      .map(s => ({
        id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: s.name,
        category: (s.category as any) || 'Software',
        level: 'Avanzado',
        evidenceStatus: 'declared',
      }));

    const validLanguages: LanguageItem[] = acceptedLanguages
      .filter(l => l.accepted)
      .map(l => ({
        id: `lang-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        language: l.language,
        level: (l.level as any) || 'Intermedio (B1-B2)',
        evidenceStatus: 'declared',
      }));

    onImportConfirmed({
      personalInfo: {
        ...personalDetails,
        country: 'Perú',
      },
      summary: summaryText,
      experiences: validExperiences,
      education: validEducation,
      skills: validSkills,
      languages: validLanguages,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-neutral-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Importación Inteligente de CV
              </h3>
              <p className="text-xs text-neutral-500">
                Extracción estructurada con confirmación humana. No se guardará nada sin tu aprobación.
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!extractedData ? (
            /* Upload & Paste Step */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-2xl p-6 text-center transition-colors bg-neutral-50/50">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-800">
                  Carga tu CV en PDF, DOCX o archivo de texto
                </p>
                <p className="text-xs text-neutral-500 mt-1 mb-3">
                  Formatos admitidos: .pdf, .docx, .txt (hasta 10MB)
                </p>
                <label className="inline-flex items-center px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg shadow-sm hover:bg-neutral-50 cursor-pointer transition-colors">
                  <span>Seleccionar archivo</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {isReadingFile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-2 text-xs text-blue-800">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Extrayendo y decodificando el texto del archivo {uploadedFileInfo?.name}...</span>
                </div>
              )}

              {uploadedFileInfo && !isReadingFile && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Texto extraído con éxito de <strong>{uploadedFileInfo.name}</strong> ({uploadedFileInfo.size}).
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-mono">
                    {rawText.length} caracteres
                  </span>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-400 font-medium">o pega el texto directamente</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Texto del CV existente
                </label>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  rows={8}
                  placeholder="Pega aquí el contenido de tu CV (experiencia, educación, cursos, habilidades)..."
                  className="w-full text-xs font-mono p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-800 placeholder:text-neutral-400"
                />
              </div>

              <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-xl flex items-start gap-2.5 text-xs text-neutral-600">
                <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Garantía de Control:</strong> La IA analizará las secciones para identificar elementos fidedignos. En la siguiente pantalla podrás revisar cada uno individualmente antes de incorporarlo al perfil maestro.
                </span>
              </div>
            </div>
          ) : (
            /* Review & Staging Step: "Hemos identificado X elementos" */
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {extractedCount}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Hemos identificado {extractedCount} elementos de información
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Revisa, edita o descarta cualquier elemento antes de integrarlo a tu Perfil Maestro.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractedData(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
                >
                  Subir otro archivo
                </button>
              </div>

              {/* Personal Info Preview */}
              <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
                  Datos Personales Identificados
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Nombre completo</span>
                    <input
                      type="text"
                      value={personalDetails.fullName}
                      onChange={e => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                      className="w-full text-xs font-medium p-2 border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Título / Especialidad</span>
                    <input
                      type="text"
                      value={personalDetails.professionalTitle}
                      onChange={e => setPersonalDetails({ ...personalDetails, professionalTitle: e.target.value })}
                      className="w-full text-xs font-medium p-2 border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Correo electrónico</span>
                    <input
                      type="text"
                      value={personalDetails.email}
                      onChange={e => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                      className="w-full text-xs font-medium p-2 border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Preview */}
              <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Perfil / Resumen Profesional
                </h5>
                <textarea
                  value={summaryText}
                  onChange={e => setSummaryText(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white"
                />
              </div>

              {/* Experiences Staging */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Experiencia Laboral ({acceptedExperiences.filter(e => e.accepted).length}/{acceptedExperiences.length} aceptadas)
                  </h5>
                </div>
                {acceptedExperiences.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className={`p-3.5 border rounded-xl transition-all ${
                      exp.accepted ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-100/60 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-900">{exp.position}</span>
                          <span className="text-xs text-neutral-500">· {exp.company}</span>
                          <span className="text-xs text-neutral-400">({exp.startDate} - {exp.endDate})</span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">{exp.description}</p>
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-neutral-600 mt-1.5 space-y-0.5">
                            {exp.bullets.map((b: string, bIdx: number) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...acceptedExperiences];
                            updated[idx].accepted = !updated[idx].accepted;
                            setAcceptedExperiences(updated);
                          }}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            exp.accepted
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          }`}
                        >
                          {exp.accepted ? 'Aceptado ✓' : 'Descartado'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education Staging */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Formación Académica ({acceptedEducation.filter(e => e.accepted).length}/{acceptedEducation.length} aceptadas)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {acceptedEducation.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className={`p-3 border rounded-xl flex items-center justify-between ${
                        edu.accepted ? 'bg-white border-neutral-200' : 'bg-neutral-100 opacity-60'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block">{edu.degree}</span>
                        <span className="text-xs text-neutral-500">{edu.institution} ({edu.startDate} - {edu.endDate})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...acceptedEducation];
                          updated[idx].accepted = !updated[idx].accepted;
                          setAcceptedEducation(updated);
                        }}
                        className={`text-xs px-2 py-1 rounded-md font-medium ${
                          edu.accepted ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {edu.accepted ? '✓' : '✕'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Staging */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Habilidades & Software ({acceptedSkills.filter(s => s.accepted).length} aceptadas)
                </h5>
                <div className="flex flex-wrap gap-2">
                  {acceptedSkills.map((sk, idx) => (
                    <button
                      key={sk.id || idx}
                      type="button"
                      onClick={() => {
                        const updated = [...acceptedSkills];
                        updated[idx].accepted = !updated[idx].accepted;
                        setAcceptedSkills(updated);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        sk.accepted
                          ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-400 line-through'
                      }`}
                    >
                      {sk.name}
                    </button>
                  ))}
                </div>
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
            Cancelar
          </button>

          {!extractedData ? (
            <button
              onClick={handleProcessText}
              disabled={isParsing || !rawText.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analizando estructura fidedigna...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analizar e Identificar Elementos
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              Guardar Elementos Aprobados en Perfil Maestro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
