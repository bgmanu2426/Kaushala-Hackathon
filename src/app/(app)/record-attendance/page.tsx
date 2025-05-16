"use client";

import * as React from "react";
import { AttendanceForm } from "@/components/attendance/attendance-form";
import { MOCK_CLASSES } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";
import type { ClassRecord, User } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecordAttendancePage() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [classes, setClasses] = React.useState<ClassRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      // Filter classes for the current faculty user
      setClasses(MOCK_CLASSES.filter(c => c.facultyId === user.id));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-[500px] w-full max-w-2xl mx-auto rounded-lg" />
      </div>
    );
  }

  if (!currentUser) {
    // This should be handled by AppLayout, but as a fallback
    return <p className="text-center text-muted-foreground">User not authenticated. Please log in.</p>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record Student Attendance</h1>
        <p className="text-muted-foreground">
          Select a class and date, then mark each student as present or absent.
        </p>
      </div>
      <AttendanceForm currentUser={currentUser} classes={classes} />
    </div>
  );
}
