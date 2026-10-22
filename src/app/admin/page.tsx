"use client";

import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  return authenticated ? (
    <AdminDashboard onLogout={() => setAuthenticated(false)} />
  ) : (
    <AdminLogin onSuccess={() => setAuthenticated(true)} />
  );
}
