"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const showcases = [
	{
		src: "/images/sample-classic.jpg",
		title: "Classic",
		desc: "호텔 예식에 어울리는 우아한 실내 컷",
		className: "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto",
	},
	{
		src: "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=1978&auto=format&fit=crop",
		title: "Natural",
		desc: "제주도 스냅 느낌의 야외 그리너리 컷",
		className: "md:col-span-1 md:row-span-1 aspect-square",
	},
	{
		src: "/images/sample-vintage.jpg",
		title: "Vintage",
		desc: "필름 카메라 감성의 흑백 무드 컷",
		className: "md:col-span-1 md:row-span-1 aspect-square",
	},
];

export function ShowcaseSection() {
	return (
		<section className="py-20 md:py-32 bg-background">
			<div className="container px-4 md:px-6">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">
						"이게 정말 AI라고요?"
					</h2>
					<p className="text-muted-foreground">
						모바일 청첩장 메인 커버에 최적화된 구도로 생성됩니다.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 max-w-6xl mx-auto h-auto md:h-[800px]">
					{showcases.map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							className={`relative group overflow-hidden rounded-2xl shadow-xl ${item.className}`}
						>
							<Image
								src={item.src}
								alt={item.title}
								fill
								className="object-cover transition-transform duration-700 group-hover:scale-110"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-300" />
							<div className="absolute bottom-0 left-0 p-6 md:p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-10">
								<span className="text-primary font-serif italic text-lg mb-1 block">
									{item.title}
								</span>
								<h3 className="text-xl md:text-2xl font-bold mb-2">
									{item.desc}
								</h3>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
