import { PrismaClient, Role, AttendanceStatus, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding with multi-department data...');

  // 1. Clean existing records in dependency order
  await prisma.correctionRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared database.');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 2. Create Departments
  const deptCSE = await prisma.department.create({
    data: { name: 'Computer Science & Engineering', code: 'CSE' },
  });
  const deptIT = await prisma.department.create({
    data: { name: 'Information Technology', code: 'IT' },
  });
  const deptECE = await prisma.department.create({
    data: { name: 'Electronics & Communication Engineering', code: 'ECE' },
  });
  const deptAIDS = await prisma.department.create({
    data: { name: 'Artificial Intelligence & Data Science', code: 'AI-DS' },
  });
  const deptMECH = await prisma.department.create({
    data: { name: 'Mechanical Engineering', code: 'MECH' },
  });

  // 3. Create Classes & Sections
  // CSE Classes
  const cseYear3 = await prisma.class.create({ data: { name: 'CSE - 3rd Year', departmentId: deptCSE.id } });
  const cseYear2 = await prisma.class.create({ data: { name: 'CSE - 2nd Year', departmentId: deptCSE.id } });
  const cseSec3A = await prisma.section.create({ data: { name: 'Section A', classId: cseYear3.id } });
  const cseSec3B = await prisma.section.create({ data: { name: 'Section B', classId: cseYear3.id } });
  const cseSec2A = await prisma.section.create({ data: { name: 'Section A', classId: cseYear2.id } });

  // IT Classes
  const itYear3 = await prisma.class.create({ data: { name: 'IT - 3rd Year', departmentId: deptIT.id } });
  const itSec3A = await prisma.section.create({ data: { name: 'Section A', classId: itYear3.id } });
  const itSec3B = await prisma.section.create({ data: { name: 'Section B', classId: itYear3.id } });

  // ECE Classes
  const eceYear3 = await prisma.class.create({ data: { name: 'ECE - 3rd Year', departmentId: deptECE.id } });
  const eceSec3A = await prisma.section.create({ data: { name: 'Section A', classId: eceYear3.id } });

  // AI-DS Classes
  const aidsYear2 = await prisma.class.create({ data: { name: 'AI & DS - 2nd Year', departmentId: deptAIDS.id } });
  const aidsSec2A = await prisma.section.create({ data: { name: 'Section A', classId: aidsYear2.id } });

  // MECH Classes
  const mechYear3 = await prisma.class.create({ data: { name: 'MECH - 3rd Year', departmentId: deptMECH.id } });
  const mechSec3A = await prisma.section.create({ data: { name: 'Section A', classId: mechYear3.id } });

  // 4. Create Courses
  // CSE Courses
  const cseCourses = [
    await prisma.course.create({ data: { name: 'Data Structures & Algorithms', code: 'CS301', departmentId: deptCSE.id } }),
    await prisma.course.create({ data: { name: 'Database Management Systems', code: 'CS302', departmentId: deptCSE.id } }),
    await prisma.course.create({ data: { name: 'Full-Stack Web Development', code: 'CS303', departmentId: deptCSE.id } }),
    await prisma.course.create({ data: { name: 'Operating Systems & Architecture', code: 'CS304', departmentId: deptCSE.id } }),
    await prisma.course.create({ data: { name: 'Object Oriented Programming', code: 'CS201', departmentId: deptCSE.id } }),
  ];

  // IT Courses
  const itCourses = [
    await prisma.course.create({ data: { name: 'Cloud Computing & DevOps', code: 'IT301', departmentId: deptIT.id } }),
    await prisma.course.create({ data: { name: 'Cybersecurity & Cryptography', code: 'IT302', departmentId: deptIT.id } }),
    await prisma.course.create({ data: { name: 'Computer Networks', code: 'IT303', departmentId: deptIT.id } }),
  ];

  // ECE Courses
  const eceCourses = [
    await prisma.course.create({ data: { name: 'Digital Signal Processing', code: 'EC301', departmentId: deptECE.id } }),
    await prisma.course.create({ data: { name: 'Microcontrollers & Embedded Systems', code: 'EC302', departmentId: deptECE.id } }),
    await prisma.course.create({ data: { name: 'VLSI Design & Architecture', code: 'EC303', departmentId: deptECE.id } }),
  ];

  // AI-DS Courses
  const aidsCourses = [
    await prisma.course.create({ data: { name: 'Machine Learning & Neural Networks', code: 'AI201', departmentId: deptAIDS.id } }),
    await prisma.course.create({ data: { name: 'Big Data Analytics', code: 'AI202', departmentId: deptAIDS.id } }),
    await prisma.course.create({ data: { name: 'Natural Language Processing', code: 'AI203', departmentId: deptAIDS.id } }),
  ];

  // MECH Courses
  const mechCourses = [
    await prisma.course.create({ data: { name: 'Thermodynamics & Heat Transfer', code: 'ME301', departmentId: deptMECH.id } }),
    await prisma.course.create({ data: { name: 'Robotics & Automation', code: 'ME302', departmentId: deptMECH.id } }),
  ];

  // 5. Create System Admin
  await prisma.user.create({
    data: {
      name: 'Dr. Alexander Vance (Dean/Admin)',
      email: 'admin@college.edu',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // 6. Create Multiple Faculty Members across Departments
  const facultyData = [
    { name: 'Dr. John Smith', email: 'smith@college.edu', empId: 'FAC-CSE-001', deptId: deptCSE.id },
    { name: 'Prof. Sarah Jenkins', email: 'jenkins@college.edu', empId: 'FAC-CSE-002', deptId: deptCSE.id },
    { name: 'Dr. Alan Turing', email: 'alan@college.edu', empId: 'FAC-CSE-003', deptId: deptCSE.id },
    { name: 'Prof. Grace Hopper', email: 'grace@college.edu', empId: 'FAC-CSE-004', deptId: deptCSE.id },
    { name: 'Dr. David Roberts', email: 'roberts@college.edu', empId: 'FAC-IT-001', deptId: deptIT.id },
    { name: 'Prof. Elena Rostova', email: 'elena@college.edu', empId: 'FAC-IT-002', deptId: deptIT.id },
    { name: 'Dr. Marcus Vance', email: 'marcus@college.edu', empId: 'FAC-ECE-001', deptId: deptECE.id },
    { name: 'Prof. Ananya Sharma', email: 'ananya@college.edu', empId: 'FAC-ECE-002', deptId: deptECE.id },
    { name: 'Prof. Priya Nair', email: 'priya@college.edu', empId: 'FAC-AI-001', deptId: deptAIDS.id },
    { name: 'Dr. Vikram Patel', email: 'vikram@college.edu', empId: 'FAC-MECH-001', deptId: deptMECH.id },
  ];

  const facultyRecords: any[] = [];
  for (const f of facultyData) {
    const user = await prisma.user.create({
      data: { name: f.name, email: f.email, password: hashedPassword, role: Role.FACULTY },
    });
    const fac = await prisma.faculty.create({
      data: { userId: user.id, employeeId: f.empId, departmentId: f.deptId },
      include: { department: true },
    });
    facultyRecords.push({ ...fac, user });
  }

  console.log(`Created ${facultyRecords.length} faculty members across 5 departments.`);

  // 7. Create 30 Students across different departments, classes, sections
  const studentNames = [
    { name: 'Alice Johnson', email: 'student1@college.edu', roll: 'CS2024001', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'Bob Williams', email: 'student2@college.edu', roll: 'CS2024002', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'Charlie Davis', email: 'student3@college.edu', roll: 'CS2024003', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'Diana Miller', email: 'student4@college.edu', roll: 'CS2024004', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'Edward Wilson', email: 'student5@college.edu', roll: 'CS2024005', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'Fiona Taylor', email: 'student6@college.edu', roll: 'CS2024006', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'George Clark', email: 'student7@college.edu', roll: 'CS2024007', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'Hannah White', email: 'student8@college.edu', roll: 'CS2024008', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3B.id },
    { name: 'Ian Martin', email: 'student9@college.edu', roll: 'CS2024009', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3B.id },
    { name: 'Julia Thompson', email: 'student10@college.edu', roll: 'CS2024010', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3B.id },
    { name: 'Kevin Anderson', email: 'student11@college.edu', roll: 'CS2025001', dept: deptCSE.id, cls: cseYear2.id, sec: cseSec2A.id },
    { name: 'Laura Martinez', email: 'student12@college.edu', roll: 'CS2025002', dept: deptCSE.id, cls: cseYear2.id, sec: cseSec2A.id },
    { name: 'Michael Brown', email: 'student13@college.edu', roll: 'IT2024001', dept: deptIT.id, cls: itYear3.id, sec: itSec3A.id },
    { name: 'Nina Patel', email: 'student14@college.edu', roll: 'IT2024002', dept: deptIT.id, cls: itYear3.id, sec: itSec3A.id },
    { name: 'Oliver Wright', email: 'student15@college.edu', roll: 'IT2024003', dept: deptIT.id, cls: itYear3.id, sec: itSec3B.id },
    { name: 'Paula Reed', email: 'student16@college.edu', roll: 'IT2024004', dept: deptIT.id, cls: itYear3.id, sec: itSec3B.id },
    { name: 'Quentin Ross', email: 'student17@college.edu', roll: 'EC2024001', dept: deptECE.id, cls: eceYear3.id, sec: eceSec3A.id },
    { name: 'Rachel Green', email: 'student18@college.edu', roll: 'EC2024002', dept: deptECE.id, cls: eceYear3.id, sec: eceSec3A.id },
    { name: 'Samuel Scott', email: 'student19@college.edu', roll: 'EC2024003', dept: deptECE.id, cls: eceYear3.id, sec: eceSec3A.id },
    { name: 'Tina Turner', email: 'student20@college.edu', roll: 'AI2025001', dept: deptAIDS.id, cls: aidsYear2.id, sec: aidsSec2A.id },
    { name: 'Uma Thurman', email: 'student21@college.edu', roll: 'AI2025002', dept: deptAIDS.id, cls: aidsYear2.id, sec: aidsSec2A.id },
    { name: 'Victor Hugo', email: 'student22@college.edu', roll: 'ME2024001', dept: deptMECH.id, cls: mechYear3.id, sec: mechSec3A.id },
    { name: 'Wendy Darling', email: 'student23@college.edu', roll: 'ME2024002', dept: deptMECH.id, cls: mechYear3.id, sec: mechSec3A.id },
    { name: 'Xavier Woods', email: 'student24@college.edu', roll: 'CS2024011', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3A.id },
    { name: 'Yasmine Bleeth', email: 'student25@college.edu', roll: 'CS2024012', dept: deptCSE.id, cls: cseYear3.id, sec: cseSec3B.id },
  ];

  const studentRecords: any[] = [];
  for (const s of studentNames) {
    const user = await prisma.user.create({
      data: { name: s.name, email: s.email, password: hashedPassword, role: Role.STUDENT },
    });
    const stu = await prisma.student.create({
      data: {
        userId: user.id,
        rollNumber: s.roll,
        departmentId: s.dept,
        classId: s.cls,
        sectionId: s.sec,
      },
    });
    studentRecords.push({ ...stu, user });
  }

  console.log(`Created ${studentRecords.length} students across multiple branches.`);

  // 8. Create Sessions for Different Departments & Faculties
  const sessionConfigs = [
    // Dr. Smith (CSE 3rd Year Sec A)
    { faculty: facultyRecords[0], course: cseCourses[0], section: cseSec3A },
    { faculty: facultyRecords[0], course: cseCourses[1], section: cseSec3A },
    // Prof. Jenkins (CSE 3rd Year Sec B)
    { faculty: facultyRecords[1], course: cseCourses[2], section: cseSec3B },
    { faculty: facultyRecords[1], course: cseCourses[3], section: cseSec3B },
    // Dr. Alan Turing (CSE 2nd Year Sec A)
    { faculty: facultyRecords[2], course: cseCourses[4], section: cseSec2A },
    // Dr. Roberts (IT 3rd Year Sec A)
    { faculty: facultyRecords[4], course: itCourses[0], section: itSec3A },
    // Prof. Elena (IT 3rd Year Sec B)
    { faculty: facultyRecords[5], course: itCourses[1], section: itSec3B },
    // Dr. Marcus (ECE 3rd Year Sec A)
    { faculty: facultyRecords[6], course: eceCourses[0], section: eceSec3A },
    // Prof. Priya (AI & DS 2nd Year Sec A)
    { faculty: facultyRecords[8], course: aidsCourses[0], section: aidsSec2A },
    // Dr. Vikram (MECH 3rd Year Sec A)
    { faculty: facultyRecords[9], course: mechCourses[0], section: mechSec3A },
  ];

  const createdSessions: any[] = [];
  const now = new Date();

  // Generate sessions across past 14 days
  for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
    const sessionDate = new Date(now);
    sessionDate.setDate(now.getDate() - dayOffset);
    sessionDate.setHours(9 + (dayOffset % 5), 30, 0, 0);

    const startTime = new Date(sessionDate);
    const endTime = new Date(sessionDate);
    endTime.setHours(sessionDate.getHours() + 1);

    // Pick 3-4 configs each day
    for (let cIdx = 0; cIdx < sessionConfigs.length; cIdx++) {
      if ((dayOffset + cIdx) % 2 === 0) {
        const cfg = sessionConfigs[cIdx];
        const s = await prisma.session.create({
          data: {
            facultyId: cfg.faculty.id,
            courseId: cfg.course.id,
            sectionId: cfg.section.id,
            date: sessionDate,
            startTime,
            endTime,
          },
        });
        createdSessions.push(s);
      }
    }
  }

  console.log(`Created ${createdSessions.length} sessions across all faculty and departments.`);

  // 9. Mark Attendance for All Students in their Sessions
  let totalAtt = 0;
  const absentRecordsToCorrect: any[] = [];

  for (const session of createdSessions) {
    const studentsInThisSec = studentRecords.filter(s => s.sectionId === session.sectionId);

    for (const stu of studentsInThisSec) {
      const stuIndex = studentRecords.indexOf(stu);
      let status: AttendanceStatus = AttendanceStatus.PRESENT;

      // Realistic attendance variance:
      // Some students have very high (>90%), some have medium (75-85%), some have low (<70%)
      if (stuIndex % 4 === 0) {
        // High attendance student
        status = Math.random() < 0.1 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
      } else if (stuIndex % 4 === 1) {
        // Medium attendance student
        const rand = Math.random();
        if (rand < 0.15) status = AttendanceStatus.ABSENT;
        else if (rand < 0.25) status = AttendanceStatus.LATE;
        else status = AttendanceStatus.PRESENT;
      } else if (stuIndex % 4 === 2) {
        // Low attendance student (<75% to trigger low attendance warnings)
        const rand = Math.random();
        if (rand < 0.45) status = AttendanceStatus.ABSENT;
        else if (rand < 0.6) status = AttendanceStatus.LATE;
        else status = AttendanceStatus.PRESENT;
      } else {
        // Moderate attendance
        status = Math.random() < 0.2 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
      }

      const attRecord = await prisma.attendance.create({
        data: {
          sessionId: session.id,
          studentId: stu.id,
          status,
        },
      });

      totalAtt++;
      if (status === AttendanceStatus.ABSENT && absentRecordsToCorrect.length < 5) {
        absentRecordsToCorrect.push(attRecord);
      }
    }
  }

  console.log(`Created ${totalAtt} attendance records.`);

  // 10. Create Realistic Correction Requests with Pending, Approved, and Rejected statuses
  if (absentRecordsToCorrect.length >= 3) {
    // 1. Pending Request
    await prisma.correctionRequest.create({
      data: {
        attendanceId: absentRecordsToCorrect[0].id,
        requestedStatus: AttendanceStatus.PRESENT,
        reason: 'Attended session via lab bench 4, missed roll call due to terminal setup.',
        status: RequestStatus.PENDING,
      },
    });

    // 2. Another Pending Request
    await prisma.correctionRequest.create({
      data: {
        attendanceId: absentRecordsToCorrect[1].id,
        requestedStatus: AttendanceStatus.LATE,
        reason: 'Arrived 10 minutes late due to college bus delay, submitted bus slip to faculty.',
        status: RequestStatus.PENDING,
      },
    });

    // 3. Approved Request
    const approvedReq = await prisma.correctionRequest.create({
      data: {
        attendanceId: absentRecordsToCorrect[2].id,
        requestedStatus: AttendanceStatus.PRESENT,
        reason: 'Medical certificate submitted to HOD regarding morning session absence.',
        status: RequestStatus.APPROVED,
      },
    });
    // Update the attendance record to PRESENT
    await prisma.attendance.update({
      where: { id: absentRecordsToCorrect[2].id },
      data: { status: AttendanceStatus.PRESENT },
    });

    console.log('Created sample correction requests (PENDING and APPROVED).');
  }

  console.log('🎉 Comprehensive database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
