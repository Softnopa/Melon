// "use client";

// import { useEffect, useState } from "react";
// import { AuthScreen } from "@/components/auth/AuthScreen";
// import { SetupRequired } from "@/components/auth/SetupRequired";
// import { Dashboard } from "@/components/dashboard/Dashboard";
// import { api } from "@/lib/api";
// import { isSupabaseConfiguredClient } from "@/lib/supabase/client";
// import type { AuthUser } from "@/lib/types";

// export default function Home() {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [ready, setReady] = useState(false);
//   const [configured, setConfigured] = useState(isSupabaseConfiguredClient());

//   useEffect(() => {
//     fetch("/api/config")
//       .then((r) => r.json())
//       .then((data: { supabaseConfigured?: boolean }) => {
//         setConfigured(Boolean(data.supabaseConfigured));
//       })
//       .catch(() => setConfigured(isSupabaseConfiguredClient()));

//     if (!isSupabaseConfiguredClient()) {
//       setReady(true);
//       return;
//     }

//     api.auth
//       .me()
//       .then((res) => setUser(res.user))
//       .catch(() => setUser(null))
//       .finally(() => setReady(true));
//   }, []);

//   if (!ready) {
//     return (
//       <div className="flex min-h-dvh items-center justify-center bg-cream">
//         <div className="h-8 w-8 animate-spin rounded-full border-2 border-melon-600 border-t-transparent" />
//       </div>
//     );
//   }

//   if (!configured) {
//     return <SetupRequired />;
//   }

//   if (!user) {
//     return <AuthScreen onAuthenticated={setUser} />;
//   }

//   return <Dashboard user={user} onLogout={() => setUser(null)} />;
// }
