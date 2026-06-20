"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getAccessToken } from "@/lib/api";
import { Skeleton } from "@retekapp/ui";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, hydrated, fetchMe } = useAuthStore();
  const hasToken = typeof window !== "undefined" ? !!getAccessToken() : false;

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && hasToken) {
      fetchMe();
    } else if (!isAuthenticated && !hasToken) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, hasToken, fetchMe, router]);

  if (!hydrated || (!isAuthenticated && hasToken)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
