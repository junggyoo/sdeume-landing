"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
  const scrollToCTA = () => {
    const ctaSection = document.getElementById("cta-section");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
          alt="Wedding Couple"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-secondary/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight drop-shadow-lg">
            스튜디오 촬영,<br className="hidden md:block" /> 꼭 해야 할까요?
          </h1>
          
          <p className="text-lg md:text-2xl opacity-90 font-light max-w-2xl mx-auto drop-shadow-md">
            모바일 청첩장용 사진, 300만 원 대신 <span className="font-serif italic text-primary-foreground font-bold text-3xl">3분</span>이면 충분합니다.<br />
            국내 최초 실속파 예비부부를 위한 AI 웨딩 사진 생성 서비스.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="pt-8"
          >
            <Button 
              onClick={scrollToCTA}
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-8 text-xl shadow-lg shadow-primary/30 transition-transform hover:scale-105"
            >
              무료 베타 테스터 신청하기
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
