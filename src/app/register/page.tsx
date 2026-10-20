import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

// The page reads ?type= from the URL to preselect a session type, so it must
// be rendered on demand rather than statically prerendered.
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-16" />
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
