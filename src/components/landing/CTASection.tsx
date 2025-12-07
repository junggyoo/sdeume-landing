"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
    }, 1500);
  };

  return (
    <section id="cta-section" className="py-24 bg-secondary text-white relative overflow-hidden">
       {/* Decorative Elements */}
       <div className="absolute top-0 right-0 p-20 opacity-10">
            <div className="w-64 h-64 rounded-full bg-primary blur-3xl" />
       </div>
       <div className="absolute bottom-0 left-0 p-20 opacity-10">
            <div className="w-64 h-64 rounded-full bg-accent blur-3xl" />
       </div>

      <div className="container px-4 md:px-6 relative z-10 max-w-2xl mx-auto text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            지금 신청하시는 100쌍에게만<br /> <span className="text-primary">무료로 열립니다.</span>
            </h2>
            <p className="text-accent/80 text-lg mb-10 leading-relaxed">
            정식 출시 전, 모바일 청첩장용 <span className="text-white font-bold">Best Cut 3종 세트</span>를<br className="hidden md:block" /> 가장 먼저 받아보세요.
            </p>

            {isSubmitted ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center"
            >
                <div className="flex justify-center mb-4">
                    <CheckCircle2 className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">신청이 완료되었습니다!</h3>
                <p className="text-accent/90">
                    베타 테스터로 선정되시면 이메일로 안내해 드리겠습니다.<br />
                    친구들에게도 이 소식을 공유해보세요.
                </p>
                <Button className="mt-6 bg-white text-secondary hover:bg-accent rounded-full" onClick={() => setIsSubmitted(false)}>
                    다른 이메일로 또 신청하기
                </Button>
            </motion.div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
                <div className="space-y-2 text-left">
                    <Label htmlFor="email" className="text-accent pl-1">이메일 주소</Label>
                    <Input 
                        id="email"
                        type="email" 
                        required 
                        placeholder="example@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-primary focus:ring-primary"
                    />
                </div>
                <div className="space-y-2 text-left">
                    <Label htmlFor="date" className="text-accent pl-1">결혼 예정일 (선택 - 우선순위 배정용)</Label>
                    <Input 
                        id="date"
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-primary focus:ring-primary block w-full"
                    />
                </div>
                
                <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14 rounded-full mt-4 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                            대기 명단 등록하고 무료 혜택 받기
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                    )}
                </Button>
                <p className="text-xs text-accent/60 mt-4">
                    스팸은 보내지 않아요. 서비스 오픈 알림만 드립니다.
                </p>
            </form>
            )}
        </motion.div>
      </div>
    </section>
  );
}

