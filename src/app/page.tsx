"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  // Optional: Render a loading state or null while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading AttendVisor...</p>
    </div>
  );
}
