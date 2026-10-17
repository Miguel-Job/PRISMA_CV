import React, { useState, useEffect } from 'react';
import {
  INITIAL_PROFILE,
  INITIAL_CV_VERSIONS,
  INITIAL_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_PRIVACY_SETTINGS,
  createEmptyProfile,
  createEmptyCvVersions,
  createEmptyApplications,
  createEmptyDocuments,
  createEmptyPrivacySettings,
} from './data/initialData';
import { MasterProfile, CVVersion, JobApplication, DocumentItem, PrivacySettings, ApplicationStatus, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/Dashboard/HomeDashboard';
import { MasterProfileView } from './components/MasterProfile/MasterProfileView';
import { CVManagerView } from './components/CVManager/CVManagerView';
import { ApplicationsView } from './components/Applications/ApplicationsView';
import { DocumentsView } from './components/Documents/DocumentsView';
import { StatsView } from './components/Stats/StatsView';
import { CVEditorModal } from './components/CVEditor/CVEditorModal';
import { ImportCVModal } from './components/ImportCV/ImportCVModal';
import { VacancyAdaptModal } from './components/VacancyAdapt/VacancyAdaptModal';
import { PrivacyModal } from './components/PrivacyCenter/PrivacyModal';
import { ATSReviewModal } from './components/ATSReview/ATSReviewModal';
import { AuthScreen } from './components/Auth/AuthScreen';
import { PresentationView } from './components/Presentation/PresentationView';
import { AdminSupervisorDashboard } from './components/Admin/AdminSupervisorDashboard';
import { Key, Copy, Check, X, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('tm_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // View mode: 'presentation' by default when not logged in, 'app' when logged in
  const [viewMode, setViewMode] = useState<'presentation' | 'auth' | 'app'>(() => {
    const saved = localStorage.getItem('tm_auth_user');
    return saved ? 'app' : 'presentation';
  });

  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  const [activeCredentials, setActiveCredentials] = useState<{ username: string; password: string } | null>(() => {
    const saved = localStorage.getItem('tm_active_creds');
    return saved ? JSON.parse(saved) : null;
  });

  const [newCredentialsNotice, setNewCredentialsNotice] = useState<{ username: string; password: string } | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Load profile state from LocalStorage scoped by user ID or fall back to clean empty profile
  const [profile, setProfile] = useState<MasterProfile>(() => {
    if (!currentUser) return createEmptyProfile();
    const userKey = `tm_master_profile_${currentUser.id}`;
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : createEmptyProfile(currentUser);
  });

  const [cvVersions, setCvVersions] = useState<CVVersion[]>(() => {
    if (!currentUser) return createEmptyCvVersions();
    const userKey = `tm_cv_versions_${currentUser.id}`;
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : createEmptyCvVersions();
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    if (!currentUser) return createEmptyApplications();
    const userKey = `tm_applications_${currentUser.id}`;
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : createEmptyApplications();
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (!currentUser) return createEmptyDocuments();
    const userKey = `tm_documents_${currentUser.id}`;
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : createEmptyDocuments();
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    if (!currentUser) return createEmptyPrivacySettings();
    const userKey = `tm_privacy_${currentUser.id}`;
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : createEmptyPrivacySettings(currentUser);
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser?.role === 'admin_general' || currentUser?.email === 'prisma.dig.office@gmail.com') {
      return 'admin';
    }
    return 'home';
  });
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(false);

  // Modals state
  const [editingCv, setEditingCv] = useState<CVVersion | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAdaptOpen, setIsAdaptOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [atsReviewCv, setAtsReviewCv] = useState<CVVersion | null>(null);

  // Synchronize data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const uid = currentUser.id;
      const savedProfile = localStorage.getItem(`tm_master_profile_${uid}`);
      setProfile(savedProfile ? JSON.parse(savedProfile) : createEmptyProfile(currentUser));

      const savedCvs = localStorage.getItem(`tm_cv_versions_${uid}`);
      setCvVersions(savedCvs ? JSON.parse(savedCvs) : createEmptyCvVersions());

      const savedApps = localStorage.getItem(`tm_applications_${uid}`);
      setApplications(savedApps ? JSON.parse(savedApps) : createEmptyApplications());

      const savedDocs = localStorage.getItem(`tm_documents_${uid}`);
      setDocuments(savedDocs ? JSON.parse(savedDocs) : createEmptyDocuments());

      const savedPrivacy = localStorage.getItem(`tm_privacy_${uid}`);
      setPrivacySettings(savedPrivacy ? JSON.parse(savedPrivacy) : createEmptyPrivacySettings(currentUser));

      if (currentUser.role === 'admin_general' || currentUser.email === 'prisma.dig.office@gmail.com') {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    }
  }, [currentUser?.id]);

  // Persist to user-scoped LocalStorage on updates
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tm_master_profile_${currentUser.id}`, JSON.stringify(profile));
    }
  }, [profile, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tm_cv_versions_${currentUser.id}`, JSON.stringify(cvVersions));
    }
  }, [cvVersions, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tm_applications_${currentUser.id}`, JSON.stringify(applications));
    }
  }, [applications, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tm_documents_${currentUser.id}`, JSON.stringify(documents));
    }
  }, [documents, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tm_privacy_${currentUser.id}`, JSON.stringify(privacySettings));
    }
  }, [privacySettings, currentUser?.id]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount, credentials?: { username: string; password: string }) => {
    setCurrentUser(user);
    localStorage.setItem('tm_auth_user', JSON.stringify(user));
    if (credentials) {
      setActiveCredentials(credentials);
      localStorage.setItem('tm_active_creds', JSON.stringify(credentials));
      setNewCredentialsNotice(credentials);
    }
    setViewMode('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tm_auth_user');
    setNewCredentialsNotice(null);
    setViewMode('presentation');
  };

  const handleCopyNotice = () => {
    if (!newCredentialsNotice) return;
    navigator.clipboard.writeText(
      `Credenciales PRISMA:\nUsuario: ${newCredentialsNotice.username}\nContraseña: ${newCredentialsNotice.password}`
    );
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  // Handlers for CV Management
  const handleSaveCv = (updatedCv: CVVersion) => {
    setCvVersions(prev => prev.map(c => (c.id === updatedCv.id ? updatedCv : c)));
  };

  const handleCreateNewCv = () => {
    const newVersionNumber = cvVersions.length + 1;
    const newCv: CVVersion = {
      id: `cv-v${Date.now()}`,
      name: `CV Versión ${newVersionNumber} - Especializado`,
      targetObjective: 'Postulación a oportunidad específica en base al perfil maestro.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versionNumber: newVersionNumber,
      templateId: 'ats_standard',
      isLocked: false,
      selectedExperienceIds: profile.experiences.map(e => e.id),
      selectedEducationIds: profile.education.map(e => e.id),
      selectedSkillIds: profile.skills.map(s => s.id),
      selectedLanguageIds: profile.languages.map(l => l.id),
      selectedCertificationIds: profile.certifications.map(c => c.id),
      selectedProjectIds: profile.projects.map(p => p.id),
      tags: ['Nuevo', 'Adaptado'],
    };

    setCvVersions([newCv, ...cvVersions]);
    setEditingCv(newCv);
  };

  const handleDuplicateCv = (sourceCv: CVVersion) => {
    const newVersionNumber = cvVersions.length + 1;
    const duplicated: CVVersion = {
      ...sourceCv,
      id: `cv-v${Date.now()}`,
      name: `${sourceCv.name} (Copia)`,
      versionNumber: newVersionNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLocked: false,
    };

    setCvVersions([duplicated, ...cvVersions]);
    setEditingCv(duplicated);
  };

  const handleImportConfirmed = (extractedData: Partial<MasterProfile>) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        fullName: extractedData.personalInfo?.fullName || prev.personalInfo.fullName,
        professionalTitle: extractedData.personalInfo?.professionalTitle || prev.personalInfo.professionalTitle,
        email: extractedData.personalInfo?.email || prev.personalInfo.email,
        phone: extractedData.personalInfo?.phone || prev.personalInfo.phone,
      },
      summary: extractedData.summary || prev.summary,
      experiences: [...(extractedData.experiences || []), ...prev.experiences],
      education: [...(extractedData.education || []), ...prev.education],
      skills: [...(extractedData.skills || []), ...prev.skills],
      languages: [...(extractedData.languages || []), ...prev.languages],
      updatedAt: new Date().toISOString(),
    }));

    setActiveTab('profile');
  };

  const handleGenerateTailoredCv = (
    tailoredCvData: Partial<CVVersion>,
    jobInfo: { company: string; position: string }
  ) => {
    const newVersionNumber = cvVersions.length + 1;
    const newCv: CVVersion = {
      id: `cv-tailored-${Date.now()}`,
      name: tailoredCvData.name || `CV Adaptado para ${jobInfo.position}`,
      targetObjective: tailoredCvData.targetObjective || `Orientado a ${jobInfo.position} en ${jobInfo.company}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versionNumber: newVersionNumber,
      templateId: tailoredCvData.templateId || 'ats_standard',
      customSummary: tailoredCvData.customSummary,
      selectedExperienceIds: tailoredCvData.selectedExperienceIds || profile.experiences.map(e => e.id),
      selectedEducationIds: tailoredCvData.selectedEducationIds || profile.education.map(e => e.id),
      selectedSkillIds: tailoredCvData.selectedSkillIds || profile.skills.map(s => s.id),
      selectedLanguageIds: tailoredCvData.selectedLanguageIds || profile.languages.map(l => l.id),
      selectedCertificationIds: tailoredCvData.selectedCertificationIds || profile.certifications.map(c => c.id),
      selectedProjectIds: tailoredCvData.selectedProjectIds || profile.projects.map(p => p.id),
      relatedJobOffer: `${jobInfo.position} - ${jobInfo.company}`,
      tags: ['Adaptado', jobInfo.company.slice(0, 12)],
      isLocked: false,
    };

    setCvVersions([newCv, ...cvVersions]);
    setEditingCv(newCv);
  };

  const handleAddApplication = (newApp: JobApplication) => {
    setCvVersions(prev =>
      prev.map(cv => (cv.id === newApp.cvVersionIdUsed ? { ...cv, isLocked: true } : cv))
    );
    setApplications([newApp, ...applications]);
  };

  const handleUpdateApplicationStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications(prev =>
      prev.map(app => (app.id === appId ? { ...app, status: newStatus } : app))
    );
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments([newDoc, ...documents]);

    if (newDoc.linkedEntityId) {
      setProfile(prev => {
        const updatedExp = prev.experiences.map(e =>
          e.id === newDoc.linkedEntityId ? { ...e, evidenceStatus: 'verified' as const, linkedDocumentId: newDoc.id } : e
        );
        const updatedEdu = prev.education.map(ed =>
          ed.id === newDoc.linkedEntityId ? { ...ed, evidenceStatus: 'verified' as const, linkedDocumentId: newDoc.id } : ed
        );
        const updatedSkills = prev.skills.map(s =>
          s.id === newDoc.linkedEntityId ? { ...s, evidenceStatus: 'verified' as const, linkedDocumentId: newDoc.id } : s
        );

        return {
          ...prev,
          experiences: updatedExp,
          education: updatedEdu,
          skills: updatedSkills,
          updatedAt: new Date().toISOString(),
        };
      });
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleToggleDocumentPrivacy = (docId: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === docId ? { ...d, isPrivate: !d.isPrivate } : d))
    );
  };

  const handleResetAllData = () => {
    if (currentUser) {
      localStorage.removeItem(`tm_master_profile_${currentUser.id}`);
      localStorage.removeItem(`tm_cv_versions_${currentUser.id}`);
      localStorage.removeItem(`tm_applications_${currentUser.id}`);
      localStorage.removeItem(`tm_documents_${currentUser.id}`);
      localStorage.removeItem(`tm_privacy_${currentUser.id}`);
      setProfile(createEmptyProfile(currentUser));
      setCvVersions(createEmptyCvVersions());
      setApplications(createEmptyApplications());
      setDocuments(createEmptyDocuments());
      setPrivacySettings(createEmptyPrivacySettings(currentUser));
    }
  };

  // If viewMode is presentation and user is not logged in:
  if (viewMode === 'presentation' && !currentUser) {
    return (
      <PresentationView
        onOpenLogin={() => {
          setAuthInitialTab('login');
          setViewMode('auth');
        }}
        onOpenRegister={() => {
          setAuthInitialTab('register');
          setViewMode('auth');
        }}
      />
    );
  }

  // If user is not logged in or in auth view mode:
  if (!currentUser || viewMode === 'auth') {
    return (
      <AuthScreen
        initialTab={authInitialTab}
        onBackToPresentation={() => setViewMode('presentation')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans">
      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => {
          if (tab === 'privacy') {
            setIsPrivacyOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isSimpleMode={isSimpleMode}
        onToggleMode={() => setIsSimpleMode(!isSimpleMode)}
        onOpenNewCv={handleCreateNewCv}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeCredentials={activeCredentials}
      />

      {/* New Credentials Notification Banner */}
      {newCredentialsNotice && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 shadow-sm text-xs font-medium">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                ¡Cuenta y credenciales generadas! Usuario: <strong className="font-mono bg-emerald-800/80 px-1.5 py-0.5 rounded">{newCredentialsNotice.username}</strong> · Contraseña: <strong className="font-mono bg-emerald-800/80 px-1.5 py-0.5 rounded">{newCredentialsNotice.password}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCopyNotice}
                className="px-2.5 py-1 bg-white text-emerald-950 font-bold rounded hover:bg-emerald-50 transition-colors flex items-center gap-1 text-[11px]"
              >
                {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedNotice ? '¡Copiado!' : 'Copiar Credenciales'}
              </button>
              <button
                type="button"
                onClick={() => setNewCredentialsNotice(null)}
                className="text-emerald-300 hover:text-white p-0.5"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'home' && (
          <HomeDashboard
            profile={profile}
            cvVersions={cvVersions}
            applications={applications}
            onNavigate={setActiveTab}
            onOpenImport={() => setIsImportOpen(true)}
            onOpenAdapt={() => setIsAdaptOpen(true)}
            onOpenCreateCv={handleCreateNewCv}
          />
        )}

        {activeTab === 'profile' && (
          <MasterProfileView
            profile={profile}
            onUpdateProfile={setProfile}
            onOpenDocuments={() => setActiveTab('documents')}
          />
        )}

        {activeTab === 'cvs' && (
          <CVManagerView
            cvVersions={cvVersions}
            profile={profile}
            onEditCv={cv => setEditingCv(cv)}
            onDuplicateCv={handleDuplicateCv}
            onCreateNewCv={handleCreateNewCv}
            onAdaptCv={() => setIsAdaptOpen(true)}
            onAtsReviewCv={cv => setAtsReviewCv(cv)}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            cvVersions={cvVersions}
            onAddApplication={handleAddApplication}
            onUpdateStatus={handleUpdateApplicationStatus}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsView
            documents={documents}
            profile={profile}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onTogglePrivacy={handleToggleDocumentPrivacy}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            profile={profile}
            cvVersions={cvVersions}
            applications={applications}
          />
        )}

        {activeTab === 'admin' && (
          <AdminSupervisorDashboard
            currentUser={currentUser}
          />
        )}

        {activeTab === 'presentation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Estás explorando la presentación institucional de PRISMA.</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab(currentUser.role === 'admin_general' ? 'admin' : 'home')}
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Volver a mi Espacio
              </button>
            </div>
            <PresentationView
              onOpenLogin={() => setActiveTab(currentUser.role === 'admin_general' ? 'admin' : 'home')}
              onOpenRegister={() => setActiveTab(currentUser.role === 'admin_general' ? 'admin' : 'home')}
            />
          </div>
        )}
      </main>

      {/* CV Live Editor Modal */}
      {editingCv && (
        <CVEditorModal
          isOpen={Boolean(editingCv)}
          onClose={() => setEditingCv(null)}
          cv={editingCv}
          profile={profile}
          onSaveCv={handleSaveCv}
        />
      )}

      {/* Smart CV Import Modal */}
      <ImportCVModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportConfirmed={handleImportConfirmed}
      />

      {/* Vacancy Adapter & Requirement Matcher Modal */}
      <VacancyAdaptModal
        isOpen={isAdaptOpen}
        onClose={() => setIsAdaptOpen(false)}
        masterProfile={profile}
        onGenerateTailoredCv={handleGenerateTailoredCv}
      />

      {/* ATS Review Modal */}
      {atsReviewCv && (
        <ATSReviewModal
          isOpen={Boolean(atsReviewCv)}
          onClose={() => setAtsReviewCv(null)}
          cv={atsReviewCv}
          profile={profile}
        />
      )}

      {/* Privacy Center Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        privacySettings={privacySettings}
        onUpdatePrivacy={setPrivacySettings}
        masterProfile={profile}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}
