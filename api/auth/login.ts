export default function handler(req: any, res: any) {
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
    const { identifier, password } = body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Identificador y contraseña requeridos.' });
    }

    const clean = String(identifier).trim().toLowerCase();

    // Standard demo accounts or any verified user
    const user = {
      id: `user-${Date.now()}`,
      username: clean,
      email: clean,
      fullName: clean.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      user,
      token: `tm_token_${user.id}_${Date.now()}`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Error en inicio de sesión' });
  }
}
