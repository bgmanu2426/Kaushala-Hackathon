"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout, getCurrentUser } from "@/lib/auth";
import { LayoutDashboard, ClipboardList, LogOut, BookOpenCheck, UserCircle } from "lucide-react";
import * as React from 'react';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<{name: string} | null>(null);

  React.useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/record-attendance", label: "Record Attendance", icon: ClipboardList },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-attendvisor-headerbg text-attendvisor-headerfg shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7" />
          <span className="text-xl font-bold">AttendVisor</span>
        </Link>
        <nav className="hidden items-center space-x-2 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              asChild
              className={`
                ${pathname === item.href 
                  ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                  : 'hover:bg-primary/80 hover:text-primary-foreground'}
                text-sm font-medium transition-colors
              `}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-5 w-5" />
              <span>{user.name}</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-primary/80 hover:text-primary-foreground" title="Logout">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
