"use client";
import * as React from "react";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { AbsenteeChart } from "@/components/dashboard/absentee-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { MOCK_STUDENTS, MOCK_CLASSES, getMockAttendance } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";
import type { Student, ClassRecord, AttendanceEntry, User } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [classes, setClasses] = React.useState<ClassRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (user) {
      // Filter data relevant to the logged-in faculty
      const facultyClasses = MOCK_CLASSES.filter(c => c.facultyId === user.id);
      const facultyClassIds = facultyClasses.map(c => c.id);
      
      const facultyStudents = MOCK_STUDENTS.filter(s => facultyClassIds.includes(s.classId));
      const facultyAttendanceRecords = getMockAttendance().filter(ar => ar.facultyId === user.id);
      
      setClasses(facultyClasses);
      setStudents(facultyStudents);
      setAttendanceRecords(facultyAttendanceRecords);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <Skeleton className="h-12 w-1/4 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-lg" />)}
        </div>
        <Separator className="my-6" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
        <Separator className="my-6" />
        <Skeleton className="h-[250px] rounded-lg" />
      </div>
    );
  }
  
  if (!currentUser) {
     // This case should be handled by AppLayout, but as a fallback
    return <p>User not found. Please log in.</p>;
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome, {currentUser.name}!</h2>
        <p className="text-muted-foreground mb-4">You currently don't have any classes assigned or data to display.</p>
        <p className="text-sm">Please contact administration if you believe this is an error, or start by recording attendance for your classes.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground">Overview of your classes and student attendance.</p>
      </div>
      
      <StatsOverview students={students} classes={classes} attendanceRecords={attendanceRecords} />

      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AbsenteeChart attendanceRecords={attendanceRecords} students={students} classes={classes} defaultClassId={classes[0]?.id} />
        <TrendChart attendanceRecords={attendanceRecords} classes={classes} defaultClassId={classes[0]?.id} />
      </div>

      <Separator className="my-6" />
      
      <InsightsPanel currentUser={currentUser} classes={classes} attendanceRecords={attendanceRecords} defaultClassId={classes[0]?.id} />
    </div>
  );
}
