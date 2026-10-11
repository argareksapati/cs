import { Suspense } from "react";
import { CallbackClient } from "./callback-client";

export default function AuthCallbackPage() {
  return (
    <main className="callback-page">
      <Suspense fallback={<><div className="callback-spinner" /><h1>Menyiapkan autentikasi…</h1></>}>
        <CallbackClient />
      </Suspense>
    </main>
  );
}
