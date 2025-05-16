"use client";

import * as React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Save, Users } from "lucide-react";
import type { Student, ClassRecord, AttendanceEntry, User, AttendanceStatus } from "@/types";
import { getStudentsByClassId, saveMockAttendance, getMockAttendance } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const attendanceItemSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  status: z.enum(["Present", "Absent"], { required_error: "Please select Present or Absent." }),
});

const attendanceFormSchema = z.object({
  classId: z.string({ required_error: "Please select a class." }),
  date: z.date({ required_error: "Please select a date." }),
  studentsAttendance: z.array(attendanceItemSchema).min(1, "No students to record attendance for."),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  currentUser: User;
  classes: ClassRecord[];
}

export function AttendanceForm({ currentUser, classes }: AttendanceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      classId: "",
      date: new Date(),
      studentsAttendance: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "studentsAttendance",
  });

  const selectedClassId = form.watch("classId");
  const selectedDate = form.watch("date");

  React.useEffect(() => {
    if (selectedClassId) {
      const classStudents = getStudentsByClassId(selectedClassId);
      const existingAttendanceForDate = getMockAttendance().filter(
        att => att.classId === selectedClassId && att.date === format(selectedDate || new Date(), "yyyy-MM-dd")
      );
      
      replace(classStudents.map(student => {
        const existingEntry = existingAttendanceForDate.find(att => att.studentId === student.id);
        return { 
          studentId: student.id, 
          studentName: student.name,
          status: existingEntry?.status || "Present" // Default to Present or existing status
        };
      }));
    } else {
      replace([]);
    }
  }, [selectedClassId, selectedDate, replace]);

  const onSubmit = (data: AttendanceFormValues) => {
    setIsLoading(true);
    
    const attendanceEntries: AttendanceEntry[] = data.studentsAttendance.map((sa, index) => ({
      id: `att-${Date.now()}-${index}`, // Simple unique ID
      date: format(data.date, "yyyy-MM-dd"),
      classId: data.classId,
      studentId: sa.studentId,
      status: sa.status as AttendanceStatus,
      facultyId: currentUser.id,
    }));

    saveMockAttendance(attendanceEntries);
    
    setTimeout(() => { // Simulate API delay
      setIsLoading(false);
      toast({
        title: "Attendance Recorded",
        description: `Attendance for ${classes.find(c => c.id === data.classId)?.name} on ${format(data.date, "PPP")} has been saved.`,
        variant: "default",
      });
      // form.reset({ // Consider if reset is desired or allow further edits
      //   classId: data.classId, // Keep class selected
      //   date: data.date, // Keep date selected
      //   studentsAttendance: data.studentsAttendance.map(s => ({...s, status: "Present"})) // Reset status to Present
      // });
    }, 1000);
  };
  
  const facultyClasses = classes.filter(c => c.facultyId === currentUser.id);

  if (facultyClasses.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>No Classes Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You are not assigned to any classes. Please contact an administrator.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl"><Users /> Record Attendance</CardTitle>
        <CardDescription>Select a class and date to record student attendance.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {facultyClasses.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedClassId && fields.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Students List</h3>
                {fields.map((item, index) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name={`studentsAttendance.${index}.status`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm hover:bg-muted/50 transition-colors">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{item.studentName}</FormLabel>
                        </div>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Present" id={`present-${item.studentId}`} />
                              </FormControl>
                              <Label htmlFor={`present-${item.studentId}`} className="font-normal text-green-600">Present</Label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Absent" id={`absent-${item.studentId}`} />
                              </FormControl>
                              <Label htmlFor={`absent-${item.studentId}`} className="font-normal text-red-600">Absent</Label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}
            {selectedClassId && fields.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No students found for this class.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading || fields.length === 0}>
              {isLoading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Saving..." : "Save Attendance"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
