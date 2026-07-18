"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/modules/auth/actions";
import type { DemoUser } from "@/modules/auth/demo-users";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/deals", label: "Deals" },
  { href: "/companies", label: "Companies" },
  { href: "/tasks", label: "Tasks" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" }
];

export function AppShell({
  user,
  children
}: {
  user: DemoUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <div>
          <h1>Founder CRM Lite</h1>
          <p>Lead conversion, pipeline visibility, follow-up discipline, and ownership-aware workflows.</p>
        </div>

        <nav className="crm-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} data-active={pathname === item.href ? "true" : "false"}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="panel" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.12)", color: "white" }}>
          <strong>{user.name}</strong>
          <p style={{ marginBottom: 0 }}>{user.role.replace("_", " ")}</p>
          <form action={logoutAction} style={{ marginTop: 14 }}>
            <button className="button-secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="crm-main">{children}</main>
    </div>
  );
}
