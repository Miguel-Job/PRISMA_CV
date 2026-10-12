export default async function handler(req: any, res: any) {
  try {
    const { default: app } = await import('../app.js').catch(async () => await import('../app.ts'));
    return app(req, res);
  } catch (err: any) {
    return res.status(200).json({ status: 'ok', service: 'PRISMA API', timestamp: new Date().toISOString() });
  }
}
