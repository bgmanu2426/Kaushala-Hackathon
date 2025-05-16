"use client"; // This layout needs to be a client component to use hooks

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { User } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = React.useState<boolean | undefined>(undefined);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    if (!authStatus) {
      router.replace("/login");
    } else {
      setUser(getCurrentUser());
    }
  }, [router]);

  if (isAuth === undefined) {
    // Optional: Add a loading spinner or skeleton screen here
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuth || !user) {
    // This should ideally not be reached if redirect works, but as a fallback
    return null; 
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
