export default function handler(req: any, res: any) {
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
    const code = body.code;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Correo y código requeridos.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const g = globalThis as any;
    const pendingVerifications = g.__pendingVerifications || {};
    const pending = pendingVerifications[cleanEmail];

    // Master PIN (123456 or 000000) or valid pending code
    const isMaster = cleanCode === '123456' || cleanCode === '000000';
    const isMatch = pending && pending.code === cleanCode;

    if (!isMaster && !isMatch) {
      return res.status(400).json({ success: false, error: 'Código incorrecto. Revisa los 6 dígitos o usa el código maestro 123456.' });
    }

    const user = (pending && pending.userData) ? pending.userData : {
      id: `user-${Date.now()}`,
      username: cleanEmail,
      email: cleanEmail,
      fullName: cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    delete pendingVerifications[cleanEmail];

    return res.status(200).json({
      success: true,
      message: '¡Correo verificado y cuenta activada con éxito!',
      user,
      token: `tm_token_${user.id}_${Date.now()}`,
    });
  } catch (err: any) {
    console.error('[FATAL VERIFY-CODE ERROR]', err);
    return res.status(500).json({ success: false, error: err.message || 'Error al verificar código' });
  }
}
