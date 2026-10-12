import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    body = body || {};
    const user = body.user || process.env.SMTP_USER || 'prisma.dig.office@gmail.com';
    const rawPass = body.pass || process.env.SMTP_PASS || '';
    const pass = rawPass.trim().replace(/[\s\r\n\t]/g, '');

    if (!user || !pass) {
      return res.status(400).json({ success: false, error: 'Usuario y Contraseña de aplicación requeridos.' });
    }

    const testTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    await testTransporter.verify();

    return res.status(200).json({
      success: true,
      connected: true,
      configuredUser: user,
      message: `¡Excelente! Conexión validada exitosamente con Google SMTP (${user}).`,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      connected: false,
      error: err.message,
      message: 'Google rechazó la contraseña de aplicación. Verifica las 16 letras.',
    });
  }
}
