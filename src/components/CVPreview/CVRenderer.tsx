import React from 'react';
import { MasterProfile, CVVersion, TemplateId } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, CheckCircle2 } from 'lucide-react';

interface CVRendererProps {
  profile: MasterProfile;
  cv: CVVersion;
  templateId?: TemplateId;
  previewScale?: number;
}

export const CVRenderer: React.FC<CVRendererProps> = ({
  profile,
  cv,
  templateId = cv.templateId || 'ats_standard',
  previewScale = 1,
}) => {
  const experiences = profile.experiences.filter(e => cv.selectedExperienceIds.includes(e.id));
  const education = profile.education.filter(e => cv.selectedEducationIds.includes(e.id));
  const skills = profile.skills.filter(s => cv.selectedSkillIds.includes(s.id));
  const languages = profile.languages.filter(l => cv.selectedLanguageIds.includes(l.id));
  const certifications = profile.certifications.filter(c => cv.selectedCertificationIds.includes(c.id));
  const projects = profile.projects.filter(p => cv.selectedProjectIds.includes(p.id));

  const summary = cv.customSummary || profile.summary;

  // Render template variations
  if (templateId === 'executive_modern') {
    return (
      <div
        id="cv-print-area"
        className="bg-white text-neutral-900 mx-auto shadow-lg print:shadow-none min-h-[1100px] w-full max-w-[800px] p-8 font-sans transition-all text-xs"
        style={{ transform: previewScale !== 1 ? `scale(${previewScale})` : undefined, transformOrigin: 'top center' }}
      >
        {/* Top Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
            {profile.personalInfo.fullName}
          </h1>
          <p className="text-sm font-semibold text-blue-700 mt-1">
            {profile.personalInfo.professionalTitle}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-600 mt-3 font-mono">
            <span>{profile.personalInfo.email}</span>
            <span>·</span>
            <span>{profile.personalInfo.phone}</span>
            <span>·</span>
            <span>{profile.personalInfo.location}</span>
            {profile.personalInfo.collegeNumber && (
              <>
                <span>·</span>
                <span className="font-semibold text-neutral-900">{profile.personalInfo.collegeNumber}</span>
              </>
            )}
            {profile.personalInfo.linkedinUrl && (
              <>
                <span>·</span>
                <span>{profile.personalInfo.linkedinUrl}</span>
              </>
            )}
          </div>
        </div>

        {/* 2 Columns: Main Experience (70%) and Sidebar (30%) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Summary */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-neutral-200 pb-1 mb-2">
                Perfil Ejecutivo
              </h2>
              <p className="text-neutral-700 leading-relaxed text-[11.5px] text-justify">
                {summary}
              </p>
            </section>

            {/* Experience */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-neutral-200 pb-1 mb-2">
                Trayectoria Laboral
              </h2>
              {experiences.map(exp => (
                <div key={exp.id} className="cv-item-break space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900 text-xs">{exp.position}</span>
                    <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                      {exp.startDate} – {exp.isCurrent ? 'Presente' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-neutral-600">
                    {exp.company} · {exp.location}
                  </div>
                  {exp.description && (
                    <p className="text-neutral-600 text-[11px] italic">{exp.description}</p>
                  )}
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-700 pl-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            {/* Projects */}
            {projects.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-neutral-200 pb-1 mb-2">
                  Proyectos Clave
                </h2>
                {projects.map(proj => (
                  <div key={proj.id} className="cv-item-break space-y-0.5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-slate-900 text-xs">{proj.name}</span>
                      <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                        {proj.startDate} – {proj.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 font-medium">{proj.role}</div>
                    <p className="text-[11px] text-neutral-700">{proj.description}</p>
                    {proj.impactOrResult && (
                      <p className="text-[10.5px] text-emerald-800 font-medium">
                        Impacto: {proj.impactOrResult}
                      </p>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 border-l border-neutral-200 pl-4">
            {/* Education */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-neutral-200 pb-1 mb-2">
                Educación
              </h2>
              {education.map(edu => (
                <div key={edu.id} className="cv-item-break space-y-0.5">
                  <div className="font-bold text-slate-900 text-[11px]">{edu.degree}</div>
                  <div className="text-[10.5px] text-neutral-600">{edu.institution}</div>
                  <div className="text-[10px] font-mono text-neutral-500 tabular-nums">
                    {edu.startDate} – {edu.endDate} · {edu.status}
                  </div>
                </div>
              ))}
            </section>

            {/* Skills */}
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-neutral-200 pb-1 mb-2">
                Competencias
              </h2>
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold text-neutral-800 block">Software & SIG</span>
                <p className="text-[11px] text-neutral-600">
                  {skills.filter(s => s.category === 'Software').map(s => s.name).join(', ')}
                </p>
                <span className="text-[10.5px] font-bold text-neutral-800 block pt-1">Técnicas</span>
                <p className="text-[11px] text-neutral-600">
                  {skills.filter(s => s.category === 'Técnica').map(s => s.name).join(', ')}
                </p>
              </div>
            </section>

            {/* Languages */}
            {languages.length > 0 && (
              <section className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-neutral-200 pb-1 mb-2">
                  Idiomas
                </h2>
                {languages.map(lang => (
                  <div key={lang.id} className="flex justify-between text-[11px]">
                    <span className="font-medium text-neutral-800">{lang.language}</span>
                    <span className="text-neutral-500">{lang.level.split(' ')[0]}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-neutral-200 pb-1 mb-2">
                  Certificaciones
                </h2>
                {certifications.map(c => (
                  <div key={c.id} className="cv-item-break text-[10.5px] space-y-0.5">
                    <span className="font-semibold text-neutral-900 block leading-tight">{c.title}</span>
                    <span className="text-neutral-500 block">{c.issuer} ({c.issueDate})</span>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'peru_official') {
    return (
      <div
        id="cv-print-area"
        className="bg-white text-neutral-900 mx-auto shadow-lg print:shadow-none min-h-[1100px] w-full max-w-[800px] p-8 font-sans transition-all text-xs"
        style={{ transform: previewScale !== 1 ? `scale(${previewScale})` : undefined, transformOrigin: 'top center' }}
      >
        {/* Header Official Box */}
        <div className="border-2 border-neutral-900 p-4 mb-5 text-center bg-neutral-50/50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">
            FORMATO OFICIAL ESTANDARIZADO DE HOJA DE VIDA DOCUMENTADA
          </span>
          <h1 className="text-xl font-extrabold uppercase text-neutral-900 tracking-tight">
            {profile.personalInfo.fullName}
          </h1>
          <p className="text-xs font-semibold text-neutral-700 mt-0.5">
            {profile.personalInfo.professionalTitle}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-neutral-300 text-[10.5px] text-neutral-700 text-left">
            <div><strong>DNI:</strong> {profile.personalInfo.dniOrId || '47291048'}</div>
            <div><strong>CIP / Colegiatura:</strong> {profile.personalInfo.collegeNumber || 'Ordinario Hábil'}</div>
            <div><strong>Teléfono:</strong> {profile.personalInfo.phone}</div>
            <div><strong>Email:</strong> {profile.personalInfo.email}</div>
          </div>
        </div>

        {/* Sections in Official Table Layout */}
        <div className="space-y-4">
          {/* I. RESUMEN */}
          <section>
            <div className="bg-neutral-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
              I. Resumen Profesional y Declaración Jurada
            </div>
            <div className="border border-neutral-300 p-3 text-neutral-800 text-[11px] leading-relaxed text-justify">
              {summary}
            </div>
          </section>

          {/* II. FORMACIÓN ACADÉMICA */}
          <section>
            <div className="bg-neutral-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
              II. Formación Académica (Registrada ante SUNEDU)
            </div>
            <table className="w-full border-collapse border border-neutral-300 text-[11px]">
              <thead className="bg-neutral-100 text-neutral-700">
                <tr>
                  <th className="border border-neutral-300 p-1.5 text-left">Grado / Título</th>
                  <th className="border border-neutral-300 p-1.5 text-left">Universidad / Institución</th>
                  <th className="border border-neutral-300 p-1.5 text-center">Periodo</th>
                  <th className="border border-neutral-300 p-1.5 text-center">Condición</th>
                </tr>
              </thead>
              <tbody>
                {education.map(edu => (
                  <tr key={edu.id}>
                    <td className="border border-neutral-300 p-1.5 font-medium">{edu.degree}</td>
                    <td className="border border-neutral-300 p-1.5">{edu.institution}</td>
                    <td className="border border-neutral-300 p-1.5 text-center font-mono text-[10px]">
                      {edu.startDate} – {edu.endDate}
                    </td>
                    <td className="border border-neutral-300 p-1.5 text-center font-semibold text-emerald-800">
                      {edu.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* III. EXPERIENCIA LABORAL */}
          <section>
            <div className="bg-neutral-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
              III. Experiencia Laboral Comprobable
            </div>
            <div className="border border-neutral-300 divide-y divide-neutral-300">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="p-3 cv-item-break space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-neutral-900 text-xs">
                        {idx + 1}. {exp.position}
                      </span>
                      <span className="text-neutral-600 block text-[11px]">
                        Entidad / Empresa: <strong>{exp.company}</strong> ({exp.sector})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {exp.startDate} a {exp.isCurrent ? 'A la fecha' : exp.endDate}
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-neutral-700 space-y-0.5">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* IV. CAPACITACIÓN Y CONOCIMIENTOS */}
          <section>
            <div className="bg-neutral-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
              IV. Capacitación, Habilidades y Conocimientos Específicos
            </div>
            <div className="border border-neutral-300 p-3 text-[11px] space-y-2">
              <div>
                <strong>Software Técnico y SIG:</strong>{' '}
                {skills.filter(s => s.category === 'Software').map(s => s.name).join(', ')}
              </div>
              <div>
                <strong>Competencias Hidrológicas e Hidráulicas:</strong>{' '}
                {skills.filter(s => s.category === 'Técnica').map(s => s.name).join(', ')}
              </div>
              {certifications.length > 0 && (
                <div>
                  <strong>Cursos y Certificaciones Sustentadas:</strong>
                  <ul className="list-disc list-inside mt-1 text-[10.5px]">
                    {certifications.map(c => (
                      <li key={c.id}>
                        {c.title} – {c.issuer} ({c.issueDate})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Default: ats_standard (Universal, single-column, highest ATS score)
  return (
    <div
      id="cv-print-area"
      className="bg-white text-neutral-900 mx-auto shadow-lg print:shadow-none min-h-[1100px] w-full max-w-[800px] p-8 sm:p-10 font-sans transition-all text-xs"
      style={{ transform: previewScale !== 1 ? `scale(${previewScale})` : undefined, transformOrigin: 'top center' }}
    >
      {/* Header */}
      <header className="border-b-2 border-neutral-900 pb-4 mb-5 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase">
          {profile.personalInfo.fullName}
        </h1>
        <p className="text-sm font-semibold text-neutral-700 mt-1">
          {profile.personalInfo.professionalTitle}
        </p>

        {/* Contact info metadata line */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] text-neutral-600 mt-2 font-mono">
          <span>{profile.personalInfo.email}</span>
          <span>·</span>
          <span>{profile.personalInfo.phone}</span>
          <span>·</span>
          <span>{profile.personalInfo.location}</span>
          {profile.personalInfo.collegeNumber && (
            <>
              <span>·</span>
              <span className="font-semibold text-neutral-800">{profile.personalInfo.collegeNumber}</span>
            </>
          )}
          {profile.personalInfo.linkedinUrl && (
            <>
              <span>·</span>
              <span>{profile.personalInfo.linkedinUrl}</span>
            </>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="space-y-5">
        {/* Summary */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
            Perfil Profesional
          </h2>
          <p className="text-neutral-700 text-[11.5px] leading-relaxed text-justify">
            {summary}
          </p>
        </section>

        {/* Experience */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
            Experiencia Laboral
          </h2>
          {experiences.map(exp => (
            <div key={exp.id} className="cv-item-break space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="font-bold text-neutral-900 text-xs">
                  {exp.position} <span className="font-normal text-neutral-600">| {exp.company}</span>
                </div>
                <div className="text-[10.5px] font-mono text-neutral-500 tabular-nums">
                  {exp.startDate} – {exp.isCurrent ? 'Presente' : exp.endDate} · {exp.location}
                </div>
              </div>
              {exp.description && (
                <p className="text-[11px] text-neutral-600 italic">{exp.description}</p>
              )}
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-700 pl-1">
                {exp.bullets.map((bullet, i) => (
                  <li key={i} className="leading-relaxed">{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
            Formación Académica
          </h2>
          {education.map(edu => (
            <div key={edu.id} className="cv-item-break flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <span className="font-bold text-neutral-900 text-xs">{edu.degree}</span>
                <span className="text-neutral-600 text-[11px] block">{edu.institution} · {edu.fieldOfStudy}</span>
              </div>
              <div className="text-[10.5px] font-mono text-neutral-500 tabular-nums shrink-0">
                {edu.startDate} – {edu.endDate} ({edu.status})
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
            Habilidades y Herramientas Técnicas
          </h2>
          <div className="text-[11px] space-y-1 text-neutral-700">
            <div>
              <strong className="text-neutral-900">Software & SIG:</strong>{' '}
              {skills.filter(s => s.category === 'Software').map(s => s.name).join(', ')}
            </div>
            <div>
              <strong className="text-neutral-900">Competencias Especializadas:</strong>{' '}
              {skills.filter(s => s.category === 'Técnica').map(s => s.name).join(', ')}
            </div>
            <div>
              <strong className="text-neutral-900">Gestión y Liderazgo:</strong>{' '}
              {skills.filter(s => s.category === 'Gestión' || s.category === 'Competencia').map(s => s.name).join(', ')}
            </div>
          </div>
        </section>

        {/* Languages & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-1.5">
                Idiomas
              </h2>
              <div className="text-[11px] text-neutral-700 space-y-0.5">
                {languages.map(l => (
                  <div key={l.id}>
                    <strong>{l.language}:</strong> {l.level}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-1.5">
                Certificaciones
              </h2>
              <ul className="text-[11px] text-neutral-700 list-disc list-inside space-y-0.5">
                {certifications.map(c => (
                  <li key={c.id}>
                    {c.title} <span className="text-neutral-500">({c.issueDate})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
              Proyectos Destacados
            </h2>
            {projects.map(p => (
              <div key={p.id} className="cv-item-break space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-neutral-900 text-xs">{p.name}</span>
                  <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                    {p.startDate} – {p.endDate}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-700">{p.description}</p>
                {p.impactOrResult && (
                  <p className="text-[10.5px] font-medium text-emerald-800">
                    Resultado: {p.impactOrResult}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
