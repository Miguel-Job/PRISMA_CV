export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const defaultUsers = [
    {
      id: 'user-admin-master',
      username: 'admin',
      email: 'admin@prisma.app',
      fullName: 'Administrador General PRISMA',
      role: 'Administrador',
      professionalArea: 'Gestión General de Plataforma',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'user-carlos-1',
      username: 'carlos.mendoza',
      email: 'carlos.mendoza.hidro@gmail.com',
      fullName: 'Carlos Alberto Mendoza Alarcón',
      role: 'Profesional Principal',
      professionalArea: 'Recursos Hídricos y Gestión Ambiental',
      createdAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 'user-alianzero-1',
      username: 'alianzero391@gmail.com',
      email: 'alianzero391@gmail.com',
      fullName: 'Usuario Principal (Alianzero)',
      role: 'Profesional Verificado',
      professionalArea: 'Recursos Hídricos e Ingeniería',
      createdAt: '2026-10-09T02:50:00Z',
    },
    {
      id: 'user-mangel-1',
      username: 'mangeltorresd99@gmail.com',
      email: 'mangeltorresd99@gmail.com',
      fullName: 'Miky (Mangel Torres)',
      role: 'Profesional Verificado',
      professionalArea: 'Tecnología y Gestión de Proyectos',
      createdAt: '2026-10-10T14:30:00Z',
    },
    {
      id: 'user-scjasjc-1',
      username: 'scjasjc@gmail.com',
      email: 'scjasjc@gmail.com',
      fullName: 'Juan Carlos',
      role: 'Profesional Verificado',
      professionalArea: 'Ingeniería y Proyectos',
      createdAt: '2026-10-10T16:15:00Z',
    }
  ];

  return res.status(200).json({
    total: defaultUsers.length,
    users: defaultUsers,
  });
}
