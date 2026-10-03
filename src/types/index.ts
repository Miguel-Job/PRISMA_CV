export type EvidenceStatus = 'verified' | 'declared' | 'pending';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
  passwordHash?: string; // used for stored accounts
}

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Titulo' | 'Bachiller' | 'Certificado' | 'Constancia' | 'Curso' | 'Diplomado' | 'Publicacion' | 'Otro';
  fileUrl?: string;
  fileName: string;
  fileSize?: string;
  uploadDate: string;
  issuer: string;
  verificationStatus: EvidenceStatus;
  linkedEntityId?: string; // Links to Experience or Education ID
  notes?: string;
  isPrivate: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  employmentType: 'Tiempo completo' | 'Tiempo parcial' | 'Consultoría' | 'Prácticas';
  sector: 'Privado' | 'Público' | 'ONG' | 'Académico';
  description: string;
  bullets: string[];
  evidenceStatus: EvidenceStatus;
  linkedDocumentId?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  status: 'Titulado' | 'Bachiller' | 'Egresado' | 'En curso' | 'Magíster' | 'Doctor';
  location: string;
  evidenceStatus: EvidenceStatus;
  linkedDocumentId?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Software' | 'Técnica' | 'Gestión' | 'Competencia';
  level: 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';
  evidenceStatus: EvidenceStatus;
  linkedDocumentId?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  level: 'Básico (A1-A2)' | 'Intermedio (B1-B2)' | 'Avanzado (C1)' | 'Nativo / Bilingüe';
  evidenceStatus: EvidenceStatus;
  linkedDocumentId?: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  evidenceStatus: EvidenceStatus;
  linkedDocumentId?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  impactOrResult?: string;
  url?: string;
  evidenceStatus: EvidenceStatus;
}

export interface MasterProfile {
  id: string;
  updatedAt: string;
  personalInfo: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    country: string;
    dniOrId?: string;
    collegeNumber?: string; // Colegiatura profesional (ej. CIP Perú)
    linkedinUrl?: string;
    portfolioUrl?: string;
    avatarUrl?: string;
  };
  summary: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
}

export type TemplateId = 'ats_standard' | 'technical_clean' | 'executive_modern' | 'academic_formal' | 'minimalist' | 'peru_official';

export interface CVVersion {
  id: string;
  name: string;
  targetObjective: string;
  createdAt: string;
  updatedAt: string;
  versionNumber: number;
  templateId: TemplateId;
  relatedJobOffer?: string;
  isLocked: boolean; // Locked if used in a past job application
  customSummary?: string;
  selectedExperienceIds: string[];
  selectedEducationIds: string[];
  selectedSkillIds: string[];
  selectedLanguageIds: string[];
  selectedCertificationIds: string[];
  selectedProjectIds: string[];
  experienceOverrides?: Record<string, { bullets?: string[]; titleOverride?: string }>;
  tags: string[];
}

export type ApplicationStatus =
  | 'Por revisar'
  | 'Preparando'
  | 'Postulado'
  | 'En evaluación'
  | 'Entrevista'
  | 'Finalizado'
  | 'Descartado'
  | 'Aceptado';

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  applicationDate: string;
  deadlineDate?: string;
  cvVersionIdUsed: string;
  cvVersionNameUsed: string;
  status: ApplicationStatus;
  offerUrl?: string;
  notes?: string;
  interviewDates?: string[];
  salaryOffered?: string;
  location?: string;
}

export interface VacancyRequirement {
  id: string;
  category: string;
  requirement: string;
  candidateMatchStatus: 'Coincide' | 'Revisar' | 'No identificado';
  candidateEvidence: string;
  recommendation: string;
}

export interface VacancyAnalysisResult {
  jobTitleIdentified: string;
  companyOrEntity: string;
  matchPercentage: number;
  matchExplanation: string;
  requirements: VacancyRequirement[];
  recommendedKeywordsToHighlight: string[];
  gapsToAddressHonestly: string[];
  tailoredSummaryDraft: string;
}

export interface AtsCriticalFinding {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  actionableFix: string;
}

export interface AtsReviewResult {
  documentaryScore: number;
  scoreExplanation: string;
  structureStatus: string;
  readabilityStatus: string;
  chronologyStatus: string;
  keywordDensityStatus: string;
  criticalFindings: AtsCriticalFinding[];
  recommendedActionItems: string[];
}

export interface PrivacySettings {
  visibility: 'private' | 'link_only' | 'public';
  shareableUrlSlug: string;
  allowAiAnalysis: boolean;
  maskContactInfoInPublic: boolean;
  allowDocumentDownloadByOthers: boolean;
  activityLogs: Array<{ action: string; timestamp: string }>;
}
