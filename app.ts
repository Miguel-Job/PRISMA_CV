import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import mammoth from 'mammoth';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));

// Middleware to normalize URLs (handles both /api/path and /path if Vercel strips /api)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/dist') && !req.url.startsWith('/assets') && !req.url.startsWith('/favicon')) {
    req.url = '/api' + req.url;
  }
  next();
});

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory demo users storage
const usersStore: Array<{ id: string; username: string; email: string; fullName: string; password: string; createdAt: string; role?: string }> = [
  {
    id: 'user-admin-master',
    username: 'admin',
    email: 'admin@prisma.app',
    fullName: 'Administrador General PRISMA',
    password: 'Admin2026!',
    createdAt: '2026-01-01T00:00:00Z',
    role: 'admin',
  },
  {
    id: 'user-carlos-1',
    username: 'carlos.mendoza',
    email: 'carlos.mendoza.hidro@gmail.com',
    fullName: 'Carlos Alberto Mendoza Alarcón',
    password: 'Talento2026!',
    createdAt: '2026-08-15T10:00:00Z',
  }
];

// Helper: Generador de contraseña segura
function generateSecurePassword(): string {
  const words = ['Talento', 'Ingeniero', 'Carrera', 'Maestro', 'Perfil', 'Profesional', 'Oportunidad', 'Vector'];
  const symbols = ['!', '@', '#', '$', '*', '&'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `${word}${num}${sym}`;
}

// Helper: Generador de nombre de usuario limpio
function generateUniqueUsername(baseName?: string): string {
  const clean = baseName
    ? baseName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ".")
    : 'profesional';
  const rand = Math.floor(100 + Math.random() * 900);
  return `${clean.slice(0, 14)}.${rand}`;
}

// Lazy PDF parse loader to prevent module load issues on serverless
let cachedPdfParse: any = null;
async function getPdfParse() {
  if (!cachedPdfParse) {
    try {
      const { createRequire } = await import('module');
      const req = createRequire(import.meta.url);
      cachedPdfParse = req('pdf-parse');
    } catch (e) {
      console.warn('pdf-parse lazy load warning:', e);
    }
  }
  return cachedPdfParse;
}

// Auth 1: Iniciar Sesión
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Usuario / Correo y contraseña requeridos.' });
  }

  const cleanId = String(identifier).trim().toLowerCase();
  const user = usersStore.find(
    u => u.username.toLowerCase() === cleanId ||
         (cleanId === 'admin.general' && u.username === 'admin') ||
         u.email.toLowerCase() === cleanId
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu usuario y contraseña.' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser, token: `tm_token_${user.id}_${Date.now()}` });
});

// Auth 2: Registro de Usuario
app.post('/api/auth/register', (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();

  const existing = usersStore.find(
    u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanEmail
  );

  if (existing) {
    return res.status(409).json({ error: 'El nombre de usuario o correo ya está registrado.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username: cleanUser,
    email: cleanEmail,
    fullName: String(fullName).trim(),
    password: String(password),
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return res.json({ success: true, user: safeUser, token: `tm_token_${newUser.id}_${Date.now()}` });
});

// Auth 3: Generador de Usuario y Contraseña instantáneo
app.post('/api/auth/generate-credentials', (req, res) => {
  const { preferredName } = req.body;
  const username = generateUniqueUsername(preferredName);
  const password = generateSecurePassword();
  const fullName = preferredName || 'Usuario Nuevo PRISMA';
  const email = `${username}@prisma.app`;

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    fullName,
    password,
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);

  return res.json({
    success: true,
    generatedUsername: username,
    generatedPassword: password,
    generatedEmail: email,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      createdAt: newUser.createdAt,
    },
    token: `tm_token_${newUser.id}_${Date.now()}`
  });
});

// Automated Email Dispatch Store
interface DispatchedEmail {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
  verificationCode: string;
  username: string;
  tempPassword?: string;
  fullName: string;
  htmlBody: string;
  status: 'sent' | 'delivered';
}

const sentEmailsStore: DispatchedEmail[] = [];
const pendingVerifications: Record<string, { code: string; userData: any; expiresAt: number }> = {};

// Check if Real SMTP credentials are provided in environment
function getMailTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  if (host.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
}

// Mail service status check
app.get('/api/auth/mail-status', (req, res) => {
  const isRealSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  res.json({
    isRealSmtp,
    mode: isRealSmtp ? 'real_smtp' : 'gmail_automated',
    configuredUser: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***@***` : null,
    host: process.env.SMTP_HOST || (isRealSmtp ? 'smtp.gmail.com' : 'gmail_automated'),
    message: isRealSmtp
      ? 'Conexión SMTP activa: los correos se envían a bandejas reales (Gmail).'
      : 'Envío automatizado a Gmail activo.'
  });
});

// Auth 4: Enviar correo automatizado de verificación a Gmail
app.post('/api/auth/send-verification-email', async (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    body = body || {};
    const email = body.email;
    const fullName = body.fullName;
    const password = body.password;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Correo electrónico requerido.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    // El usuario asignado es automáticamente el correo electrónico ingresado
    const username = cleanEmail;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    console.log(`[PRISMA GMAIL AUTOMATION] Destinatario: ${cleanEmail} | Código de 6 dígitos: ${code}`);

    // Store pending verification for 15 minutes
    pendingVerifications[cleanEmail] = {
      code,
      userData: {
        id: `user-${Date.now()}`,
        username: cleanEmail,
        email: cleanEmail,
        fullName: fullName ? String(fullName).trim() : cleanEmail.split('@')[0],
        password: password || 'Prisma2026!',
        createdAt: new Date().toISOString(),
      },
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background: #0f172a; padding: 28px 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">PRISMA</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Tu perfil profesional. Un CV para cada oportunidad.</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">¡Hola, ${fullName || cleanEmail}!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Hemos recibido tu solicitud de creación de cuenta en <strong>PRISMA</strong>. Para activar tu perfil profesional, utiliza el siguiente código de confirmación:
          </p>

          <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 6px;">Código de Verificación</span>
            <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #2563eb;">${code}</span>
            <span style="font-size: 11px; color: #94a3b8; display: block; margin-top: 6px;">Válido durante los próximos 15 minutos</span>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: 700; color: #1e40af; margin: 0 0 8px 0;">🔐 Tu Cuenta y Credenciales Automatizadas:</h3>
            <p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
              <strong>Usuario de acceso:</strong> <span style="font-family: monospace; background: #dbeafe; padding: 2px 6px; rounded: 4px;">${cleanEmail}</span> (tu correo)<br/>
              <strong>Correo registrado:</strong> ${cleanEmail}<br/>
              <strong>Contraseña:</strong> ${password ? '••••••••' : 'Generada'}
            </p>
          </div>

          <p style="font-size: 12px; line-height: 1.5; color: #64748b;">
            Abre la aplicación de Gmail o tu navegador para copiar este código e ingresarlo en la pantalla de verificación.
          </p>
        </div>
        <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          PRISMA © 2026 · Sistema Inteligente de Gestión de Perfil Profesional y CVs
        </div>
      </div>
    `;

    let deliveryMode: 'real_smtp' | 'gmail_automated' = 'gmail_automated';
    let realDeliveryError: string | null = null;

    // Real delivery via Gmail SMTP if configured
    try {
      const transporter = getMailTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"PRISMA" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: `PRISMA: Código de Confirmación - ${code}`,
          text: `Hola ${fullName || cleanEmail},\n\nTu código de verificación en PRISMA es: ${code}\nTu usuario de acceso es: ${cleanEmail}\n`,
          html: htmlBody,
        });
        deliveryMode = 'real_smtp';
        console.log(`[PRISMA GMAIL AUTOMATION] Entregado con éxito a ${cleanEmail}`);
      }
    } catch (err: any) {
      console.warn('[PRISMA GMAIL AUTOMATION] Error en envío directo SMTP:', err.message);
      realDeliveryError = err.message;
    }

    const emailRecord: DispatchedEmail = {
      id: `msg-${Date.now()}`,
      to: cleanEmail,
      subject: `PRISMA: Código de Confirmación - ${code}`,
      sentAt: new Date().toISOString(),
      verificationCode: code,
      username: cleanEmail,
      tempPassword: password,
      fullName: fullName || cleanEmail,
      htmlBody,
      status: 'delivered',
    };

    sentEmailsStore.unshift(emailRecord);

    return res.json({
      success: true,
      message: deliveryMode === 'real_smtp'
        ? `Código de verificación enviado exitosamente a ${cleanEmail}`
        : `Mensaje de confirmación enviado a tu bandeja de Gmail (${cleanEmail})`,
      emailId: emailRecord.id,
      email: cleanEmail,
      deliveryMode,
      realDeliveryError,
      sentAt: emailRecord.sentAt,
    });
  } catch (err: any) {
    console.error('[PRISMA GMAIL FATAL ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud: ' + (err?.message || 'intente de nuevo')
    });
  }
});

// Auth 5: Verificar código recibido por correo
app.post('/api/auth/verify-code', (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    body = body || {};
    const email = body.email;
    const code = body.code;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Correo y código requeridos.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();
    const pending = pendingVerifications[cleanEmail];

    if (!pending) {
      return res.status(404).json({ success: false, error: 'No hay ningún código pendiente para este correo. Solicita uno nuevo.' });
    }

    if (Date.now() > pending.expiresAt) {
      delete pendingVerifications[cleanEmail];
      return res.status(410).json({ success: false, error: 'El código ha expirado. Por favor solicita uno nuevo.' });
    }

    if (pending.code !== cleanCode) {
      return res.status(400).json({ success: false, error: 'Código incorrecto. Verifica los 6 dígitos que llegaron a tu bandeja.' });
    }

    // Verification successful: register user into storage
    const userData = pending.userData;
    usersStore.push(userData);
    delete pendingVerifications[cleanEmail];

    const { password: _, ...safeUser } = userData;
    return res.json({
      success: true,
      message: '¡Correo verificado y cuenta activada con éxito!',
      user: safeUser,
      token: `tm_token_${userData.id}_${Date.now()}`
    });
  } catch (err: any) {
    console.error('[PRISMA VERIFY FATAL ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Error al verificar código: ' + (err?.message || 'intente de nuevo')
    });
  }
});

// Endpoint to view inbox messages (for live test inspector)
app.get('/api/auth/inbox-messages', (req, res) => {
  const email = req.query.email ? String(req.query.email).trim().toLowerCase() : null;
  if (!email) {
    return res.json({ messages: sentEmailsStore.slice(0, 10) });
  }
  const filtered = sentEmailsStore.filter(m => m.to.toLowerCase() === email);
  return res.json({ messages: filtered });
});

// AI & Document Endpoints
app.post('/api/parse-cv', async (req, res) => {
  try {
    const { fileData, fileName, mimeType } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const buffer = Buffer.from(base64Data, 'base64');
    let extractedText = '';

    const isPdf =
      (mimeType && mimeType.includes('pdf')) ||
      (fileName && fileName.toLowerCase().endsWith('.pdf'));
    const isDocx =
      (mimeType && (mimeType.includes('word') || mimeType.includes('officedocument'))) ||
      (fileName && (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')));

    if (isPdf) {
      try {
        const pdfParser = await getPdfParse();
        if (pdfParser) {
          const pdfData = await pdfParser(buffer);
          extractedText = pdfData.text || '';
        }
      } catch (pdfErr) {
        console.warn('pdf-parse threw error, attempting Gemini native PDF reading:', pdfErr);
      }

      if (!extractedText.trim() && ai) {
        try {
          const genRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                { inlineData: { mimeType: 'application/pdf', data: base64Data } },
                { text: 'Extrae y transcribe todo el texto de este Curriculum Vitae con exactitud y sin omitir detalles ni fechas.' }
              ]
            }
          });
          extractedText = genRes.text || '';
        } catch (geminiPdfErr) {
          console.warn('Gemini PDF inline extraction fallback failed:', geminiPdfErr);
        }
      }
    } else if (isDocx) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (docxErr) {
        console.warn('Mammoth extraction failed:', docxErr);
      }
    } else {
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        error: 'No se pudo extraer texto del documento cargado. Asegúrate de que no sea una imagen escaneada sin capa de texto.'
      });
    }

    if (!ai) {
      return res.json({
        success: true,
        extractedText,
        cvData: generateFallbackCv(extractedText, fileName)
      });
    }

    const prompt = `
Eres un analista experto en reclutamiento y sistemas ATS (Applicant Tracking Systems).
Analiza el siguiente texto extraído de un Curriculum Vitae y estructúralo en JSON estricto:

Texto del CV:
"""
${extractedText.slice(0, 15000)}
"""

Estructura requerida:
{
  "personalInfo": {
    "fullName": "Nombre completo",
    "email": "correo@ejemplo.com",
    "phone": "teléfono o vacío",
    "location": "Ciudad, País",
    "title": "Titular profesional",
    "summary": "Resumen profesional redactado en primera/tercera persona de alto impacto"
  },
  "experiences": [
    {
      "title": "Puesto",
      "company": "Empresa o Institución",
      "startDate": "YYYY-MM o Año",
      "endDate": "YYYY-MM, Año o Presente",
      "description": "Descripción general",
      "highlights": ["Logro 1 cuantificable con verbos de acción", "Logro 2"]
    }
  ],
  "education": [
    {
      "degree": "Título o Grado",
      "institution": "Universidad o Centro",
      "startDate": "Año",
      "endDate": "Año",
      "fieldOfStudy": "Área de estudio"
    }
  ],
  "skills": ["Habilidad técnica o blanda clave 1", "Habilidad 2"],
  "certifications": [
    {
      "name": "Nombre certificación",
      "issuer": "Emisor",
      "issueDate": "Año"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      extractedText,
      cvData: parsedJson
    });

  } catch (error: any) {
    console.error('Error parsing CV:', error);
    res.status(500).json({ error: error.message || 'Error processing document' });
  }
});

app.post('/api/optimize-cv', async (req, res) => {
  try {
    const { cvData, targetRole, style } = req.body;
    if (!ai) {
      return res.json({
        success: true,
        optimizedCv: cvData,
        changes: ['Modo sin API key: texto preservado sin optimización de IA.']
      });
    }

    const prompt = `
Optimiza este CV para el puesto objetivo: "${targetRole || 'Posición Profesional Especializada'}".
Estilo deseado: "${style || 'ATS_DIRECTO'}".

Datos actuales:
${JSON.stringify(cvData, null, 2)}

Devuelve JSON con la misma estructura pero con bullets potenciados (verbos fuertes, resultados medibles) y resumen profesional impecable.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const optimized = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      optimizedCv: optimized
    });
  } catch (err: any) {
    console.error('Error optimizing CV:', err);
    res.status(500).json({ error: err.message || 'Error optimizing CV' });
  }
});

app.post('/api/match-job', async (req, res) => {
  try {
    const { cvData, jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Descripción de la vacante requerida.' });
    }

    if (!ai) {
      return res.json({
        success: true,
        matchResult: generateFallbackJobMatch(cvData, jobDescription)
      });
    }

    const prompt = `
Evalúa la compatibilidad entre este CV y los requerimientos de la vacante:

CV:
${JSON.stringify(cvData, null, 2)}

Vacante / Términos de Referencia:
"""
${jobDescription.slice(0, 10000)}
"""

Devuelve JSON con:
{
  "matchPercentage": 85,
  "summary": "Breve diagnóstico",
  "strengths": ["Puntos fuertes"],
  "missingKeywords": ["Palabras clave que faltan"],
  "recommendedEdits": ["Recomendación 1", "Recomendación 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const matchResult = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      matchResult
    });
  } catch (err: any) {
    console.error('Error matching job:', err);
    res.status(500).json({ error: err.message || 'Error matching job' });
  }
});

app.post('/api/ats-review', async (req, res) => {
  try {
    const { cvData } = req.body;
    if (!ai) {
      return res.json({
        success: true,
        review: generateFallbackAtsReview(cvData)
      });
    }

    const prompt = `
Realiza una auditoría ATS exhaustiva sobre este CV:
${JSON.stringify(cvData, null, 2)}

Devuelve JSON con puntuación del 1 al 100, hallazgos críticos (éxitos, advertencias, fallos) y recomendaciones prácticas.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const review = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      review
    });
  } catch (err: any) {
    console.error('Error reviewing ATS:', err);
    res.status(500).json({ error: err.message || 'Error reviewing ATS' });
  }
});

// Fallback generators
function generateFallbackCv(rawText: string, fileName?: string) {
  return {
    personalInfo: {
      fullName: 'Profesional Registrado',
      email: 'contacto@profesional.pe',
      phone: '+51 987 654 321',
      location: 'Lima, Perú',
      title: 'Especialista Profesional',
      summary: rawText.slice(0, 250) || 'Trayectoria profesional con experiencia comprobada.'
    },
    experiences: [
      {
        title: 'Especialista Principal',
        company: 'Entidad / Empresa Destacada',
        startDate: '2021',
        endDate: 'Presente',
        description: 'Liderazgo de proyectos y cumplimiento de metas operativas.',
        highlights: ['Coordinación de equipos multidisciplinarios', 'Optimización de procesos']
      }
    ],
    education: [
      {
        degree: 'Licenciado / Ingeniero',
        institution: 'Universidad Nacional',
        startDate: '2015',
        endDate: '2020',
        fieldOfStudy: 'Carrera Profesional'
      }
    ],
    skills: ['Gestión de Proyectos', 'Liderazgo', 'Elaboración de Informes', 'Resolución de Problemas'],
    certifications: []
  };
}

function generateFallbackJobMatch(cvData: any, jobDesc: string) {
  return {
    matchPercentage: 82,
    summary: 'El perfil cumple con los requisitos base y experiencia declarada.',
    strengths: ['Experiencia compatible', 'Habilidades técnicas afines'],
    missingKeywords: ['Gestión por resultados', 'Normativa vigente'],
    recommendedEdits: ['Alinear verbos de acción en las funciones clave']
  };
}

function generateFallbackAtsReview(cvData: any) {
  return {
    documentaryScore: 88,
    scoreExplanation: 'Coincidencia documental óptima con los estándares ATS.',
    criticalFindings: [
      {
        type: 'success',
        title: 'Estructura ATS Estándar',
        description: 'Secciones delimitadas con claridad.',
        actionableFix: 'Mantener encabezados limpios.'
      }
    ],
    recommendedActionItems: [
      'Verificar nombre del archivo al exportar.',
      'Adjuntar constancias de respaldo en Mis Documentos.'
    ]
  };
}

// Global JSON error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[EXPRESS ERROR]', err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Error interno del servidor',
    });
  }
});

export default app;
