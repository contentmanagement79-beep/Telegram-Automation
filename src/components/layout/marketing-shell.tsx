import { Background } from "@/components/ui/background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Background />
      <Navbar />
      <main style={{ position: "relative", zIndex: 10, flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
