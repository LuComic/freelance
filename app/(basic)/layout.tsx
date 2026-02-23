import "../globals.css";
import { LandingHeader } from "@/app/lib/components/landing/LandingHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="antialiased min-h-dvh h-auto w-screen flex flex-col items-start justify-start"
      style={{
        scrollbarColor: "gray transparent",
        scrollbarWidth: "thin",
      }}
    >
      <main className="min-h-dvh w-full overflow-x-hidden bg-(--quite-dark) text-(--light)">
        <LandingHeader />
        {children}
      </main>
    </div>
  );
}
