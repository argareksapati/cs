"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const supabase = useMemo(() => createClient(), []);
  const invalid = !code || !supabase;
  const [message, setMessage] = useState(invalid ? "Tautan masuk tidak valid." : "Menyelesaikan proses masuk…");

  useEffect(() => {
    if (!code || !supabase) return;
    void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setMessage(error.message);
      else router.replace("/dashboard");
    });
  }, [code, router, supabase]);

  return <><div className="callback-spinner" /><h1>{message}</h1><p>Mohon jangan tutup halaman ini.</p></>;
}
