import { MasterProfile, CVVersion } from '../types';

export function downloadCvAsDocx(profile: MasterProfile, cv: CVVersion) {
  const experiences = profile.experiences.filter(e => cv.selectedExperienceIds.includes(e.id));
  const education = profile.education.filter(e => cv.selectedEducationIds.includes(e.id));
  const skills = profile.skills.filter(s => cv.selectedSkillIds.includes(s.id));
  const languages = profile.languages.filter(l => cv.selectedLanguageIds.includes(l.id));
  const certifications = profile.certifications.filter(c => cv.selectedCertificationIds.includes(c.id));
  const projects = profile.projects.filter(p => cv.selectedProjectIds.includes(p.id));

  const summary = cv.customSummary || profile.summary;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${profile.personalInfo.fullName} - ${cv.name}</title>
      <style>
        body {
          font-family: Calibri, 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #111827;
          margin: 1in;
        }
        h1 {
          font-size: 20pt;
          margin: 0 0 4pt 0;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
        }
        .subtitle {
          font-size: 12pt;
          font-weight: bold;
          color: #2563eb;
          margin: 0 0 8pt 0;
        }
        .contact-info {
          font-size: 9.5pt;
          color: #4b5563;
          margin-bottom: 16pt;
          border-bottom: 1.5pt solid #cbd5e1;
          padding-bottom: 8pt;
        }
        h2 {
          font-size: 13pt;
          color: #0f172a;
          text-transform: uppercase;
          border-bottom: 1pt solid #94a3b8;
          padding-bottom: 3pt;
          margin-top: 14pt;
          margin-bottom: 8pt;
          letter-spacing: 0.3pt;
        }
        .item-header {
          margin-bottom: 2pt;
        }
        .item-title {
          font-weight: bold;
          font-size: 11pt;
        }
        .item-company {
          font-style: italic;
          color: #334155;
        }
        .item-date {
          float: right;
          color: #64748b;
          font-size: 10pt;
        }
        ul {
          margin: 4pt 0 10pt 18pt;
          padding: 0;
        }
        li {
          margin-bottom: 3pt;
        }
        .skills-list {
          margin-bottom: 8pt;
        }
      </style>
    </head>
    <body>
      <h1>${profile.personalInfo.fullName}</h1>
      <div class="subtitle">${profile.personalInfo.professionalTitle}</div>
      <div class="contact-info">
        ${profile.personalInfo.email} | ${profile.personalInfo.phone} | ${profile.personalInfo.location}
        ${profile.personalInfo.collegeNumber ? ` | Col: ${profile.personalInfo.collegeNumber}` : ''}
        ${profile.personalInfo.linkedinUrl ? ` | ${profile.personalInfo.linkedinUrl}` : ''}
      </div>

      <h2>Perfil Profesional</h2>
      <p>${summary}</p>

      <h2>Experiencia Laboral</h2>
      ${experiences
        .map(
          exp => `
        <div class="item-header">
          <span class="item-title">${exp.position}</span> — <span class="item-company">${exp.company} (${exp.location})</span>
          <span class="item-date">${exp.startDate} - ${exp.isCurrent ? 'Presente' : exp.endDate}</span>
        </div>
        ${exp.description ? `<p style="margin: 2pt 0 4pt 0; color: #475569;">${exp.description}</p>` : ''}
        <ul>
          ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      `
        )
        .join('')}

      <h2>Formación Académica</h2>
      ${education
        .map(
          edu => `
        <div class="item-header">
          <span class="item-title">${edu.degree}</span> — <span class="item-company">${edu.institution}</span>
          <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
        </div>
        <p style="margin: 2pt 0 8pt 0; font-size: 10pt; color: #475569;">${edu.fieldOfStudy} · Condición: ${edu.status}</p>
      `
        )
        .join('')}

      <h2>Habilidades y Software</h2>
      <p class="skills-list">
        <strong>Software & Herramientas:</strong> ${skills.filter(s => s.category === 'Software').map(s => s.name).join(', ')}<br>
        <strong>Competencias Técnicas:</strong> ${skills.filter(s => s.category === 'Técnica').map(s => s.name).join(', ')}<br>
        <strong>Gestión y Liderazgo:</strong> ${skills.filter(s => s.category === 'Gestión' || s.category === 'Competencia').map(s => s.name).join(', ')}
      </p>

      ${
        languages.length > 0
          ? `
        <h2>Idiomas</h2>
        <p>${languages.map(l => `<strong>${l.language}:</strong> ${l.level}`).join(' | ')}</p>
      `
          : ''
      }

      ${
        certifications.length > 0
          ? `
        <h2>Certificaciones</h2>
        <ul>
          ${certifications.map(c => `<li><strong>${c.title}</strong> — ${c.issuer} (${c.issueDate})</li>`).join('')}
        </ul>
      `
          : ''
      }

      ${
        projects.length > 0
          ? `
        <h2>Proyectos Destacados</h2>
        ${projects
          .map(
            p => `
          <div class="item-header">
            <span class="item-title">${p.name}</span> — <em>${p.role}</em>
            <span class="item-date">${p.startDate} - ${p.endDate}</span>
          </div>
          <p style="margin: 2pt 0 4pt 0;">${p.description}</p>
          ${p.impactOrResult ? `<p style="margin: 0 0 8pt 0; font-size: 10pt; color: #047857;"><strong>Resultado:</strong> ${p.impactOrResult}</p>` : ''}
        `
          )
          .join('')}
      `
          : ''
      }
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = profile.personalInfo.fullName.replace(/\s+/g, '_');
  const safeRole = cv.name.replace(/\s+/g, '_');
  a.href = url;
  a.download = `CV_${safeName}_${safeRole}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
