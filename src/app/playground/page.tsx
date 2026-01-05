import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import PlaygroundForm from "./_components/PlaygroundForm";

export const metadata: Metadata = {
	title: "API Playground - 스드메 AI",
	description: "이미지 생성 API 테스트 페이지",
};

export default function PlaygroundPage() {
	return (
		<main className="min-h-screen bg-background py-8 md:py-12">
			<div className="container mx-auto px-4">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-secondary mb-2">
						API Playground
					</h1>
					<p className="text-muted-foreground">
						/api/generate 엔드포인트 테스트
					</p>
				</div>

				{/* Main Content */}
				<PlaygroundForm />
			</div>
			<Toaster />
		</main>
	);
}
