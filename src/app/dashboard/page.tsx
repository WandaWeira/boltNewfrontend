"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Login from "@/app/login/page";

export default function Dashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
  }, [status]);

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (status === "authenticated" && session) {
    return (
      <div>
        <p>Welcome, {session.user?.email}</p>
        {/* Render other dashboard content */}
      </div>
    );
  }

  return <Login />; // Fallback if unauthenticated
}
