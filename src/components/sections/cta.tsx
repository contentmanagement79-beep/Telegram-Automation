import { Reveal } from "@/components/ui/reveal";
import { AuthCta } from "@/components/sections/auth-cta";

export function Cta({
  title = "Ready to automate?",
  subtitle = "Stop losing sleep over unread messages. Deploy your inbound AI assistant today.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="cta">
      <div className="container">
        <Reveal className="cta-inner">
          <div className="cta-glow" />
          <h2 className="cta-title balance">{title}</h2>
          <p className="cta-sub">{subtitle}</p>
          <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
            <AuthCta className="btn btn-glow" />
          </div>
          <p className="cta-note">Free with your own key. No card required.</p>
        </Reveal>
      </div>
    </section>
  );
}
