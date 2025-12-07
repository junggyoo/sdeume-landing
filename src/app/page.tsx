import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ShowcaseSection />
      <ComparisonSection />
      <FAQSection />
      <CTASection />
      
      <footer className="py-8 bg-secondary text-accent/40 text-center text-sm">
        <div className="container px-4">
          <p className="mb-2">© 2024 스드메 AI. All rights reserved.</p>
          <p>Contact: help@sdeume-ai.com</p>
        </div>
      </footer>
    </main>
  );
}
