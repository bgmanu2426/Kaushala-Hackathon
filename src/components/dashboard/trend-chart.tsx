"use client";

import * as React from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AttendanceEntry, ClassRecord, Student } from "@/types";
import { getStudentsByClassId } from "@/lib/mock-data";
import { format, parseISO } from 'date-fns';

interface TrendChartProps {
  attendanceRecords: AttendanceEntry[];
  classes: ClassRecord[];
  defaultClassId?: string;
}

export function TrendChart({ attendanceRecords, classes, defaultClassId }: TrendChartProps) {
  const [selectedClassId, setSelectedClassId] = React.useState<string | undefined>(defaultClassId ?? classes[0]?.id);

  const chartData = React.useMemo(() => {
    if (!selectedClassId) return [];

    const classStudents = getStudentsByClassId(selectedClassId);
    if (classStudents.length === 0) return [];
    
    const relevantRecords = attendanceRecords.filter(r => r.classId === selectedClassId);
    
    const attendanceByDate: Record<string, { present: number, total: number }> = {};

    relevantRecords.forEach(record => {
      if (!attendanceByDate[record.date]) {
        attendanceByDate[record.date] = { present: 0, total: 0 };
      }
      // Ensure total is based on actual students who had a record for that day in that class
      // This assumes a record exists for each student expected on a given day for the class.
      // A more robust way would be to count unique students expected per day.
      // For simplicity with mock data:
      attendanceByDate[record.date].total = classStudents.length; 
      if (record.status === 'Present') {
        attendanceByDate[record.date].present++;
      }
    });
    
    return Object.entries(attendanceByDate)
      .map(([date, counts]) => ({
        date: format(parseISO(date), "MMM d"), // Format date for X-axis
        fullDate: date, // Keep original for sorting
        attendanceRate: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()); // Sort by date

  }, [selectedClassId, attendanceRecords, classes]); // students changed to classes, as getStudentsByClassId depends on MOCK_STUDENTS

  const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || "Selected Class";

  return (
    <Card className="shadow-lg col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily attendance rate for {selectedClassName}.</CardDescription>
          </div>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}> {/* Adjusted left margin */}
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Attendance Rate (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12, dx: -10 }} // Adjusted dx for YAxis label
              />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value}%`, "Attendance Rate"]}
              />
              <Legend wrapperStyle={{fontSize: "12px"}}/>
              <Line type="monotone" dataKey="attendanceRate" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--accent))" }} activeDot={{ r: 6 }} name="Attendance Rate" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No attendance trend data to display for {selectedClassName}.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
