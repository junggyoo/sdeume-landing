"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Q. 업로드한 사진은 안전한가요?",
    answer: "네, 업로드하신 사진은 AI 학습에 사용되지 않으며, 생성 완료 후 7일 이내에 서버에서 완전히 삭제됩니다. 사용자가 원하시면 즉시 삭제 요청도 가능합니다."
  },
  {
    question: "Q. 정말 무료인가요?",
    answer: "네, 베타 기간 동안 제공되는 '3장 맛보기 패키지'는 100% 무료입니다. 정식 출시 이후에는 더 풍성한 9장 세트가 유료로 제공될 예정입니다."
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6 max-w-3xl mx-auto">
         <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-secondary">
            자주 묻는 질문
          </h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-accent rounded-xl px-6 bg-white shadow-sm data-[state=open]:shadow-md transition-shadow">
              <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline text-secondary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

