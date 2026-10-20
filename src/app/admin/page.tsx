import { cookies } from "next/headers";
import { adminToken, ADMIN_COOKIE } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const authenticated =
    !!process.env.ADMIN_PASSWORD && !!token && token === adminToken();

  return authenticated ? <AdminDashboard /> : <AdminLogin />;
}
