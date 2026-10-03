import React, { useState } from 'react';
import { DocumentItem, MasterProfile } from '../../types';
import { FolderCheck, Upload, FileText, CheckCircle2, Shield, Lock, Eye, Trash2, Link2, ExternalLink } from 'lucide-react';
import { EvidenceBadge } from '../EvidenceBadge';

interface DocumentsViewProps {
  documents: DocumentItem[];
  profile: MasterProfile;
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onTogglePrivacy: (docId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  profile,
  onAddDocument,
  onDeleteDocument,
  onTogglePrivacy,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  // Upload form state
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('Constancia');
  const [issuer, setIssuer] = useState('');
  const [notes, setNotes] = useState('');
  const [linkedEntity, setLinkedEntity] = useState('');

  const categories = [
    'all',
    'Titulo',
    'Bachiller',
    'Certificado',
    'Constancia',
    'Curso',
    'Diplomado',
    'Publicacion',
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !issuer) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: docName,
      category: docCategory,
      fileName: `${docName.replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      issuer,
      verificationStatus: 'verified',
      notes,
      linkedEntityId: linkedEntity || undefined,
      isPrivate: true,
    };

    onAddDocument(newDoc);
    setIsUploading(false);
    setDocName('');
    setIssuer('');
    setNotes('');
  };

  const filteredDocs = documents.filter(doc => {
    return selectedCategory === 'all' || doc.category === selectedCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            📁 Expediente Profesional y Documentos Sustentatorios ({documents.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            Repositorio de títulos SUNEDU, constancias de trabajo y certificados. Vincularlos convierte tus datos declarados en evidencia verificada (🟢).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploading(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Adjuntar Documento Sustentatorio
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-xl text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {cat === 'all' ? 'Todos los Documentos' : cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 mt-1 leading-snug">
                      {doc.name}
                    </h3>
                  </div>
                </div>

                <EvidenceBadge status={doc.verificationStatus} />
              </div>

              <div className="text-xs text-neutral-600 space-y-0.5 pt-1">
                <p><strong>Emisor:</strong> {doc.issuer}</p>
                <p className="text-neutral-500 font-mono text-[11px]">
                  Archivo: {doc.fileName} · {doc.fileSize} · Subido el {doc.uploadDate}
                </p>
                {doc.notes && (
                  <p className="text-neutral-500 italic text-[11px] pt-1">
                    Nota: {doc.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Document Footer Controls */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => onTogglePrivacy(doc.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  doc.isPrivate
                    ? 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {doc.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {doc.isPrivate ? 'Privado' : 'Visible con enlace'}
              </button>

              <button
                type="button"
                onClick={() => onDeleteDocument(doc.id)}
                className="text-neutral-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                title="Eliminar documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Adjuntar Documento al Expediente Profesional
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nombre del Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Constancia de Trabajo - HidroConsulting S.A.C."
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-neutral-50"
                  >
                    <option value="Titulo">Título Profesional</option>
                    <option value="Bachiller">Bachiller</option>
                    <option value="Certificado">Certificado</option>
                    <option value="Constancia">Constancia Laboral</option>
                    <option value="Curso">Curso / Taller</option>
                    <option value="Diplomado">Diplomado</option>
                    <option value="Publicacion">Publicación</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Entidad Emisora
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. UNALM / Colegio de Ingenieros"
                    value={issuer}
                    onChange={e => setIssuer(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Vincular con elemento del Perfil Maestro (Opcional)
                </label>
                <select
                  value={linkedEntity}
                  onChange={e => setLinkedEntity(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg bg-neutral-50"
                >
                  <option value="">-- No vincular por ahora --</option>
                  <optgroup label="Experiencias">
                    {profile.experiences.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.position} en {e.company}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Educación">
                    {profile.education.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.degree} ({e.institution})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Vincularlo cambiará el estado de la experiencia o estudio a 🟢 Verificado.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Observaciones o Código de Registro
                </label>
                <input
                  type="text"
                  placeholder="Ej. Registro N° 284192 / Libro 12 Folio 45"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-emerald-700 hover:bg-emerald-800 font-semibold rounded-lg shadow-sm"
                >
                  Guardar en Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
