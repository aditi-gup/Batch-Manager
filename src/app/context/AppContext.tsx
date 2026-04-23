import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Student {
  id: number;
  name: string;
  email: string;
  password: string;
  rollNumber: string;
  branch: string;
  section: string;
  batch: string;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  password: string;
  branches: string[];
  department: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  ipAddress: string;
  deviceId: string;
  proxyWarning?: boolean;
  branch: string;
  section: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  branch: string;
  section: string;
  subject: string;
}

export interface Submission {
  assignmentId: number;
  studentId: number;
  status: 'not_submitted' | 'submitted_file' | 'submitted_manual';
  fileName?: string;
  submittedAt?: string;
}

export interface Mark {
  id: number;
  studentId: number;
  assessment: string;
  marks: number | null;
  totalMarks: number;
  branch: string;
  section: string;
  subject: string;
  isFrozen: boolean;
}

export interface Query {
  id: number;
  studentId: number;
  markId: number;
  queryText: string;
  response?: string;
  status: 'open' | 'closed';
  createdAt: string;
}

interface AppContextType {
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  submissions: Submission[];
  marks: Mark[];
  queries: Query[];
  registerStudent: (student: Omit<Student, 'id'>) => void;
  registerTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  loginStudent: (email: string, password: string) => Student | null;
  loginTeacher: (email: string, password: string) => Teacher | null;
  markAttendance: (studentId: number, branch: string, section: string) => void;
  approveAttendance: (recordId: number) => void;
  denyAttendance: (recordId: number) => void;
  cancelAttendance: (recordId: number) => void;
  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  submitAssignment: (assignmentId: number, studentId: number, fileName: string) => void;
  markAsSubmittedManual: (assignmentId: number, studentId: number) => void;
  updateMark: (markId: number, marks: number | null) => void;
  freezeAssessment: (assessment: string, branch: string, section: string) => void;
  unfreezeAssessment: (assessment: string, branch: string, section: string) => void;
  createQuery: (query: Omit<Query, 'id' | 'createdAt'>) => void;
  respondToQuery: (queryId: number, response: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('batchManagerData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStudents(data.students || []);
      setTeachers(data.teachers || []);
      setAttendanceRecords(data.attendanceRecords || []);
      setAssignments(data.assignments || []);
      setSubmissions(data.submissions || []);
      setMarks(data.marks || []);
      setQueries(data.queries || []);
    } else {
      // Initialize with default data
      initializeDefaultData();
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data = {
      students,
      teachers,
      attendanceRecords,
      assignments,
      submissions,
      marks,
      queries,
    };
    localStorage.setItem('batchManagerData', JSON.stringify(data));
  }, [students, teachers, attendanceRecords, assignments, submissions, marks, queries]);

  const initializeDefaultData = () => {
    // Generate students for IT1 and IT2
    const generatedStudents = generateStudents();
    setStudents(generatedStudents);

    // Add default teacher
    const defaultTeacher: Teacher = {
      id: 1,
      name: 'Prof. Praveen',
      email: 'praveen@igdtuw.ac.in',
      password: 'teacher123',
      branches: ['IT-1', 'IT-2'],
      department: 'Information Technology',
    };
    setTeachers([defaultTeacher]);

    // Generate attendance records for last 15 classes
    const generatedAttendance = generateAttendanceHistory(generatedStudents);
    setAttendanceRecords(generatedAttendance);

    // Generate initial assignments
    const initialAssignments = generateInitialAssignments();
    setAssignments(initialAssignments);

    // Generate initial submissions
    const initialSubmissions = generateInitialSubmissions(generatedStudents, initialAssignments);
    setSubmissions(initialSubmissions);

    // Generate initial marks
    const initialMarks = generateInitialMarks(generatedStudents);
    setMarks(initialMarks);
  };

  const registerStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
    };
    setStudents([...students, newStudent]);

    // Create initial submissions for existing assignments
    const studentAssignments = assignments.filter(
      a => a.branch === student.branch && a.section === student.section
    );
    const newSubmissions = studentAssignments.map(assignment => ({
      assignmentId: assignment.id,
      studentId: newStudent.id,
      status: 'not_submitted' as const,
    }));
    setSubmissions([...submissions, ...newSubmissions]);

    // Create initial marks
    const assessments = [
      { name: 'Mid-term Exam', total: 100, subject: 'Data Structures', frozen: false },
      { name: 'Quiz 1', total: 20, subject: 'Data Structures', frozen: false },
      { name: 'Assignment 1', total: 50, subject: 'Web Development', frozen: false },
    ];

    const newMarks = assessments.map((assessment, index) => ({
      id: marks.length > 0 ? Math.max(...marks.map(m => m.id)) + index + 1 : index + 1,
      studentId: newStudent.id,
      assessment: assessment.name,
      marks: null,
      totalMarks: assessment.total,
      branch: student.branch,
      section: student.section,
      subject: assessment.subject,
      isFrozen: assessment.frozen,
    }));
    setMarks([...marks, ...newMarks]);
  };

  const registerTeacher = (teacher: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1,
    };
    setTeachers([...teachers, newTeacher]);
  };

  const loginStudent = (email: string, password: string): Student | null => {
    const student = students.find(s => s.email === email && s.password === password);
    return student || null;
  };

  const loginTeacher = (email: string, password: string): Teacher | null => {
    const teacher = teachers.find(t => t.email === email && t.password === password);
    return teacher || null;
  };

  const markAttendance = (studentId: number, branch: string, section: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = attendanceRecords.find(
      r => r.studentId === studentId && r.date === today
    );

    if (existingRecord) {
      alert('You have already marked attendance today!');
      return;
    }

    // Check for proxy - same IP/device at similar time
    const recentRecords = attendanceRecords.filter(r => r.date === today);
    const ipAddress = `192.168.1.${Math.floor(Math.random() * 255)}`;
    const deviceId = `device-${Math.random().toString(36).substring(7)}`;

    const proxyWarning = recentRecords.some(
      r => (r.ipAddress === ipAddress || r.deviceId === deviceId) && r.studentId !== studentId
    );

    const newRecord: AttendanceRecord = {
      id: attendanceRecords.length > 0 ? Math.max(...attendanceRecords.map(r => r.id)) + 1 : 1,
      studentId,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      ipAddress,
      deviceId,
      proxyWarning,
      branch,
      section,
    };

    setAttendanceRecords([newRecord, ...attendanceRecords]);
  };

  const approveAttendance = (recordId: number) => {
    setAttendanceRecords(attendanceRecords.map(r =>
      r.id === recordId ? { ...r, status: 'approved' as const } : r
    ));
  };

  const denyAttendance = (recordId: number) => {
    setAttendanceRecords(attendanceRecords.map(r =>
      r.id === recordId ? { ...r, status: 'denied' as const } : r
    ));
  };

  const cancelAttendance = (recordId: number) => {
    setAttendanceRecords(attendanceRecords.map(r =>
      r.id === recordId ? { ...r, status: 'cancelled' as const } : r
    ));
  };

  const createAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments([...assignments, newAssignment]);

    // Create submissions for all students in the branch
    const branchStudents = students.filter(
      s => s.branch === assignment.branch && s.section === assignment.section
    );
    const newSubmissions = branchStudents.map(student => ({
      assignmentId: newAssignment.id,
      studentId: student.id,
      status: 'not_submitted' as const,
    }));
    setSubmissions([...submissions, ...newSubmissions]);
  };

  const submitAssignment = (assignmentId: number, studentId: number, fileName: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const now = new Date();
    const deadline = new Date(assignment.deadline);

    if (now > deadline) {
      alert('Cannot submit after deadline!');
      return;
    }

    setSubmissions(submissions.map(s =>
      s.assignmentId === assignmentId && s.studentId === studentId
        ? { ...s, status: 'submitted_file' as const, fileName, submittedAt: now.toISOString() }
        : s
    ));
  };

  const markAsSubmittedManual = (assignmentId: number, studentId: number) => {
    setSubmissions(submissions.map(s =>
      s.assignmentId === assignmentId && s.studentId === studentId
        ? { ...s, status: 'submitted_manual' as const, submittedAt: new Date().toISOString() }
        : s
    ));
  };

  const updateMark = (markId: number, newMarks: number | null) => {
    setMarks(marks.map(m => m.id === markId ? { ...m, marks: newMarks } : m));
  };

  const freezeAssessment = (assessment: string, branch: string, section: string) => {
    setMarks(marks.map(m =>
      m.assessment === assessment && m.branch === branch && m.section === section
        ? { ...m, isFrozen: true }
        : m
    ));
  };

  const unfreezeAssessment = (assessment: string, branch: string, section: string) => {
    setMarks(marks.map(m =>
      m.assessment === assessment && m.branch === branch && m.section === section
        ? { ...m, isFrozen: false }
        : m
    ));
  };

  const createQuery = (query: Omit<Query, 'id' | 'createdAt'>) => {
    const newQuery: Query = {
      ...query,
      id: queries.length > 0 ? Math.max(...queries.map(q => q.id)) + 1 : 1,
      createdAt: new Date().toISOString(),
    };
    setQueries([...queries, newQuery]);
  };

  const respondToQuery = (queryId: number, response: string) => {
    setQueries(queries.map(q =>
      q.id === queryId ? { ...q, response, status: 'closed' as const } : q
    ));
  };

  return (
    <AppContext.Provider
      value={{
        students,
        teachers,
        attendanceRecords,
        assignments,
        submissions,
        marks,
        queries,
        registerStudent,
        registerTeacher,
        loginStudent,
        loginTeacher,
        markAttendance,
        approveAttendance,
        denyAttendance,
        cancelAttendance,
        createAssignment,
        submitAssignment,
        markAsSubmittedManual,
        updateMark,
        freezeAssessment,
        unfreezeAssessment,
        createQuery,
        respondToQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Helper functions to generate initial data
function generateStudents(): Student[] {
  const students: Student[] = [];
  const firstNames = [
    'Aadhya', 'Aanya', 'Ananya', 'Anushka', 'Diya', 'Isha', 'Jiya', 'Kavya', 'Khushi', 'Myra',
    'Navya', 'Pari', 'Prisha', 'Saanvi', 'Sara', 'Shanaya', 'Siya', 'Tara', 'Vanya', 'Zara',
    'Aditi', 'Aisha', 'Anjali', 'Avni', 'Divya', 'Kiara', 'Mira', 'Neha', 'Riya', 'Shreya',
    'Simran', 'Tanvi', 'Trisha', 'Vidya', 'Zoya', 'Anika', 'Ishita', 'Mehak', 'Naina', 'Palak',
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Kumar', 'Singh', 'Gupta', 'Patel', 'Reddy', 'Rao', 'Desai', 'Joshi',
    'Agarwal', 'Mehta', 'Chopra', 'Malhotra', 'Kapoor', 'Bhat', 'Nair', 'Iyer', 'Menon', 'Pillai',
  ];

  let id = 1;

  // IT-1: 60 students
  for (let i = 1; i <= 60; i++) {
    const rollNumber = String(i).padStart(3, '0');
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    students.push({
      id: id++,
      name: `${firstName} ${lastName}`,
      email: `${rollNumber}btit24@igdtuw.ac.in`,
      password: 'student123',
      rollNumber,
      branch: 'IT',
      section: '1',
      batch: '2024',
    });
  }

  // IT-2: 55 students
  for (let i = 1; i <= 55; i++) {
    const rollNumber = String(i).padStart(3, '0');
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    students.push({
      id: id++,
      name: `${firstName} ${lastName}`,
      email: `${rollNumber}btit24sec2@igdtuw.ac.in`,
      password: 'student123',
      rollNumber,
      branch: 'IT',
      section: '2',
      batch: '2024',
    });
  }

  return students;
}

function generateAttendanceHistory(students: Student[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let id = 1;

  // Generate attendance for last 15 class days
  for (let dayOffset = 15; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    students.forEach(student => {
      // 80% attendance rate
      if (Math.random() < 0.8) {
        const hour = 9 + Math.floor(Math.random() * 2);
        const minute = Math.floor(Math.random() * 60);

        records.push({
          id: id++,
          studentId: student.id,
          date: dateStr,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          status: dayOffset === 0 ? 'pending' : 'approved',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          deviceId: `device-${Math.random().toString(36).substring(7)}`,
          proxyWarning: Math.random() < 0.05,
          branch: student.branch,
          section: student.section,
        });
      }
    });
  }

  return records;
}

function generateInitialAssignments(): Assignment[] {
  return [
    {
      id: 1,
      title: 'Binary Search Tree Implementation',
      description: 'Implement a balanced BST with insert, delete, and search operations.',
      deadline: '2026-04-30T23:59',
      createdAt: '2026-04-15',
      branch: 'IT',
      section: '1',
      subject: 'Data Structures',
    },
    {
      id: 2,
      title: 'Full Stack CRUD Application',
      description: 'Build a complete CRUD application using React and Node.js.',
      deadline: '2026-05-05T23:59',
      createdAt: '2026-04-18',
      branch: 'IT',
      section: '1',
      subject: 'Web Development',
    },
    {
      id: 3,
      title: 'Binary Search Tree Implementation',
      description: 'Implement a balanced BST with insert, delete, and search operations.',
      deadline: '2026-04-30T23:59',
      createdAt: '2026-04-15',
      branch: 'IT',
      section: '2',
      subject: 'Data Structures',
    },
    {
      id: 4,
      title: 'Full Stack CRUD Application',
      description: 'Build a complete CRUD application using React and Node.js.',
      deadline: '2026-05-05T23:59',
      createdAt: '2026-04-18',
      branch: 'IT',
      section: '2',
      subject: 'Web Development',
    },
  ];
}

function generateInitialSubmissions(students: Student[], assignments: Assignment[]): Submission[] {
  const submissions: Submission[] = [];

  students.forEach(student => {
    const studentAssignments = assignments.filter(
      a => a.branch === student.branch && a.section === student.section
    );

    studentAssignments.forEach(assignment => {
      const random = Math.random();
      if (random < 0.5) {
        submissions.push({
          assignmentId: assignment.id,
          studentId: student.id,
          status: 'submitted_file',
          fileName: `assignment_${student.rollNumber}.pdf`,
          submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        submissions.push({
          assignmentId: assignment.id,
          studentId: student.id,
          status: 'not_submitted',
        });
      }
    });
  });

  return submissions;
}

function generateInitialMarks(students: Student[]): Mark[] {
  const marks: Mark[] = [];
  let id = 1;

  const assessments = [
    { name: 'Mid-term Exam', total: 100, subject: 'Data Structures', frozen: true },
    { name: 'Quiz 1', total: 20, subject: 'Data Structures', frozen: true },
    { name: 'Quiz 2', total: 20, subject: 'Data Structures', frozen: false },
    { name: 'Assignment 1', total: 50, subject: 'Web Development', frozen: false },
  ];

  students.forEach(student => {
    assessments.forEach(assessment => {
      const markValue = assessment.frozen
        ? Math.floor(Math.random() * 40) + 50
        : Math.random() < 0.3 ? null : Math.floor(Math.random() * 40) + 50;

      marks.push({
        id: id++,
        studentId: student.id,
        assessment: assessment.name,
        marks: markValue,
        totalMarks: assessment.total,
        branch: student.branch,
        section: student.section,
        subject: assessment.subject,
        isFrozen: assessment.frozen,
      });
    });
  });

  return marks;
}
