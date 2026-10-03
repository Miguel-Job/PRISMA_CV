import React, { useState } from 'react';
import { JobApplication, ApplicationStatus, CVVersion } from '../../types';
import { Briefcase, Calendar, Plus, ExternalLink, Clock, CheckCircle, XCircle, Search, Filter, Lock } from 'lucide-react';

interface ApplicationsViewProps {
  applications: JobApplication[];
  cvVersions: CVVersion[];
  onAddApplication: (app: JobApplication) => void;
  onUpdateStatus: (appId: string, newStatus: ApplicationStatus) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  cvVersions,
  onAddApplication,
  onUpdateStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // New application form state
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [selectedCvId, setSelectedCvId] = useState(cvVersions[0]?.id || '');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [offerUrl, setOfferUrl] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [notes, setNotes] = useState('');

  const statusColors: Record<ApplicationStatus, string> = {
    'Por revisar': 'bg-neutral-100 text-neutral-800',
    'Preparando': 'bg-blue-100 text-blue-800',
    'Postulado': 'bg-indigo-100 text-indigo-800',
    'En evaluación': 'bg-amber-100 text-amber-800',
    'Entrevista': 'bg-purple-100 text-purple-800 font-bold',
    'Finalizado': 'bg-neutral-200 text-neutral-700',
    'Descartado': 'bg-rose-100 text-rose-800',
    'Aceptado': 'bg-emerald-100 text-emerald-800 font-bold',
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !position) return;

    const chosenCv = cvVersions.find(c => c.id === selectedCvId) || cvVersions[0];

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      companyName,
      position,
      applicationDate: new Date().toISOString().split('T')[0],
      deadlineDate: deadlineDate || undefined,
      cvVersionIdUsed: chosenCv.id,
      cvVersionNameUsed: chosenCv.name,
      status: 'Preparando',
      offerUrl: offerUrl || undefined,
      salaryOffered: salaryOffered || undefined,
      notes: notes || undefined,
    };

    onAddApplication(newApp);
    setIsCreating(false);
    setCompanyName('');
    setPosition('');
    setNotes('');
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            📋 Mis Postulaciones ({applications.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            Trazabilidad completa: cada postulación queda vinculada al CV histórico exacto que enviaste, protegiendo tus versiones frente a modificaciones no deseadas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Registrar Postulación
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por empresa o puesto..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-neutral-100 rounded-lg">
          {['all', 'Preparando', 'Postulado', 'En evaluación', 'Entrevista', 'Aceptado'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {st === 'all' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.map(app => (
          <div
            key={app.id}
            className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-neutral-300"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusColors[app.status]}`}>
                  {app.status}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Registrado el {app.applicationDate}
                </span>
                {app.deadlineDate && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono">
                    Límite: {app.deadlineDate}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-neutral-900 pt-1">
                {app.position}
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                {app.companyName} {app.location ? `· ${app.location}` : ''} {app.salaryOffered ? `· ${app.salaryOffered}` : ''}
              </p>

              {/* Linked CV Version with history lock indicator */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>
                  CV utilizado: <strong className="text-neutral-800">{app.cvVersionNameUsed}</strong>
                </span>
              </div>

              {app.notes && (
                <p className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-200/60 mt-2">
                  {app.notes}
                </p>
              )}
            </div>

            {/* Quick Status Selector */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <select
                value={app.status}
                onChange={e => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                className="text-xs font-semibold px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 focus:bg-white cursor-pointer"
              >
                <option value="Por revisar">Por revisar</option>
                <option value="Preparando">Preparando</option>
                <option value="Postulado">Postulado</option>
                <option value="En evaluación">En evaluación</option>
                <option value="Entrevista">Entrevista</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Descartado">Descartado</option>
                <option value="Aceptado">Aceptado</option>
              </select>

              {app.offerUrl && (
                <a
                  href={app.offerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                  title="Abrir enlace de la convocatoria"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Application Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Registrar Nueva Postulación
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Empresa o Entidad Pública
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Autoridad Nacional del Agua / Minera Chinalco"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Puesto o Convocatoria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Especialista en Recursos Hídricos (CAS N° 045)"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  CV Versionado Utilizado (Bloqueará esta versión)
                </label>
                <select
                  value={selectedCvId}
                  onChange={e => setSelectedCvId(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg bg-neutral-50"
                >
                  {cvVersions.map(cv => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name} (v{cv.versionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Fecha límite de envío
                  </label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Rango Salarial / Honorario
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. S/ 6,500"
                    value={salaryOffered}
                    onChange={e => setSalaryOffered(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Enlace de la convocatoria o vacante
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={offerUrl}
                  onChange={e => setOfferUrl(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Notas de seguimiento
                </label>
                <textarea
                  rows={2}
                  placeholder="Anotaciones sobre contactos, fechas de entrevista o requisitos específicos..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow-sm"
                >
                  Guardar Postulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
