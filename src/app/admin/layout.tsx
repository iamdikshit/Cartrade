"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Car,
  LayoutDashboard,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  Shield,
  PlusCircle,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    permission: null,
  },
  { href: "/admin/cars", icon: Car, label: "Cars", permission: "cars:view" },
  {
    href: "/admin/cars/new",
    icon: PlusCircle,
    label: "Add Car",
    permission: "cars:create",
  },
  {
    href: "/admin/inquiries",
    icon: MessageSquare,
    label: "Inquiries",
    permission: "inquiries:view",
  },
  {
    href: "/admin/employees",
    icon: Users,
    label: "Employees",
    permission: "employees:manage",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Settings",
    permission: null,
  },
];

function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout, hasPermission, isRoot } = useAdminAuth();
  const pathname = usePathname();
  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission) || isRoot,
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full bg-dark-950 border-r border-dark-800 flex flex-col z-50 transition-all duration-300 w-64 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-5 border-b border-dark-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-lg font-800 text-white">
                Car<span style={{ color: "#f97316" }}>Trade</span>
              </span>
              <p className="text-dark-500 text-xs -mt-0.5">Admin Portal</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-dark-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNav.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== "/admin/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active ? "bg-brand-gradient text-white shadow-md" : "text-dark-400 hover:text-white hover:bg-dark-800"}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-800">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.name[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user.name}
                </p>
                <div className="flex items-center gap-1">
                  {user.role === "root" && (
                    <Shield className="w-3 h-3 text-amber-400" />
                  )}
                  <p className="text-dark-400 text-xs capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function AdminHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user } = useAdminAuth();
  const pathname = usePathname();
  const pageTitle =
    NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label || "Admin";

  return (
    <header className="h-16 bg-white border-b border-dark-100 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-dark-500 hover:bg-dark-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display font-700 text-dark-900 text-lg">
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="text-xs text-dark-400 hover:text-dark-600 px-3 py-1.5 rounded-lg hover:bg-dark-100 transition-colors hidden sm:block"
        >
          View Public Site ↗
        </Link>
        <div className="w-9 h-9 bg-brand-gradient rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </span>
        </div>
      </div>
    </header>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/change-password";

  useEffect(() => {
    // Do nothing until localStorage has been read
    if (!ready) return;
    // Unauthenticated on a protected page → go to login
    if (!user && !isAuthPage) {
      router.replace("/admin/login");
    }
  }, [ready, user, isAuthPage, router]);

  // Auth pages (login/change-password) always render immediately — no wrapper
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Not ready yet (reading localStorage) → blank white screen, no flicker
  if (!ready) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Ready but no user → redirect already fired, render nothing
  if (!user) return null;

  // Authenticated — render dashboard layout
  return (
    <div className="min-h-screen bg-dark-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
