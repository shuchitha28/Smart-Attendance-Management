import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/sessions — List sessions
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const where: any = {};
    if (req.userRole === 'FACULTY') {
      const faculty = await prisma.faculty.findFirst({ where: { userId: req.userId } });
      if (faculty) where.facultyId = faculty.id;
    }
    const sessions = await prisma.session.findMany({
      where,
      include: {
        course: true,
        section: { include: { class: true } },
        faculty: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/sessions — Create a session
router.post('/', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    const { courseId, sectionId, date, startTime, endTime } = req.body;
    let { facultyId } = req.body;

    if (req.userRole === 'FACULTY') {
      const faculty = await prisma.faculty.findFirst({ where: { userId: req.userId } });
      if (!faculty) return res.status(400).json({ error: 'Faculty profile not found' });
      facultyId = faculty.id;
    }

    const session = await prisma.session.create({
      data: {
        facultyId,
        courseId,
        sectionId,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true,
        attendanceCode: Math.floor(100000 + Math.random() * 900000).toString(),
      },
    });
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/departments
router.get('/departments', authenticate, async (req: AuthRequest, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { students: true, faculties: true, courses: true } } },
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// GET /api/sessions/courses
router.get('/courses', authenticate, async (req: AuthRequest, res) => {
  try {
    const courses = await prisma.course.findMany({ include: { department: true } });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/sessions/sections
router.get('/sections', authenticate, async (req: AuthRequest, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: { class: true, _count: { select: { students: true } } },
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

export default router;

// PATCH /api/sessions/:id/end — End a live smart session
router.patch('/:id/end', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    const session = await prisma.session.update({
      where: { id: req.params.id as string },
      data: { isActive: false, attendanceCode: null },
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// PATCH /api/sessions/:id/rotate-code — Rotate live attendance code
router.patch('/:id/rotate-code', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const session = await prisma.session.update({
      where: { id: req.params.id as string },
      data: { attendanceCode: newCode },
    });
    res.json({ code: newCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rotate code' });
  }
});
