import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require ADMIN role
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

// 1. GET /api/admin/faculty — List all faculty with details
router.get('/faculty', async (req: AuthRequest, res) => {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        department: true,
        sessions: {
          include: { course: true, section: { include: { class: true } } },
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: { select: { sessions: true } },
      },
    });
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch faculty list' });
  }
});

// 2. POST /api/admin/faculty — Create a new faculty member
router.post('/faculty', async (req: AuthRequest, res) => {
  try {
    const { name, email, password, employeeId, departmentId } = req.body;
    if (!name || !email || !password || !employeeId || !departmentId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: Role.FACULTY },
    });

    const faculty = await prisma.faculty.create({
      data: { userId: user.id, employeeId, departmentId },
      include: { department: true, user: { select: { name: true, email: true } } },
    });

    res.status(201).json(faculty);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create faculty' });
  }
});

// 3. GET /api/admin/departments-tree — Full department hierarchy (classes, sections, courses, faculty count, student count)
router.get('/departments-tree', async (req: AuthRequest, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        classes: {
          include: {
            sections: {
              include: {
                _count: { select: { students: true, sessions: true } },
              },
            },
            _count: { select: { students: true } },
          },
        },
        courses: true,
        faculties: {
          include: { user: { select: { name: true, email: true } } },
        },
        _count: { select: { students: true, faculties: true, courses: true } },
      },
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department hierarchy' });
  }
});

// 4. POST /api/admin/departments — Create department
router.post('/departments', async (req: AuthRequest, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
    const dept = await prisma.department.create({ data: { name, code: code.toUpperCase() } });
    res.status(201).json(dept);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create department' });
  }
});

// 5. POST /api/admin/classes — Create class
router.post('/classes', async (req: AuthRequest, res) => {
  try {
    const { name, departmentId } = req.body;
    if (!name || !departmentId) return res.status(400).json({ error: 'Name and departmentId required' });
    const cls = await prisma.class.create({ data: { name, departmentId } });
    res.status(201).json(cls);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create class' });
  }
});

// 6. POST /api/admin/sections — Create section
router.post('/sections', async (req: AuthRequest, res) => {
  try {
    const { name, classId } = req.body;
    if (!name || !classId) return res.status(400).json({ error: 'Name and classId required' });
    const sec = await prisma.section.create({ data: { name, classId } });
    res.status(201).json(sec);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create section' });
  }
});

// 7. POST /api/admin/courses — Create course
router.post('/courses', async (req: AuthRequest, res) => {
  try {
    const { name, code, departmentId } = req.body;
    if (!name || !code || !departmentId) return res.status(400).json({ error: 'Name, code, departmentId required' });
    const course = await prisma.course.create({ data: { name, code: code.toUpperCase(), departmentId } });
    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create course' });
  }
});

export default router;
