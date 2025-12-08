"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const fadeUpVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: (delay: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			delay: delay,
			ease: [0.25, 0.4, 0.25, 1],
		},
	}),
};

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
					custom={0}
					variants={fadeUpVariants}
					initial="hidden"
					animate="visible"
					className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 border border-coral/20 mb-8"
				>
					<Sparkles className="w-4 h-4 text-coral" />
					<span className="text-sm font-medium text-coral">
						베타 테스터 모집 중
					</span>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="max-w-3xl mx-auto space-y-4 md:space-y-6"
				>
					<h1 className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight drop-shadow-lg text-balance px-4">
						스튜디오 촬영, 꼭 해야 할까요?
					</h1>

					<p className="text-base md:text-2xl opacity-90 font-light max-w-2xl mx-auto drop-shadow-md px-4 text-pretty">
						모바일 청첩장용 사진, 300만 원 대신{" "}
						<span className="font-serif italic text-primary-foreground font-bold text-2xl md:text-3xl">
							3분
						</span>
						이면 충분합니다. 국내 최초 실속파 예비부부를 위한 AI 웨딩 사진 생성 서비스.
					</p>
				</motion.div>
				{/* 스크롤 힌트 */}
				<motion.div
					className="absolute left-1/2 -translate-x-1/2"
					animate={{ y: [0, 8, 0] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<div className="w-6 h-10 rounded-full border-2 border-navy/30 flex items-start justify-center p-2">
						<motion.div
							className="w-1.5 h-1.5 rounded-full bg-coral"
							animate={{ y: [0, 12, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
