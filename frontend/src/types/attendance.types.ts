// ─── Shared domain types ──────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  createdAt: string;
  session: {
    id: string;
    date: string;
    course: { name: string; code: string };
    faculty: { user: { name: string } };
  };
}

export interface SubjectStat {
  code: string;
  name: string;
  total: number;
  present: number;
  absent: number;
  percentage: string;
}

export interface AttendanceSummary {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: string;
}

export interface StudentProfile {
  id: string;
  rollNumber: string;
  sectionId?: string;
  user: { name: string; email: string };
  department?: { name: string };
  class?: { name: string };
  section?: { name: string };
}

export interface CourseSession {
  id: string;
  date: string;
  isActive: boolean;
  attendanceCode?: string | null;
  course?: { id: string; name: string; code: string };
  section?: { id: string; name: string; class?: { name: string } };
  sectionId?: string;
}

export interface CorrectionRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedStatus: 'PRESENT' | 'LATE' | 'ABSENT';
  reason: string;
  createdAt: string;
  attendance?: {
    id: string;
    status: string;
    student?: { user?: { name: string; email: string }; department?: { name: string } };
    session?: { course?: { name: string; code: string }; faculty?: { user?: { name: string } } };
  };
}

export interface LowAttendanceStudent {
  studentId: string;
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  className: string;
  sectionName: string;
  totalClasses: number;
  presentCount: number;
  percentage: number;
}
