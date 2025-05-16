"use client";

import * as React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AttendanceEntry, Student, ClassRecord } from "@/types";
import { getStudentsByClassId } from "@/lib/mock-data";

interface AbsenteeChartProps {
  attendanceRecords: AttendanceEntry[];
  students: Student[];
  classes: ClassRecord[];
  defaultClassId?: string;
}

export function AbsenteeChart({ attendanceRecords, students, classes, defaultClassId }: AbsenteeChartProps) {
  const [selectedClassId, setSelectedClassId] = React.useState<string | undefined>(defaultClassId ?? classes[0]?.id);

  const chartData = React.useMemo(() => {
    if (!selectedClassId) return [];
    
    const classStudents = getStudentsByClassId(selectedClassId);
    const relevantRecords = attendanceRecords.filter(r => r.classId === selectedClassId && r.status === 'Absent');

    return classStudents.map(student => {
      const absentCount = relevantRecords.filter(r => r.studentId === student.id).length;
      return {
        name: student.name.split(" ")[0], // Display first name for brevity
        absences: absentCount,
      };
    }).sort((a,b) => b.absences - a.absences) // Sort by most absences
    .slice(0,10); // Show top 10 absentees or less
  }, [selectedClassId, attendanceRecords, students]);

  const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || "Selected Class";

  return (
    <Card className="shadow-lg col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Absentee Overview</CardTitle>
            <CardDescription>Total absences per student in {selectedClassName}.</CardDescription>
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
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}> {/* Adjusted left margin */}
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
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
                allowDecimals={false}
                label={{ value: 'Number of Absences', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12, dx: -10 }} // Adjusted dx for YAxis label
              />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)"}}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--primary))" }}
              />
              <Legend wrapperStyle={{fontSize: "12px"}} />
              <Bar dataKey="absences" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No absentee data to display for {selectedClassName}, or all students were present.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
