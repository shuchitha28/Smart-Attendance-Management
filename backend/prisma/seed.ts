import { PrismaClient, Role, AttendanceStatus, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// First & Last Name pools for generating realistic 5000+ student & 200 faculty names
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Edward', 'Stephanie',
  'Rajesh', 'Ananya', 'Vikram', 'Priya', 'Rahul', 'Sneha', 'Amit', 'Pooja', 'Rohan', 'Neha',
  'Suresh', 'Kavita', 'Arjun', 'Divya', 'Sanjay', 'Ritu', 'Deepak', 'Swati', 'Manish', 'Tanya',
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arnav', 'Sai', 'Reyansh', 'Ishaan', 'Shaurya', 'Aharvan',
  'Ananya', 'Diya', 'Saanvi', 'Isha', 'Aadhya', 'Kavya', 'Pari', 'Aanya', 'Myra', 'Anika'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Patel', 'Sharma', 'Verma', 'Singh', 'Kumar', 'Rao', 'Joshi', 'Kulkarni', 'Nair', 'Reddy',
  'Gupta', 'Mehta', 'Chowdhury', 'Deshmukh', 'Bhat', 'Shetty', 'Menon', 'Pillai', 'Mukherjee', 'Banerjee'
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🚀 Starting large-scale database seeding (5,000+ Students, 200 Faculty, Multiple Batches & Courses)...');
  const startTime = Date.now();

  // 1. Clean existing records in dependency order
  console.log('🧹 Clearing existing database tables...');
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

  console.log('🔒 Pre-hashing default password...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const now = new Date();

  // 2. Create Departments (8 Departments)
  console.log('🏫 Creating Departments...');
  const deptData = [
    { name: 'Computer Science & Engineering', code: 'CSE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Artificial Intelligence & Data Science', code: 'AIDS' },
    { name: 'Electronics & Communication Engineering', code: 'ECE' },
    { name: 'Electrical & Electronics Engineering', code: 'EEE' },
    { name: 'Mechanical Engineering', code: 'MECH' },
    { name: 'Civil Engineering', code: 'CIVIL' },
    { name: 'Cyber Security & Forensics', code: 'CYBER' },
  ];

  const departments: any[] = [];
  for (const d of deptData) {
    const dept = await prisma.department.create({
      data: { id: randomUUID(), name: d.name, code: d.code }
    });
    departments.push(dept);
  }

  // 3. Create Classes (Batches: 2021, 2022, 2023, 2024, 2025) & Sections (A, B, C)
  console.log('📚 Creating Batch Years (Classes) and Sections...');
  const BATCH_YEARS = [
    { yearName: '4th Year (Batch 2022)', codePrefix: '2022' },
    { yearName: '3rd Year (Batch 2023)', codePrefix: '2023' },
    { yearName: '2nd Year (Batch 2024)', codePrefix: '2024' },
    { yearName: '1st Year (Batch 2025)', codePrefix: '2025' },
    { yearName: 'M.Tech / PG (Batch 2021)', codePrefix: '2021' },
  ];

  const sectionsList: Array<{ id: string; name: string; classId: string; departmentId: string; batchCode: string }> = [];

  for (const dept of departments) {
    for (const batch of BATCH_YEARS) {
      const cls = await prisma.class.create({
        data: {
          id: randomUUID(),
          name: `${dept.code} - ${batch.yearName}`,
          departmentId: dept.id,
        }
      });

      for (const secLetter of ['Section A', 'Section B', 'Section C']) {
        const sec = await prisma.section.create({
          data: {
            id: randomUUID(),
            name: secLetter,
            classId: cls.id,
          }
        });
        sectionsList.push({
          id: sec.id,
          name: secLetter,
          classId: cls.id,
          departmentId: dept.id,
          batchCode: batch.codePrefix,
        });
      }
    }
  }

  console.log(`Created ${departments.length} departments and ${sectionsList.length} total sections.`);

  // 4. Create Courses (5-6 courses per department)
  console.log('📖 Creating Courses across departments...');
  const courseTemplates: Record<string, Array<{ name: string; code: string }>> = {
    CSE: [
      { name: 'Data Structures & Algorithms', code: 'CS301' },
      { name: 'Database Management Systems', code: 'CS302' },
      { name: 'Full-Stack Web Development', code: 'CS303' },
      { name: 'Operating Systems Architecture', code: 'CS304' },
      { name: 'Computer Networks', code: 'CS305' },
    ],
    IT: [
      { name: 'Cloud Computing & DevOps', code: 'IT301' },
      { name: 'Cybersecurity & Cryptography', code: 'IT302' },
      { name: 'Software Engineering & Agile', code: 'IT303' },
      { name: 'Distributed Systems', code: 'IT304' },
      { name: 'Mobile App Development', code: 'IT305' },
    ],
    AIDS: [
      { name: 'Machine Learning & Neural Networks', code: 'AI301' },
      { name: 'Deep Learning & Computer Vision', code: 'AI302' },
      { name: 'Big Data Analytics', code: 'AI303' },
      { name: 'Natural Language Processing', code: 'AI304' },
      { name: 'Pattern Recognition', code: 'AI305' },
    ],
    ECE: [
      { name: 'Digital Signal Processing', code: 'EC301' },
      { name: 'Microcontrollers & Embedded Systems', code: 'EC302' },
      { name: 'VLSI Circuit Design', code: 'EC303' },
      { name: 'Wireless Communication Systems', code: 'EC304' },
      { name: 'Antenna & Wave Propagation', code: 'EC305' },
    ],
    EEE: [
      { name: 'Power Electronics & Drives', code: 'EE301' },
      { name: 'Control Systems Engineering', code: 'EE302' },
      { name: 'Electrical Machines II', code: 'EE303' },
      { name: 'Renewable Energy Systems', code: 'EE304' },
      { name: 'High Voltage Engineering', code: 'EE305' },
    ],
    MECH: [
      { name: 'Thermodynamics & Heat Transfer', code: 'ME301' },
      { name: 'Robotics & Industrial Automation', code: 'ME302' },
      { name: 'Fluid Mechanics & Machinery', code: 'ME303' },
      { name: 'CAD/CAM & Finite Element Analysis', code: 'ME304' },
      { name: 'Manufacturing Processes', code: 'ME305' },
    ],
    CIVIL: [
      { name: 'Structural Analysis & Design', code: 'CV301' },
      { name: 'Geotechnical & Soil Engineering', code: 'CV302' },
      { name: 'Transportation Engineering', code: 'CV303' },
      { name: 'Environmental Engineering', code: 'CV304' },
      { name: 'Surveying & Remote Sensing', code: 'CV305' },
    ],
    CYBER: [
      { name: 'Ethical Hacking & Penetration Testing', code: 'CB301' },
      { name: 'Digital Forensics & Incident Response', code: 'CB302' },
      { name: 'Network Security Architecture', code: 'CB303' },
      { name: 'Malware Analysis & Reverse Engineering', code: 'CB304' },
      { name: 'Information Security & Compliance', code: 'CB305' },
    ],
  };

  const coursesList: Array<{ id: string; name: string; code: string; departmentId: string }> = [];
  for (const dept of departments) {
    const templates = courseTemplates[dept.code] || [];
    for (const t of templates) {
      const course = await prisma.course.create({
        data: { id: randomUUID(), name: t.name, code: t.code, departmentId: dept.id }
      });
      coursesList.push(course);
    }
  }

  // 5. Create System Admin (with fallback demo login)
  console.log('👑 Creating Admin user...');
  await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Dr. Alexander Vance (Dean/Admin)',
      email: 'admin@college.edu',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // 6. Create ~200 Faculty Members
  console.log('👩‍🏫 Generating 200 Faculty accounts across all 8 departments...');
  const facultyCount = 200;
  const facultyUsers: any[] = [];
  const facultyProfiles: any[] = [];

  // Guarantee demo faculty user 'smith@college.edu'
  const demoFacultyUserId = randomUUID();
  const demoFacultyId = randomUUID();
  const cseDept = departments.find(d => d.code === 'CSE') || departments[0];

  facultyUsers.push({
    id: demoFacultyUserId,
    name: 'Dr. John Smith',
    email: 'smith@college.edu',
    password: hashedPassword,
    role: Role.FACULTY,
    createdAt: now,
    updatedAt: now,
  });

  facultyProfiles.push({
    id: demoFacultyId,
    userId: demoFacultyUserId,
    employeeId: 'FAC-CSE-001',
    departmentId: cseDept.id,
  });

  // Generate remaining 199 faculty members
  for (let i = 2; i <= facultyCount; i++) {
    const fUserId = randomUUID();
    const fId = randomUUID();
    const dept = departments[(i - 1) % departments.length];
    const prefix = i % 2 === 0 ? 'Dr.' : 'Prof.';
    const name = `${prefix} ${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
    const email = `faculty${i}@college.edu`;
    const empId = `FAC-${dept.code}-${String(i).padStart(3, '0')}`;

    facultyUsers.push({
      id: fUserId,
      name,
      email,
      password: hashedPassword,
      role: Role.FACULTY,
      createdAt: now,
      updatedAt: now,
    });

    facultyProfiles.push({
      id: fId,
      userId: fUserId,
      employeeId: empId,
      departmentId: dept.id,
    });
  }

  // Bulk insert faculty users & profiles
  await prisma.user.createMany({ data: facultyUsers });
  await prisma.faculty.createMany({ data: facultyProfiles });
  console.log(`✅ Successfully seeded ${facultyProfiles.length} Faculty members.`);

  // 7. Create ~5,000 Students
  console.log('👨‍🎓 Generating 5,000 Student accounts across all batches and sections...');
  const totalTargetStudents = 5000;
  const studentUsers: any[] = [];
  const studentProfiles: Array<{
    id: string;
    userId: string;
    rollNumber: string;
    departmentId: string;
    classId: string;
    sectionId: string;
  }> = [];

  // Guarantee demo student user 'student1@college.edu'
  const demoStudentUserId = randomUUID();
  const demoStudentId = randomUUID();
  const demoSection = sectionsList[0];

  studentUsers.push({
    id: demoStudentUserId,
    name: 'Alice Johnson',
    email: 'student1@college.edu',
    password: hashedPassword,
    role: Role.STUDENT,
    createdAt: now,
    updatedAt: now,
  });

  studentProfiles.push({
    id: demoStudentId,
    userId: demoStudentUserId,
    rollNumber: 'CS2023001',
    departmentId: demoSection.departmentId,
    classId: demoSection.classId,
    sectionId: demoSection.id,
  });

  // Generate remaining 4,999 students distributed across all sections
  for (let i = 2; i <= totalTargetStudents; i++) {
    const sUserId = randomUUID();
    const sId = randomUUID();
    const sec = sectionsList[(i - 1) % sectionsList.length];
    const dept = departments.find(d => d.id === sec.departmentId) || departments[0];

    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `student${i}@college.edu`;
    const rollNumber = `${dept.code}${sec.batchCode}${String(i).padStart(4, '0')}`;

    studentUsers.push({
      id: sUserId,
      name,
      email,
      password: hashedPassword,
      role: Role.STUDENT,
      createdAt: now,
      updatedAt: now,
    });

    studentProfiles.push({
      id: sId,
      userId: sUserId,
      rollNumber,
      departmentId: sec.departmentId,
      classId: sec.classId,
      sectionId: sec.id,
    });

    // Chunked insertion every 1,000 items for memory efficiency & fast database execution
    if (studentUsers.length >= 1000) {
      await prisma.user.createMany({ data: studentUsers });
      await prisma.student.createMany({ data: studentProfiles });
      console.log(`   ...seeded ${studentProfiles.length} students...`);
      studentUsers.length = 0;
      studentProfiles.length = 0;
    }
  }

  // Insert remaining chunk
  if (studentUsers.length > 0) {
    await prisma.user.createMany({ data: studentUsers });
    await prisma.student.createMany({ data: studentProfiles });
  }

  console.log(`✅ Successfully seeded 5,000 Students across ${sectionsList.length} sections!`);

  // 8. Generate Realistic Attendance Sessions & Attendance Records
  console.log('📅 Generating Realistic Sessions & Attendance Records...');
  
  // Retrieve subset of faculty & students for creating realistic attendance sessions
  const dbFaculty = await prisma.faculty.findMany({ select: { id: true, departmentId: true } });
  const dbStudents = await prisma.student.findMany({ select: { id: true, sectionId: true, departmentId: true } });

  const sessionsToCreate: any[] = [];
  const attendanceToCreate: any[] = [];
  const absentAttendanceForCorrections: any[] = [];

  // Generate sessions across past 20 days
  for (let dayOffset = 20; dayOffset >= 0; dayOffset--) {
    const sessionDate = new Date(now);
    sessionDate.setDate(now.getDate() - dayOffset);
    sessionDate.setHours(9 + (dayOffset % 5), 0, 0, 0);

    const startTime = new Date(sessionDate);
    const endTime = new Date(sessionDate);
    endTime.setHours(sessionDate.getHours() + 1);

    // Pick 15 random sections each day
    for (let sIdx = 0; sIdx < 15; sIdx++) {
      const sec = sectionsList[(dayOffset * 15 + sIdx) % sectionsList.length];
      const deptCourses = coursesList.filter(c => c.departmentId === sec.departmentId);
      const course = deptCourses.length > 0 ? getRandomItem(deptCourses) : coursesList[0];
      const deptFaculty = dbFaculty.filter(f => f.departmentId === sec.departmentId);
      const fac = deptFaculty.length > 0 ? getRandomItem(deptFaculty) : dbFaculty[0];

      const sessionId = randomUUID();
      sessionsToCreate.push({
        id: sessionId,
        facultyId: fac.id,
        courseId: course.id,
        sectionId: sec.id,
        date: sessionDate,
        startTime,
        endTime,
        isActive: dayOffset === 0 && sIdx === 0, // 1 active live session for today
        attendanceCode: dayOffset === 0 && sIdx === 0 ? '784920' : null,
      });

      // Mark attendance for all students in this section
      const secStudents = dbStudents.filter(s => s.sectionId === sec.id);

      for (const stu of secStudents) {
        // Vary student attendance pattern (creates high risk, warning, and safe attendance tiers for Early Warning Analytics)
        const charCodeSum = stu.id.charCodeAt(0) + stu.id.charCodeAt(1);
        let status: AttendanceStatus = AttendanceStatus.PRESENT;

        if (charCodeSum % 10 < 2) {
          // Low attendance student (<60% to trigger Early Warning High Risk)
          const rand = Math.random();
          if (rand < 0.55) status = AttendanceStatus.ABSENT;
          else if (rand < 0.70) status = AttendanceStatus.LATE;
          else status = AttendanceStatus.PRESENT;
        } else if (charCodeSum % 10 < 4) {
          // Moderate attendance student (60-74% to trigger Watchlist)
          const rand = Math.random();
          if (rand < 0.32) status = AttendanceStatus.ABSENT;
          else if (rand < 0.45) status = AttendanceStatus.LATE;
          else status = AttendanceStatus.PRESENT;
        } else {
          // Normal/Safe student (>75% attendance)
          const rand = Math.random();
          if (rand < 0.08) status = AttendanceStatus.ABSENT;
          else if (rand < 0.14) status = AttendanceStatus.LATE;
          else status = AttendanceStatus.PRESENT;
        }

        const attId = randomUUID();
        attendanceToCreate.push({
          id: attId,
          sessionId,
          studentId: stu.id,
          status,
        });

        if (status === AttendanceStatus.ABSENT && absentAttendanceForCorrections.length < 15) {
          absentAttendanceForCorrections.push({ id: attId, studentId: stu.id });
        }
      }
    }
  }

  // Insert sessions and attendance in bulk chunks
  console.log(`   ...inserting ${sessionsToCreate.length} sessions...`);
  await prisma.session.createMany({ data: sessionsToCreate });

  console.log(`   ...inserting ${attendanceToCreate.length} attendance records...`);
  for (let i = 0; i < attendanceToCreate.length; i += 2000) {
    const chunk = attendanceToCreate.slice(i, i + 2000);
    await prisma.attendance.createMany({ data: chunk });
  }

  console.log(`✅ Successfully created ${sessionsToCreate.length} Sessions and ${attendanceToCreate.length} Attendance Records.`);

  // 9. Create Attendance Correction Requests
  console.log('📝 Creating sample Attendance Correction Requests...');
  const correctionData: any[] = [];
  const sampleReasons = [
    'Attended class in person but phone battery was dead during live code entry.',
    'Arrived 10 minutes late due to college bus transportation delay.',
    'Submitted medical slip to HOD for morning session absence.',
    'Lab system workstation login issue caused delay in marking attendance code.',
    'Marked absent due to network disconnect on campus Wi-Fi.',
  ];

  for (let i = 0; i < absentAttendanceForCorrections.length; i++) {
    const rec = absentAttendanceForCorrections[i];
    const reqStatus = i % 3 === 0 ? RequestStatus.PENDING : i % 3 === 1 ? RequestStatus.APPROVED : RequestStatus.REJECTED;

    correctionData.push({
      id: randomUUID(),
      attendanceId: rec.id,
      requestedStatus: i % 2 === 0 ? AttendanceStatus.PRESENT : AttendanceStatus.LATE,
      reason: sampleReasons[i % sampleReasons.length],
      status: reqStatus,
      createdAt: now,
    });
  }

  await prisma.correctionRequest.createMany({ data: correctionData });
  console.log(`✅ Created ${correctionData.length} Correction Requests (PENDING, APPROVED, REJECTED).`);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 SEEDING COMPLETE in ${durationSec}s!`);
  console.log('📊 Summary:');
  console.log(`   - 8 Departments`);
  console.log(`   - 40 Courses`);
  console.log(`   - 40 Classes (Batch Years 2021-2025)`);
  console.log(`   - ${sectionsList.length} Sections`);
  console.log(`   - 200 Faculty Members`);
  console.log(`   - 5,000 Students`);
  console.log(`   - ${sessionsToCreate.length} Sessions`);
  console.log(`   - ${attendanceToCreate.length} Attendance Records`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
