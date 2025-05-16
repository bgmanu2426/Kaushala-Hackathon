import { LoginForm } from "@/components/auth/login-form";
import { BookOpenCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <div className="mb-8 flex flex-col items-center">
        <BookOpenCheck className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary">AttendVisor</h1>
        <p className="text-muted-foreground">Streamlined Attendance Management</p>
      </div>
      <LoginForm />
    </div>
  );
}
