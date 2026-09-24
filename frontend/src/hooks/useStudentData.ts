import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import type { AttendanceRecord, SubjectStat, AttendanceSummary } from '../types/attendance.types';

interface StudentData {
  records: AttendanceRecord[];
  subjects: SubjectStat[];
  summary: AttendanceSummary | null;
  profile: any;
  myCorrections: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * useStudentData
 * Fetches profile, attendance history, subject stats and correction requests
 * for the currently logged-in student.
 */
export function useStudentData(token: string | null): StudentData {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myCorrections, setMyCorrections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, { headers });
      if (!meRes.ok) throw new Error('Failed to fetch profile');
      const meData = await meRes.json();
      setProfile(meData);

      if (meData.student?.id) {
        const [attRes, corrRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/attendance/student/${meData.student.id}`, { headers }),
          fetch(`${API_BASE_URL}/api/attendance/corrections/my`, { headers }),
        ]);
        const attData = await attRes.json();
        const corrData = await corrRes.json();

        setRecords(attData.records || []);
        setSummary(attData.summary || null);
        setSubjects(attData.subjects || []);
        setMyCorrections(corrData || []);
      }
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
      console.error('useStudentData error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { records, subjects, summary, profile, myCorrections, loading, error, refresh };
}
