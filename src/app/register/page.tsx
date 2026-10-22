import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

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
