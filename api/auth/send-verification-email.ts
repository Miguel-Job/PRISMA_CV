import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store globally across Lambda instances if possible
    const g = globalThis as any;
    if (!g.__pendingVerifications) g.__pendingVerifications = {};
    g.__pendingVerifications[cleanEmail] = {
      code,
      userData: {
        id: `user-${Date.now()}`,
        username: cleanEmail,
        email: cleanEmail,
        fullName: fullName || cleanEmail.split('@')[0],
        createdAt: new Date().toISOString(),
      },
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    const user = process.env.SMTP_USER?.trim() || 'prisma.dig.office@gmail.com';
    const rawPass = process.env.SMTP_PASS?.trim() || '';
    const pass = rawPass.replace(/[\s\r\n\t]/g, '');

    let deliveryMode = 'gmail_automated';
    let realDeliveryError: string | null = null;

    if (user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"PRISMA" <${user}>`,
          to: cleanEmail,
          subject: `PRISMA: Código de Confirmación - ${code}`,
          text: `Hola ${fullName || cleanEmail},\n\nTu código de verificación en PRISMA es: ${code}\n`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #2563eb; margin-top: 0;">PRISMA</h2>
              <p>Hola <strong>${fullName || cleanEmail}</strong>,</p>
              <p>Tu código de confirmación oficial para activar tu cuenta es:</p>
              <div style="background: #f8fafc; border: 2px dashed #3b82f6; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; font-family: monospace;">${code}</span>
              </div>
              <p style="color: #64748b; font-size: 13px;">Ingresa este código en la pantalla de verificación para acceder de inmediato.</p>
            </div>
          `,
        });
        deliveryMode = 'real_smtp';
      } catch (err: any) {
        console.error('[SMTP DIRECT ERROR]', err);
        realDeliveryError = err.message;
      }
    }

    return res.status(200).json({
      success: true,
      message: deliveryMode === 'real_smtp'
        ? `Código de verificación enviado exitosamente a ${cleanEmail}`
        : `Mensaje de confirmación procesado para ${cleanEmail}`,
      email: cleanEmail,
      previewCode: code,
      deliveryMode,
      realDeliveryError,
      sentAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[FATAL SEND-EMAIL ERROR]', err);
    return res.status(500).json({ success: false, error: err.message || 'Error en el servidor' });
  }
}
