export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const defaultUsers = [
    {
      id: 'user-admin-prisma-office',
      username: 'prisma.dig.office',
      email: 'prisma.dig.office@gmail.com',
      fullName: 'Administración General PRISMA',
      role: 'admin_general',
      professionalArea: 'Supervisión y Dirección General de Plataforma',
      createdAt: '2026-01-01T00:00:00Z',
    }
  ];

  return res.status(200).json({
    total: defaultUsers.length,
    users: defaultUsers,
  });
}
