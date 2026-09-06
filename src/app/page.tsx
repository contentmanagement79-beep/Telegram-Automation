import { Hero } from "@/components/sections/hero";
import { Metrics } from "@/components/sections/metrics";
import { Features } from "@/components/sections/features";
import { Cta } from "@/components/sections/cta";

// HOME — composed from shared sections. Edit sections in src/components/sections/.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Metrics />
      <Features />
      <Cta />
    </>
  );
}
