"use client";

export function MelonBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1622206151226-18ca42c9a4f9?auto=format&fit=crop&w=1920&q=80")`,
          opacity: 0.3,
        }}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-cream/70 via-cream/85 to-cream/95" />
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
