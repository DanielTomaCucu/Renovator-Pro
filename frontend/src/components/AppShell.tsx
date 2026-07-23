"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/AuthProvider";
import { StoreProvider } from "@/shared/store";
import PageSkeleton from "./PageSkeleton";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Gardă de rute client-side (AUTH-5): fără sesiune → redirect `/login`; cu sesiune pe `/login`/`/register`
 * → redirect spre app. `/login`/`/register` se randează FĂRĂ Sidebar/StoreProvider (userul nelogat nu are
 * proiect de arătat). Restul rutelor rămân în afara `StoreProvider` până sesiunea e confirmată, la fel
 * cum Sidebar-ul stă deja în afara lui pt. cold-start-ul de date (vezi app/layout.tsx).
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useAuth();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (loading) return;
    if (!session && !isAuthRoute) {
      router.replace("/login");
    } else if (session && isAuthRoute) {
      router.replace("/elemente");
    }
  }, [loading, session, isAuthRoute, router]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-28 md:pb-0">
          <StoreProvider>{children}</StoreProvider>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
