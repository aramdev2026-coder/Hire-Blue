import express from 'express';
import jwt from 'jsonwebtoken';
import { SECRET } from '../middleware/auth.js';
import { verifyPassword } from '../utils/password.js';
import { serializeAdminUser } from '../utils/serializers.js';

export default function createAuthRoutes(prisma) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin || !admin.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await verifyPassword(password, admin.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });

      const token = jwt.sign(
        { id: admin.id, role: admin.role, email: admin.email, name: admin.name },
        SECRET,
        { expiresIn: '8h' },
      );

      res.json({
        success: true,
        token,
        user: serializeAdminUser(admin),
      });
    } catch (err) {
      console.error('Admin login error:', err.message);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  router.get('/me', async (req, res) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const payload = jwt.verify(header.slice(7), SECRET);
      const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
      if (!admin || !admin.isActive) {
        return res.status(401).json({ error: 'Invalid session' });
      }
      res.json({ success: true, user: serializeAdminUser(admin) });
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  });

  return router;
}
