import { useState } from 'react';
import { AppProvider, useAppContext, Student, Teacher } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<(Student | Teacher) & { role: 'student' | 'teacher' } | null>(null);

  const handleLogin = (role: 'teacher' | 'student', user: Student | Teacher) => {
    setCurrentUser({ ...user, role });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'teacher') {
    const teacher = currentUser as Teacher;
    return (
      <TeacherDashboard
        teacherId={teacher.id}
        userName={teacher.name}
        branches={teacher.branches}
        onLogout={handleLogout}
      />
    );
  }

  const student = currentUser as Student;
  return (
    <StudentDashboard
      userName={student.name}
      studentId={student.id}
      branch={student.branch}
      section={student.section}
      onLogout={handleLogout}
    />
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
