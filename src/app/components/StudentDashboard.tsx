import { useState } from 'react';
import { CheckCircle, FileText, Award, LogOut, BookOpen } from 'lucide-react';
import { AttendanceMark } from './student/AttendanceMark';
import { AssignmentSubmit } from './student/AssignmentSubmit';
import { MarksView } from './student/MarksView';

interface StudentDashboardProps {
  userName: string;
  studentId: number;
  branch: string;
  section: string;
  onLogout: () => void;
}

export function StudentDashboard({ userName, studentId, branch, section, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments' | 'marks'>('attendance');

  const tabs = [
    { id: 'attendance' as const, label: 'Attendance', icon: CheckCircle },
    { id: 'assignments' as const, label: 'Assignments', icon: FileText },
    { id: 'marks' as const, label: 'Marks', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <header className="bg-white shadow-md border-b-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                <BookOpen className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Student Portal
                </h1>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  {userName} • {branch}-{section}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100">
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <nav className="flex space-x-1 p-3">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'attendance' && <AttendanceMark studentId={studentId} branch={branch} section={section} />}
            {activeTab === 'assignments' && <AssignmentSubmit studentId={studentId} branch={branch} section={section} />}
            {activeTab === 'marks' && <MarksView studentId={studentId} branch={branch} section={section} />}
          </div>
        </div>
      </div>
    </div>
  );
}
