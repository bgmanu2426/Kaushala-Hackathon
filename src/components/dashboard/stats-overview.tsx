"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Library, PieChart, TrendingUp, TrendingDown } from "lucide-react";
import type { AttendanceEntry, ClassRecord, Student } from "@/types";

interface StatsOverviewProps {
  students: Student[];
  classes: ClassRecord[];
  attendanceRecords: AttendanceEntry[];
}

export function StatsOverview({ students, classes, attendanceRecords }: StatsOverviewProps) {
  const totalStudents = students.length;
  const totalClasses = classes.length;

  const overallAttendanceRate = React.useMemo(() => {
    if (attendanceRecords.length === 0) return 0;
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    return Math.round((presentCount / attendanceRecords.length) * 100);
  }, [attendanceRecords]);
  
  // Basic trend: compare last week's attendance to previous week's
  const attendanceTrend = React.useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekRecords = attendanceRecords.filter(r => new Date(r.date) > oneWeekAgo);
    const lastWeekRecords = attendanceRecords.filter(r => new Date(r.date) <= oneWeekAgo && new Date(r.date) > twoWeeksAgo);

    if (thisWeekRecords.length === 0 || lastWeekRecords.length === 0) return "neutral";

    const thisWeekRate = (thisWeekRecords.filter(r => r.status === 'Present').length / thisWeekRecords.length);
    const lastWeekRate = (lastWeekRecords.filter(r => r.status === 'Present').length / lastWeekRecords.length);
    
    if (thisWeekRate > lastWeekRate) return "up";
    if (thisWeekRate < lastWeekRate) return "down";
    return "neutral";

  }, [attendanceRecords]);


  const stats = [
    { title: "Total Students", value: totalStudents, icon: Users, color: "text-blue-500" },
    { title: "Managed Classes", value: totalClasses, icon: Library, color: "text-purple-500" },
    { 
      title: "Overall Attendance", 
      value: `${overallAttendanceRate}%`, 
      icon: PieChart, 
      color: overallAttendanceRate > 80 ? "text-green-500" : overallAttendanceRate > 60 ? "text-yellow-500" : "text-red-500" 
    },
    {
      title: "Weekly Trend",
      value: attendanceTrend === "up" ? "Improving" : attendanceTrend === "down" ? "Declining" : "Steady",
      icon: attendanceTrend === "up" ? TrendingUp : attendanceTrend === "down" ? TrendingDown : TrendingUp,
      color: attendanceTrend === "up" ? "text-accent" : attendanceTrend === "down" ? "text-destructive" : "text-muted-foreground"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
