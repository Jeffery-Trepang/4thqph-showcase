"use client";

import { useState } from "react";

// Demo Mode: there is no backend, so the admin password is checked in the
// browser. Use the password below to explore the dashboard.
const DEMO_ADMIN_PASSWORD = "4qph-admin-2024";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === DEMO_ADMIN_PASSWORD) {
      setError("");
      onSuccess();
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-100 px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-black">Admin login</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter the admin password to continue.
        </p>

        <label className="mt-6 block text-sm font-medium text-black">
          Password
        </label>
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
        >
          Log in
        </button>

        <p className="mt-4 rounded-md bg-neutral-100 px-3 py-2 text-xs text-neutral-500">
          Demo Mode — use password:{" "}
          <span className="font-semibold text-black">{DEMO_ADMIN_PASSWORD}</span>
        </p>
      </form>
    </section>
  );
}
