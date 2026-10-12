import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SMTP_USER?.trim() || 'prisma.dig.office@gmail.com';
  const rawPass = process.env.SMTP_PASS?.trim() || '';
  const pass = rawPass.replace(/[\s\r\n\t]/g, '');

  if (!pass) {
    return res.status(200).json({
      configured: false,
      connected: false,
      mode: 'sandbox',
      message: 'La variable SMTP_PASS no está configurada en este entorno.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.verify();
    return res.status(200).json({
      configured: true,
      connected: true,
      mode: 'real_smtp',
      configuredUser: user,
      message: `¡Conexión exitosa con el servidor SMTP de Gmail! Los correos se envían en vivo desde ${user}.`,
    });
  } catch (err: any) {
    return res.status(200).json({
      configured: true,
      connected: false,
      mode: 'error',
      error: err.message,
      message: 'Gmail rechazó la autenticación. Verifica que la contraseña de 16 caracteres sea correcta.',
    });
  }
}
