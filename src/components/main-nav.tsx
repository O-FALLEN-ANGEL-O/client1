"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, School, BookOpen } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ['Admin', 'Staff'],
    },
    {
      href: "/users",
      label: "Users",
      icon: Users,
      roles: ['Admin'],
    },
    {
      href: "/schools",
      label: "Schools",
      icon: School,
      roles: ['Admin'],
    },
     {
      href: "/courses",
      label: "Courses",
      icon: BookOpen,
      roles: ['Admin'],
    },
  ];

  return (
    <nav className="flex flex-col gap-2 px-2">
      {navItems.map((item) =>
        item.roles.includes(role!) && (
          <Button
            key={item.href}
            asChild
            variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
            className="justify-start"
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        )
      )}
    </nav>
  );
}
