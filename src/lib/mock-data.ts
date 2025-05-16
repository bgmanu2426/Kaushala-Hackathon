import type { Student, ClassRecord, AttendanceEntry, User } from '@/types';

interface MockFaculty extends User {
  password?: string; 
}

export const MOCK_FACULTY: MockFaculty[] = [
  { id: 'faculty1', email: 'prof.smart@example.com', name: 'Prof. Smart', password: 'password123' },
];

export const MOCK_CLASSES: ClassRecord[] = [
  { id: 'class1', name: 'Computer Science 101', facultyId: 'faculty1' },
  { id: 'class2', name: 'Mathematics 202', facultyId: 'faculty1' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 'student1', name: 'Alice Johnson', classId: 'class1' },
  { id: 'student2', name: 'Bob Williams', classId: 'class1' },
  { id: 'student3', name: 'Charlie Brown', classId: 'class1' },
  { id: 'student4', name: 'Diana Prince', classId: 'class2' },
  { id: 'student5', name: 'Edward Nigma', classId: 'class2' },
];

// Function to get students by classId
export const getStudentsByClassId = (classId: string): Student[] => {
  return MOCK_STUDENTS.filter(student => student.classId === classId);
};


const LATEST_ATTENDANCE_KEY = 'attendvisor_latest_attendance';

// Generates more diverse mock attendance data
const generateMockAttendance = (): AttendanceEntry[] => {
  const attendance: AttendanceEntry[] = [];
  const today = new Date();
  const dates: string[] = [];
  for (let i = 20; i >= 0; i--) { // Generate data for the last 21 days (3 weeks)
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
       dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  let entryId = 0;
  MOCK_CLASSES.forEach(cls => {
    const classStudents = getStudentsByClassId(cls.id);
    dates.forEach(date => {
      classStudents.forEach(student => {
        // Simulate varying attendance patterns
        let status: 'Present' | 'Absent' = 'Present';
        const randomFactor = Math.random();
        if (student.id === 'student2' && randomFactor < 0.4) status = 'Absent'; // Bob is more likely to be absent
        else if (randomFactor < 0.15) status = 'Absent'; // General small chance of absence

        // Make some students more consistent
        if (student.id === 'student1' && randomFactor < 0.9) status = 'Present'; // Alice mostly present

        attendance.push({
          id: `att${entryId++}`,
          date,
          classId: cls.id,
          studentId: student.id,
          status,
          facultyId: cls.facultyId,
        });
      });
    });
  });
  return attendance;
};


export const getMockAttendance = (): AttendanceEntry[] => {
  if (typeof window !== 'undefined') {
    const storedAttendance = localStorage.getItem(LATEST_ATTENDANCE_KEY);
    if (storedAttendance) {
      return JSON.parse(storedAttendance);
    }
    const initialAttendance = generateMockAttendance();
    localStorage.setItem(LATEST_ATTENDANCE_KEY, JSON.stringify(initialAttendance));
    return initialAttendance;
  }
  return generateMockAttendance(); // For server-side or non-browser contexts if any
};

export const saveMockAttendance = (newEntries: AttendanceEntry[]) => {
  if (typeof window !== 'undefined') {
    const existingEntries = getMockAttendance();
    // Filter out any existing entries for the same date, class, and student to avoid duplicates
    const uniqueNewEntries = newEntries.filter(newEntry => 
      !existingEntries.some(existing => 
        existing.date === newEntry.date && 
        existing.classId === newEntry.classId && 
        existing.studentId === newEntry.studentId
      )
    );
    const updatedAttendance = [...existingEntries, ...uniqueNewEntries];
    localStorage.setItem(LATEST_ATTENDANCE_KEY, JSON.stringify(updatedAttendance));
  }
};
