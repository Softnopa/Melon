"use client";

import { MelonBackground } from "@/components/ui/MelonBackground";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";

export function SetupRequired() {
  return (
    <MelonBackground>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Card className="max-w-md w-full space-y-4">
          <div className="text-center">
            <p className="text-3xl">🍈</p>
            <h1 className="mt-2 text-xl font-bold text-ink">Supabase setup required</h1>
            <p className="mt-2 text-sm text-ink/60">
              The app needs your Supabase API keys in <code className="rounded bg-ink/5 px-1">.env</code>{" "}
              before login will work.
            </p>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink/70">
            <li>
              Create a free project at{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-melon-700 underline"
              >
                supabase.com
              </a>
            </li>
            <li>
              Open <strong>Project Settings → API</strong> and copy URL + anon key
            </li>
            <li>
              Paste into <code className="rounded bg-ink/5 px-1">.env</code>:
              <pre className="mt-2 overflow-x-auto rounded-lg bg-ink/5 p-3 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...`}
              </pre>
            </li>
            <li>
              Restart the dev server: <code className="rounded bg-ink/5 px-1">npm run dev</code>
            </li>
          </ol>
        </Card>
        <Footer />
      </div>
    </MelonBackground>
  );
}
