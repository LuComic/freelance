import "../globals.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="antialiased min-h-dvh h-auto w-screen flex items-start justify-start"
      style={{
        scrollbarColor: "gray transparent",
        scrollbarWidth: "thin",
      }}
    >
      {children}
    </div>
  );
}
