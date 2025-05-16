export interface User {
  id: string;
  email: string;
  name: string; // Faculty name
  // password field is intentionally omitted for client-side type
}

export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface ClassRecord {
  id: string;
  name: string;
  facultyId: string;
  // studentIds: string[]; // This can be derived from Student records or stored here
}

export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceEntry {
  id: string; // Unique ID for the attendance entry
  date: string; // YYYY-MM-DD
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  facultyId: string;
}

// For AI Insights
export interface HistoricalAttendanceDataItem {
  date: string;
  studentId: string;
  status: AttendanceStatus;
}
