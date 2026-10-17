import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { Nav } from "@/components/sections/Nav";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { chat } from "@/data/product";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <LogoStrip />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <ChatLauncher copy={chat} />
      <RevealObserver />
    </>
  );
}
