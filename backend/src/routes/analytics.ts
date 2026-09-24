import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analytics/early-warning — Predicts and flags students at risk
router.get('/early-warning', authenticate, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  try {
    // Optional query param to filter by course
    const { courseId } = req.query;

    const students = await prisma.student.findMany({
      include: {
        user: { select: { name: true, email: true } },
        class: true,
        department: true,
        attendance: {
          include: {
            session: { select: { date: true, courseId: true } }
          },
          ...(courseId ? { where: { session: { courseId: String(courseId) } } } : {}),
          orderBy: { session: { date: 'desc' } } // most recent first
        }
      }
    });

    const analytics = students.map(student => {
      const totalClasses = student.attendance.length;
      if (totalClasses === 0) {
        return {
          studentId: student.id,
          name: student.user.name,
          rollNumber: student.rollNumber,
          department: student.department.name,
          className: student.class.name,
          riskLevel: 'Unknown',
          riskScore: 0,
          reason: 'No attendance records yet',
          attendancePercentage: 0
        };
      }

      const presentClasses = student.attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendancePercentage = (presentClasses / totalClasses) * 100;

      // AI Heuristic 1: Analyze recent trend (last 5 classes)
      const last5 = student.attendance.slice(0, 5);
      const missedInLast5 = last5.filter(a => a.status === 'ABSENT').length;

      let riskLevel = 'Safe';
      let riskScore = 0; // 0-100 scale
      let reason = 'Attendance is stable and healthy.';

      if (attendancePercentage < 60) {
        riskLevel = 'High Risk';
        riskScore = 90;
        reason = 'Critically low overall attendance.';
      } else if (missedInLast5 >= 3) {
        riskLevel = 'High Risk';
        riskScore = 85;
        reason = `Sudden drop in attendance: missed ${missedInLast5} of the last ${last5.length} classes.`;
      } else if (attendancePercentage < 75) {
        riskLevel = 'Moderate Risk';
        riskScore = 60;
        reason = 'Overall attendance is below the recommended 75% threshold.';
      } else if (missedInLast5 === 2) {
        riskLevel = 'Moderate Risk';
        riskScore = 40;
        reason = 'Missed 2 classes recently; starting to slip.';
      } else {
        riskScore = 10;
      }

      return {
        studentId: student.id,
        name: student.user.name,
        rollNumber: student.rollNumber,
        email: student.user.email,
        department: student.department.name,
        className: student.class.name,
        totalClasses,
        presentClasses,
        attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
        riskLevel,
        riskScore,
        reason
      };
    });

    // Sort by risk score (highest risk first)
    analytics.sort((a, b) => b.riskScore - a.riskScore);

    res.json(analytics);
  } catch (error) {
    console.error('Early Warning Analytics Error:', error);
    res.status(500).json({ error: 'Failed to generate early warning analytics' });
  }
});

export default router;
