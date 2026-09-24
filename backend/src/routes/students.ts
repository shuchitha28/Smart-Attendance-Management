import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/students — Admin & Faculty can list students
router.get('/', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        department: true,
        class: true,
        section: true,
      },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id — Get a single student
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const id = String(req.params['id']);
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        department: true,
        class: true,
        section: true,
        attendance: {
          include: { session: { include: { course: true } } },
          orderBy: { session: { date: 'desc' } },
          take: 50,
        },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

export default router;
