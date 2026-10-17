import React, { useState, useEffect } from 'react';
import { UserAccount, MasterProfile, CVVersion, JobApplication, DocumentItem } from '../../types';
import {
  ShieldCheck,
  Users,
  Eye,
  FileText,
  Briefcase,
  FolderCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  Search,
  Award,
  Calendar,
  Mail,
  MapPin,
  ExternalLink,
  X,
  GraduationCap,
  Layers,
  BarChart3
} from 'lucide-react';

interface AdminSupervisorDashboardProps {
  currentUser: UserAccount;
  onNavigateToUserWorkspace?: (user: UserAccount) => void;
}

interface RegisteredUserSummary {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role?: string;
  professionalArea?: string;
  academicDegree?: string;
  specialty?: string;
  yearsOfExperience?: string;
  createdAt: string;
  hasPassword?: boolean;
}

export const AdminSupervisorDashboard: React.FC<AdminSupervisorDashboardProps> = ({
  currentUser,
}) => {
  const [users, setUsers] = useState<RegisteredUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<RegisteredUserSummary | null>(null);
  const [auditTab, setAuditTab] = useState<'profile' | 'cvs' | 'applications' | 'documents'>('profile');

  // Load registered users from API and localStorage
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/users-list');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        // Fallback default
        setUsers([
          {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            fullName: currentUser.fullName,
            role: 'admin_general',
            professionalArea: 'Supervisión y Dirección General de Plataforma',
            createdAt: currentUser.createdAt,
          }
        ]);
      }
    } catch (e) {
      console.warn('Could not fetch server users, using fallback:', e);
      setUsers([
        {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          fullName: currentUser.fullName,
          role: 'admin_general',
          professionalArea: 'Supervisión y Dirección General de Plataforma',
          createdAt: currentUser.createdAt,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.professionalArea && u.professionalArea.toLowerCase().includes(q))
    );
  });

  // Calculate Metrics
  const totalUsers = users.length;
  const regularUsersCount = users.filter(u => u.role !== 'admin_general').length;
  const professionalAreasCount = new Set(users.map(u => u.professionalArea || 'General')).size;

  // Retrieve user data from user-scoped storage for the audited user
  const getAuditedUserData = (userId: string) => {
    try {
      const savedProfile = localStorage.getItem(`tm_master_profile_${userId}`);
      const savedCvs = localStorage.getItem(`tm_cv_versions_${userId}`);
      const savedApps = localStorage.getItem(`tm_applications_${userId}`);
      const savedDocs = localStorage.getItem(`tm_documents_${userId}`);

      return {
        profile: savedProfile ? (JSON.parse(savedProfile) as MasterProfile) : null,
        cvs: savedCvs ? (JSON.parse(savedCvs) as CVVersion[]) : [],
        apps: savedApps ? (JSON.parse(savedApps) as JobApplication[]) : [],
        docs: savedDocs ? (JSON.parse(savedDocs) as DocumentItem[]) : [],
      };
    } catch {
      return { profile: null, cvs: [], apps: [], docs: [] };
    }
  };

  const auditData = selectedUserForAudit ? getAuditedUserData(selectedUserForAudit.id) : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner: General Administration */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Oficina de Administración General PRISMA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panel de Supervisión y Métricas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Sesión activa: <strong className="text-white font-mono">{currentUser.email}</strong> · Rol: Administrador General
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar Registro</span>
          </button>
        </div>

        {/* Strict Privacy Notice */}
        <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-slate-300 leading-relaxed">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="text-white">Política de Confidencialidad y Privacidad:</strong> La visualización opera en <strong>estricto modo de solo lectura</strong>. Los datos personales, académicos y laborales ingresados por cada usuario están protegidos y no pueden ser alterados ni modificados por la administración.
          </span>
        </div>
      </div>

      {/* Metric & Statistical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Usuarios Registrados</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
            {totalUsers}
          </span>
          <span className="text-[11px] text-slate-500">
            {regularUsersCount} cuentas de profesionales
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Soberanía de Datos</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700 block">
            100%
          </span>
          <span className="text-[11px] text-slate-500">
            Aislamiento estricto por usuario
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Áreas Profesionales</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-purple-700 block">
            {professionalAreasCount}
          </span>
          <span className="text-[11px] text-slate-500">
            Sectores técnicos registrados
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Modo de Supervisión</span>
            <Eye className="w-4 h-4 text-slate-700" />
          </div>
          <span className="text-2xl font-bold text-slate-900 block text-base font-semibold">
            Solo Lectura
          </span>
          <span className="text-[11px] text-slate-500">
            Auditoría no invasiva
          </span>
        </div>
      </div>

      {/* Directory Table of Registered Users */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Relación de Usuarios de la Plataforma
            </h2>
            <p className="text-xs text-slate-500">
              Lista oficial de usuarios registrados en el sistema PRISMA
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, correo o área..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Usuario / Nombre</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Ámbito / Especialidad</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Fecha Registro</th>
                <th className="py-3 px-4 text-right">Supervisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron usuarios registrados con el criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isAdmin = user.role === 'admin_general' || user.email === 'prisma.dig.office@gmail.com';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${isAdmin ? 'bg-slate-900' : 'bg-blue-600'}`}>
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="block">{user.fullName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {user.professionalArea || 'Profesional General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAdmin ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {isAdmin ? 'Administrador General' : 'Candidato / Profesional'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-PE') : 'Reciente'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForAudit(user);
                            setAuditTab('profile');
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Auditar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* READ-ONLY AUDIT MODAL */}
      {selectedUserForAudit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    MODO AUDITORÍA (SOLO LECTURA)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedUserForAudit.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Expediente de {selectedUserForAudit.fullName}
                </h3>
                <p className="text-xs text-slate-300">
                  {selectedUserForAudit.email} · {selectedUserForAudit.professionalArea || 'Profesional'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForAudit(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold bg-slate-50">
              <button
                type="button"
                onClick={() => setAuditTab('profile')}
                className={`py-2.5 border-b-2 transition-colors ${
                  auditTab === 'profile'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Perfil Maestro
              </button>
              <button
                type="button"
                onClick={() => setAuditTab('cvs')}
                className={`py-2.5 border-b-2 transition-colors ${
                  auditTab === 'cvs'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                CVs Adaptados ({auditData?.cvs.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setAuditTab('applications')}
                className={`py-2.5 border-b-2 transition-colors ${
                  auditTab === 'applications'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Postulaciones ({auditData?.apps.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setAuditTab('documents')}
                className={`py-2.5 border-b-2 transition-colors ${
                  auditTab === 'documents'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Documentos ({auditData?.docs.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {auditTab === 'profile' && (
                <div className="space-y-6">
                  {/* Personal Info Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                      Datos de Contacto e Identificación
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Nombre Completo</span>
                        <strong className="text-slate-900">{selectedUserForAudit.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Correo Oficial</span>
                        <span className="font-mono text-slate-900">{selectedUserForAudit.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Área Profesional</span>
                        <span className="text-slate-900">{selectedUserForAudit.professionalArea || 'No especificada'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Grado Académico</span>
                        <span className="text-slate-900">{selectedUserForAudit.academicDegree || 'Registrado'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Experiences preview */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                      Trayectoria Laboral Registrada
                    </h4>
                    {!auditData?.profile?.experiences || auditData.profile.experiences.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                        El usuario aún no ha agregado experiencias laborales a su perfil maestro.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {auditData.profile.experiences.map(exp => (
                          <div key={exp.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900">{exp.position}</strong>
                              <span className="text-slate-500 font-mono">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <p className="text-slate-600">{exp.company} · {exp.location}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {auditTab === 'cvs' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                    Versiones de CV Generadas
                  </h4>
                  {!auditData?.cvs || auditData.cvs.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                      El usuario no tiene versiones de CV creadas aún.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {auditData.cvs.map(cv => (
                        <div key={cv.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                          <strong className="text-slate-900 block">{cv.name}</strong>
                          <span className="text-[11px] text-slate-500 block">Plantilla: {cv.templateId}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Actualizado: {new Date(cv.updatedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {auditTab === 'applications' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                    Postulaciones en Seguimiento
                  </h4>
                  {!auditData?.apps || auditData.apps.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                      Sin postulaciones registradas por el usuario.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditData.apps.map(app => (
                        <div key={app.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <strong className="text-slate-900 block">{app.position}</strong>
                            <span className="text-slate-600">{app.companyName}</span>
                          </div>
                          <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {auditTab === 'documents' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                    Expediente Documental
                  </h4>
                  {!auditData?.docs || auditData.docs.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                      Sin documentos o constancias adjuntadas en el expediente.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditData.docs.map(doc => (
                        <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <strong className="text-slate-900 block">{doc.name}</strong>
                            <span className="text-slate-500 text-[11px]">{doc.category} · {doc.issuer}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.isPrivate ? '🔒 Privado' : 'Público'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 italic">
                🔒 Vista de auditoría protegida. Los cambios están restringidos a cada usuario.
              </span>
              <button
                type="button"
                onClick={() => setSelectedUserForAudit(null)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
