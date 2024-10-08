"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LoginPage from "@/app/login/page";
import DashboardWrapper from "@/app/DashboardWrapper";

function ClientLayoutSwitch({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // This effect will run on component mount and when the session changes
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === "session") {
        // Force a re-render when the session changes
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 0);
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <LoginPage />;
  }

  if (status === "authenticated" && session) {
    return <DashboardWrapper>{children}</DashboardWrapper>;
  }

  return <div>Error: Unexpected state occurred.</div>;
}

export default ClientLayoutSwitch;