"use client";

import { motion } from "framer-motion";
import { CreditCard, CalendarX, Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const problems = [
  {
    icon: CreditCard,
    title: "💸 아까운 비용",
    description: "\"청첩장에 넣을 사진 몇 장 필요한 건데, 수백만 원 깨지는 게 맞나?\"",
  },
  {
    icon: CalendarX,
    title: "😓 부담스러운 연차",
    description: "\"촬영 때문에 둘 다 평일 연차? 회사 눈치 보이고 피곤해.\"",
  },
  {
    icon: Smile,
    title: "😬 어색한 미소",
    description: "\"카메라 앞이 어색한 우리, 4시간 동안 웃을 수 있을까?\"",
  },
];

export function ProblemSection() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-secondary text-balance">
            남들 다 하니까 하는 스드메, 이런 고민 없으셨나요?
          </h2>
          <p className="text-muted-foreground text-lg">
            가장 합리적인 커플을 위해, 거품은 빼고 퀄리티만 남겼습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <Card className="h-full border-none shadow-lg shadow-secondary/5 bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="text-center pt-10 pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center mb-6 text-secondary">
                    <problem.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-secondary">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-10 px-8">
                  <p className="text-lg text-muted-foreground leading-relaxed break-keep">
                    {problem.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

