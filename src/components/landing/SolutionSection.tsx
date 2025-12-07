"use client";

import { motion } from "framer-motion";
import { Upload, MousePointerClick, Image as ImageIcon, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "Step 1",
    title: "사진 업로드",
    desc: "평소 잘 나온 셀카 3장 업로드\n(신랑/신부/커플샷)",
  },
  {
    icon: MousePointerClick,
    step: "Step 2",
    title: "컨셉 선택",
    desc: "원하는 컨셉 클릭\n(클래식/내추럴/빈티지 등)",
  },
  {
    icon: ImageIcon,
    step: "Step 3",
    title: "사진 완성",
    desc: "30초 뒤, 모바일 청첩장용\n고해상도 사진 3장 완성!",
  },
];

export function SolutionSection() {
  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
        </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">
            내 폰에 있는 셀카로<br className="md:hidden" /> 완성하는 웨딩 화보
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-muted-foreground mt-6">
            <span className="px-4 py-2 bg-accent/30 rounded-full text-secondary font-medium">🚫 스튜디오 예약 없음</span>
            <span className="px-4 py-2 bg-accent/30 rounded-full text-secondary font-medium">🚫 헤어메이크업 예약 없음</span>
            <span className="px-4 py-2 bg-accent/30 rounded-full text-secondary font-medium">🚫 보정 대기 시간 없음</span>
          </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-start">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[4rem] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.3, duration: 0.6 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 rounded-full bg-white border-4 border-accent flex items-center justify-center shadow-lg mb-6 group hover:border-primary/50 transition-colors duration-300">
                <step.icon className="w-12 h-12 text-secondary group-hover:text-primary transition-colors duration-300" />
              </div>
              <div className="space-y-2">
                <span className="text-primary font-bold tracking-wider text-sm uppercase">{step.step}</span>
                <h3 className="text-xl font-bold text-secondary">{step.title}</h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {step.desc}
                </p>
              </div>
              
              {/* Mobile Arrow */}
              {index < steps.length - 1 && (
                <div className="md:hidden py-8">
                    <ArrowRight className="w-6 h-6 text-accent" transform="rotate(90)" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

