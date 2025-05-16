"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAttendanceInsights, type AttendanceInsightsInput, type AttendanceInsightsOutput } from "@/ai/flows/attendance-insights";
import type { AttendanceEntry, ClassRecord, User, HistoricalAttendanceDataItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightsPanelProps {
  currentUser: User;
  classes: ClassRecord[];
  attendanceRecords: AttendanceEntry[];
  defaultClassId?: string;
}

export function InsightsPanel({ currentUser, classes, attendanceRecords, defaultClassId }: InsightsPanelProps) {
  const [selectedClassId, setSelectedClassId] = React.useState<string | undefined>(defaultClassId ?? classes[0]?.id);
  const [insights, setInsights] = React.useState<AttendanceInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchInsights = React.useCallback(async () => {
    if (!selectedClassId || !currentUser) return;

    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;

    setIsLoading(true);
    setError(null);
    setInsights(null);

    try {
      const historicalData: HistoricalAttendanceDataItem[] = attendanceRecords
        .filter(r => r.classId === selectedClassId && r.facultyId === currentUser.id)
        .map(r => ({ date: r.date, studentId: r.studentId, status: r.status }));
      
      if (historicalData.length < 5) { // Require a minimum amount of data
        setError("Not enough historical data for this class to generate insights. Please record more attendance.");
        setIsLoading(false);
        return;
      }

      const input: AttendanceInsightsInput = {
        historicalAttendanceData: JSON.stringify(historicalData),
        facultyName: currentUser.name,
        className: selectedClass.name,
      };
      
      const result = await getAttendanceInsights(input);
      setInsights(result);
    } catch (e) {
      console.error("Error fetching attendance insights:", e);
      setError("Failed to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, currentUser, classes, attendanceRecords]);

  React.useEffect(() => {
    if(selectedClassId && currentUser?.id){ // Fetch insights when class or user changes
        fetchInsights();
    }
  }, [selectedClassId, currentUser, fetchInsights]);

  const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || "Selected Class";

  return (
    <Card className="shadow-lg col-span-1 lg:col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Attendance Improvement Insights</CardTitle>
              <CardDescription>AI-powered analysis for {selectedClassName}.</CardDescription>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id} disabled={cls.facultyId !== currentUser.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchInsights} disabled={isLoading || !selectedClassId} size="icon" variant="outline">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh Insights</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center text-destructive p-4 bg-destructive/10 rounded-md">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Error</p>
            <p className="text-sm text-center">{error}</p>
          </div>
        )}
        {!isLoading && !error && insights && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {insights.hasImproved ? (
                <CheckCircle2 className="h-6 w-6 text-accent" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              )}
              <h3 className="text-lg font-semibold">
                Attendance Trend: {insights.hasImproved ? "Improved" : "Needs Attention"}
              </h3>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{insights.insights}</p>
          </div>
        )}
         {!isLoading && !error && !insights && !selectedClassId && (
          <p className="text-muted-foreground text-center pt-8">Please select a class to view insights.</p>
        )}
        {!isLoading && !error && !insights && selectedClassId && historicalAttendanceRecords.filter(r => r.classId === selectedClassId && r.facultyId === currentUser.id).length < 5 && (
           <div className="flex flex-col items-center justify-center text-yellow-600 dark:text-yellow-400 p-4 bg-yellow-500/10 rounded-md">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Insufficient Data</p>
            <p className="text-sm text-center">Not enough historical data for this class to generate insights. Please record more attendance (at least 5 entries needed).</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper to get attendance records relevant to the AI insight generation
// This is just to avoid recalculating it inside the component for the conditional message
const historicalAttendanceRecords = {
  filter: (predicate: (record: AttendanceEntry) => boolean) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('attendvisor_latest_attendance');
      if (stored) {
        return (JSON.parse(stored) as AttendanceEntry[]).filter(predicate);
      }
    }
    return [];
  }
};
