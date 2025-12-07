"use client";

import { motion } from "framer-motion";

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">
            현명한 예비부부의 선택 기준
          </h2>
          <p className="text-muted-foreground">
            비용은 0원, 퀄리티는 그대로.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl shadow-2xl border border-accent/20">
          <div className="grid grid-cols-3 bg-secondary text-white py-6 text-center text-sm md:text-lg font-bold">
            <div className="opacity-70">구분</div>
            <div className="opacity-70">일반 스튜디오</div>
            <div className="text-primary">스드메 AI (Beta)</div>
          </div>
          
          {[
            { label: "비용", studio: "평균 250만 원+", ai: "0원 (베타 한정)", highlight: true },
            { label: "소요 시간", studio: "준비~촬영 약 10시간", ai: "업로드~생성 5분", highlight: true },
            { label: "결과물 수령", studio: "원본 2주 / 보정 3개월", ai: "즉시 다운로드", highlight: true },
            { label: "표정/포즈", studio: "작가님 지시대로 (어색)", ai: "가장 나다운 표정 그대로", highlight: false },
          ].map((row, index) => (
            <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-3 text-center border-b border-accent last:border-none"
            >
              <div className="py-6 px-2 bg-gray-50 font-medium text-secondary flex items-center justify-center break-keep">
                {row.label}
              </div>
              <div className="py-6 px-2 text-muted-foreground flex items-center justify-center bg-white break-keep">
                {row.studio}
              </div>
              <div className={`py-6 px-2 font-bold flex items-center justify-center break-keep ${row.highlight ? 'text-primary bg-primary/5' : 'text-secondary bg-primary/5'}`}>
                {row.ai}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
