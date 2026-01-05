"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Loader2, ImageIcon, Download, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Zod 스키마 정의
const generateFormSchema = z.object({
	prompt: z
		.string()
		.min(10, "프롬프트는 최소 10자 이상이어야 합니다")
		.max(2000, "프롬프트는 2000자 이하여야 합니다"),
	groomLoraUrl: z
		.string()
		.min(1, "신랑 LoRA URL을 입력해주세요")
		.url("올바른 URL 형식이어야 합니다"),
	brideLoraUrl: z
		.string()
		.min(1, "신부 LoRA URL을 입력해주세요")
		.url("올바른 URL 형식이어야 합니다"),
});

type GenerateFormData = z.infer<typeof generateFormSchema>;

// API 응답 타입
interface FalResponse {
	images?: Array<{
		url: string;
		width: number;
		height: number;
		content_type: string;
	}>;
	outputs?: Record<string, { images?: Array<{ url: string }> }>;
	timings?: {
		inference: number;
	};
}

export default function PlaygroundForm() {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<FalResponse | null>(null);
	const [elapsedTime, setElapsedTime] = useState<number | null>(null);
	const [showJson, setShowJson] = useState(false);
	const [copied, setCopied] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<GenerateFormData>({
		resolver: zodResolver(generateFormSchema),
		defaultValues: {
			prompt:
				"(Front view, full frontal shot), romantic, wedding, happy, warm color, canon eos, 35mm lens",
			groomLoraUrl: "",
			brideLoraUrl: "",
		},
	});

	const onSubmit = async (data: GenerateFormData) => {
		setIsLoading(true);
		setResult(null);
		setElapsedTime(null);

		const startTime = Date.now();

		try {
			const response = await axios.post<FalResponse>("/api/generate", data, {
				timeout: 300000, // 5분 타임아웃 (이미지 생성에 시간이 오래 걸릴 수 있음)
			});

			const endTime = Date.now();
			setElapsedTime((endTime - startTime) / 1000);
			setResult(response.data);

			toast({
				title: "이미지 생성 완료",
				description: "이미지가 성공적으로 생성되었습니다.",
			});
		} catch (error) {
			const endTime = Date.now();
			setElapsedTime((endTime - startTime) / 1000);

			if (axios.isAxiosError(error)) {
				if (error.code === "ECONNABORTED") {
					toast({
						title: "요청 시간 초과",
						description: "이미지 생성에 너무 오랜 시간이 걸렸습니다. 다시 시도해주세요.",
						variant: "destructive",
					});
				} else {
					toast({
						title: "API 오류",
						description:
							error.response?.data?.error || "이미지 생성에 실패했습니다.",
						variant: "destructive",
					});
				}
			} else {
				toast({
					title: "오류 발생",
					description: "알 수 없는 오류가 발생했습니다.",
					variant: "destructive",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	// 이미지 URL 추출 헬퍼 함수
	const getImageUrl = (): string | null => {
		if (!result) return null;

		// 직접 images 배열이 있는 경우
		if (result.images && result.images.length > 0) {
			return result.images[0].url;
		}

		// outputs 객체에서 이미지 찾기 (ComfyUI 응답 형식)
		if (result.outputs) {
			for (const key in result.outputs) {
				const output = result.outputs[key];
				if (output.images && output.images.length > 0) {
					return output.images[0].url;
				}
			}
		}

		return null;
	};

	const imageUrl = getImageUrl();

	const handleDownload = async () => {
		if (!imageUrl) return;

		try {
			let blob: Blob;

			// Base64 Data URL인 경우 (Modal 응답)
			if (imageUrl.startsWith("data:")) {
				const [header, base64] = imageUrl.split(",");
				const mimeType = header.match(/:(.*?);/)?.[1] || "image/png";
				const byteCharacters = atob(base64);
				const byteNumbers = new Array(byteCharacters.length);
				for (let i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i);
				}
				blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
			} else {
				// 일반 URL인 경우 (기존 로직)
				const response = await fetch(imageUrl);
				blob = await response.blob();
			}

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `generated-${Date.now()}.png`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch {
			toast({
				title: "다운로드 실패",
				description: "이미지 다운로드에 실패했습니다.",
				variant: "destructive",
			});
		}
	};

	const handleCopyJson = async () => {
		if (!result) return;

		try {
			await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast({
				title: "복사 실패",
				description: "JSON 복사에 실패했습니다.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* 요청 폼 */}
			<Card className="shadow-lg">
				<CardHeader>
					<CardTitle className="text-xl">요청 설정</CardTitle>
					<CardDescription>
						이미지 생성에 필요한 정보를 입력하세요
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{/* 프롬프트 */}
						<div className="space-y-2">
							<Label htmlFor="prompt">프롬프트</Label>
							<Textarea
								id="prompt"
								placeholder="이미지를 설명하는 프롬프트를 입력하세요..."
								className="min-h-[120px] rounded-xl"
								{...register("prompt")}
							/>
							{errors.prompt && (
								<p className="text-sm text-red-500">{errors.prompt.message}</p>
							)}
						</div>

						{/* 신랑 LoRA URL */}
						<div className="space-y-2">
							<Label htmlFor="groomLoraUrl">신랑 LoRA URL</Label>
							<Input
								id="groomLoraUrl"
								type="url"
								placeholder="https://..."
								className="h-12 rounded-xl"
								{...register("groomLoraUrl")}
							/>
							{errors.groomLoraUrl && (
								<p className="text-sm text-red-500">
									{errors.groomLoraUrl.message}
								</p>
							)}
						</div>

						{/* 신부 LoRA URL */}
						<div className="space-y-2">
							<Label htmlFor="brideLoraUrl">신부 LoRA URL</Label>
							<Input
								id="brideLoraUrl"
								type="url"
								placeholder="https://..."
								className="h-12 rounded-xl"
								{...register("brideLoraUrl")}
							/>
							{errors.brideLoraUrl && (
								<p className="text-sm text-red-500">
									{errors.brideLoraUrl.message}
								</p>
							)}
						</div>

						{/* 제출 버튼 */}
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-14 text-base font-medium"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									생성 중...
								</>
							) : (
								"이미지 생성하기"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* 결과 표시 */}
			<Card className="shadow-lg">
				<CardHeader>
					<CardTitle className="text-xl">결과</CardTitle>
					<CardDescription>
						{elapsedTime
							? `소요 시간: ${elapsedTime.toFixed(1)}초`
							: "생성된 이미지가 여기에 표시됩니다"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="min-h-[400px] flex flex-col">
						{/* 로딩 상태 */}
						{isLoading && (
							<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
								<Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
								<p>이미지 생성 중...</p>
								<p className="text-sm mt-2">최대 5분까지 소요될 수 있습니다</p>
							</div>
						)}

						{/* 빈 상태 */}
						{!isLoading && !result && (
							<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
								<ImageIcon className="h-12 w-12 mb-4" />
								<p>아직 생성된 이미지가 없습니다</p>
								<p className="text-sm mt-2">
									폼을 작성하고 생성 버튼을 클릭하세요
								</p>
							</div>
						)}

						{/* 결과 이미지 */}
						{!isLoading && result && (
							<div className="space-y-4">
								{imageUrl ? (
									<>
										{/* 이미지 */}
										<div className="relative rounded-xl overflow-hidden bg-muted">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={imageUrl}
												alt="Generated image"
												className="w-full h-auto"
											/>
										</div>

										{/* 다운로드 버튼 */}
										<Button
											onClick={handleDownload}
											variant="outline"
											className="w-full h-12 rounded-xl"
										>
											<Download className="mr-2 h-4 w-4" />
											이미지 다운로드
										</Button>
									</>
								) : (
									<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8">
										<p>이미지를 찾을 수 없습니다</p>
										<p className="text-sm mt-2">
											아래 JSON 응답을 확인해주세요
										</p>
									</div>
								)}

								{/* JSON 토글 */}
								<div className="border rounded-xl overflow-hidden">
									<button
										onClick={() => setShowJson(!showJson)}
										className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
									>
										<span className="text-sm font-medium">JSON 응답 보기</span>
										{showJson ? (
											<ChevronUp className="h-4 w-4" />
										) : (
											<ChevronDown className="h-4 w-4" />
										)}
									</button>
									{showJson && (
										<div className="relative">
											<button
												onClick={handleCopyJson}
												className="absolute top-2 right-2 p-2 rounded-md bg-background hover:bg-muted transition-colors"
												title="JSON 복사"
											>
												{copied ? (
													<Check className="h-4 w-4 text-green-500" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</button>
											<pre className="p-4 text-xs overflow-auto max-h-[300px] bg-muted/30">
												{JSON.stringify(result, null, 2)}
											</pre>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
