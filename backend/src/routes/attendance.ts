import express from 'express';
import { PrismaClient, AttendanceStatus } from '@prisma/client';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/attendance/mark — Faculty/Admin marks attendance for a session
router.post('/mark', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    const { sessionId, records } = req.body;
    if (!sessionId || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'sessionId and records array required' });
    }

    // Delete existing attendance records for this session before inserting new ones to allow editing
    await prisma.attendance.deleteMany({
      where: { sessionId },
    });

    const attendanceData = records.map((record: { studentId: string; status: string }) => ({
      sessionId,
      studentId: record.studentId,
      status: record.status as AttendanceStatus,
    }));

    await prisma.attendance.createMany({
      data: attendanceData,
      skipDuplicates: true,
    });

    res.json({ message: 'Attendance marked successfully', count: records.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// GET /api/attendance/session/:sessionId — Get attendance for a session
router.get('/session/:sessionId', authenticate, async (req: AuthRequest, res) => {
  const sessionId = String(req.params['sessionId']);
  try {
    const records = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// GET /api/attendance/student/:studentId — Get attendance history and subject stats for a student
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res) => {
  const studentId = String(req.params['studentId']);
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        session: {
          include: { course: true, faculty: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { session: { date: 'desc' } },
    });

    const totalClasses = records.length;
    const presentCount = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : '0.0';

    // Group by course for subject-wise attendance breakdown
    const courseMap: Record<string, { code: string; name: string; total: number; present: number; absent: number }> = {};
    records.forEach(r => {
      const course = r.session.course;
      if (!courseMap[course.id]) {
        courseMap[course.id] = { code: course.code, name: course.name, total: 0, present: 0, absent: 0 };
      }
      courseMap[course.id].total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') {
        courseMap[course.id].present++;
      } else {
        courseMap[course.id].absent++;
      }
    });

    const subjectBreakdown = Object.values(courseMap).map(c => ({
      code: c.code,
      name: c.name,
      total: c.total,
      present: c.present,
      absent: c.absent,
      percentage: c.total > 0 ? ((c.present / c.total) * 100).toFixed(1) : '0.0',
    }));

    res.json({
      records,
      summary: { totalClasses, presentCount, absentCount: totalClasses - presentCount, attendancePercentage },
      subjects: subjectBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
});

// GET /api/attendance/low — Students with attendance < 75%
router.get('/low', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { name: true, email: true } },
        department: true,
        class: true,
        section: true,
        attendance: true,
      },
    });

    const lowAttendance = students
      .map(student => {
        const total = student.attendance.length;
        const present = student.attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const percentage = total > 0 ? (present / total) * 100 : 0;
        return {
          studentId: student.id,
          name: student.user.name,
          email: student.user.email,
          rollNumber: student.rollNumber,
          department: student.department?.name || 'N/A',
          className: student.class?.name || 'N/A',
          sectionName: student.section?.name || 'N/A',
          totalClasses: total,
          presentCount: present,
          percentage: Math.round(percentage * 10) / 10,
        };
      })
      .filter(s => s.totalClasses > 0 && s.percentage < 75)
      .sort((a, b) => a.percentage - b.percentage);

    res.json(lowAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low attendance students' });
  }
});

// POST /api/attendance/correction — Request an attendance correction
router.post('/correction', authenticate, async (req: AuthRequest, res) => {
  try {
    const { attendanceId, requestedStatus, reason } = req.body;
    if (!attendanceId || !requestedStatus || !reason) {
      return res.status(400).json({ error: 'attendanceId, requestedStatus, and reason are required' });
    }
    const correction = await prisma.correctionRequest.create({
      data: { attendanceId, requestedStatus: requestedStatus as AttendanceStatus, reason },
    });
    res.status(201).json(correction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create correction request' });
  }
});

// GET /api/attendance/corrections/my — Student's own correction requests
router.get('/corrections/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const student = await prisma.student.findFirst({ where: { userId: req.userId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const corrections = await prisma.correctionRequest.findMany({
      where: { attendance: { studentId: student.id } },
      include: {
        attendance: {
          include: {
            session: { include: { course: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(corrections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch my corrections' });
  }
});

// GET /api/attendance/corrections — All pending/processed correction requests (Admin & Faculty)
router.get('/corrections', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    const corrections = await prisma.correctionRequest.findMany({
      include: {
        attendance: {
          include: {
            student: { include: { user: { select: { name: true, email: true } }, department: true } },
            session: { include: { course: true, faculty: { include: { user: { select: { name: true } } } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(corrections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch correction requests' });
  }
});

// PUT /api/attendance/correction/:id — Approve/Reject correction (Admin & Faculty)
router.put('/correction/:id', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  const id = String(req.params['id']);
  try {
    const { status } = req.body;
    const correction = await prisma.correctionRequest.update({
      where: { id },
      data: { status },
    });
    if (status === 'APPROVED') {
      await prisma.attendance.update({
        where: { id: correction.attendanceId },
        data: { status: correction.requestedStatus },
      });
    }
    res.json({ message: `Correction request ${status.toLowerCase()}`, correction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update correction request' });
  }
});

// POST /api/attendance/smart-join — Student marks themselves present via live code
router.post('/smart-join', authenticate, authorizeRoles('STUDENT'), async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    // 1. Find active session matching this code
    const session = await prisma.session.findFirst({
      where: { attendanceCode: String(code).trim(), isActive: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Invalid or expired attendance code. Ask your teacher for the latest code.' });
    }

    // 2. Get the student profile for the logged-in user
    const student = await prisma.student.findUnique({
      where: { userId: req.userId },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // 3. Security: ensure student belongs to the session's section
    if (student.sectionId && session.sectionId && student.sectionId !== session.sectionId) {
      return res.status(403).json({ error: 'You are not enrolled in the section this session belongs to' });
    }

    // 4. Check if already marked present
    const existing = await prisma.attendance.findUnique({
      where: { sessionId_studentId: { sessionId: session.id, studentId: student.id } },
    });
    if (existing?.status === 'PRESENT') {
      return res.status(409).json({ error: 'You have already marked your attendance for this session' });
    }

    // 5. Upsert — only marks PRESENT when student actively submits
    await prisma.attendance.upsert({
      where: { sessionId_studentId: { sessionId: session.id, studentId: student.id } },
      update: { status: 'PRESENT' },
      create: { sessionId: session.id, studentId: student.id, status: 'PRESENT' },
    });

    res.json({ message: 'Attendance marked successfully!', session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

export default router;

