import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// GET public lists for registration form
router.get('/departments', async (req, res) => {
  const departments = await prisma.department.findMany();
  res.json(departments);
});
router.get('/classes', async (req, res) => {
  const { departmentId } = req.query;
  const classes = await prisma.class.findMany({ where: departmentId ? { departmentId: String(departmentId) } : {} });
  res.json(classes);
});
router.get('/sections', async (req, res) => {
  const { classId } = req.query;
  const sections = await prisma.section.findMany({ where: classId ? { classId: String(classId) } : {} });
  res.json(sections);
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, departmentId, classId, sectionId, employeeId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'ADMIN' ? Role.ADMIN : role === 'FACULTY' ? Role.FACULTY : Role.STUDENT;

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: userRole },
    });

    // Create role-specific profiles
    if (userRole === Role.STUDENT && rollNumber && departmentId && classId && sectionId) {
      await prisma.student.create({
        data: { userId: user.id, rollNumber, departmentId, classId, sectionId },
      });
    } else if (userRole === Role.FACULTY && employeeId && departmentId) {
      await prisma.faculty.create({
        data: { userId: user.id, employeeId, departmentId },
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ error: `You do not have ${role} privileges` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentProfile: {
          include: { department: true, class: true, section: true }
        },
        facultyProfile: {
          include: { department: true }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Map studentProfile -> student and facultyProfile -> faculty for consistent frontend consumption
    const { studentProfile, facultyProfile, ...rest } = user;
    res.json({
      ...rest,
      student: studentProfile,
      faculty: facultyProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
