export async function POST(request: Request) {
	try {
		// 1. 프론트엔드에서 보낸 데이터 받기
		const { prompt, groomLoraUrl, brideLoraUrl } = await request.json();

		// 2. Modal API URL 확인
		const modalApiUrl = process.env.MODAL_API_URL;
		if (!modalApiUrl) {
			console.error("MODAL_API_URL is not configured");
			return Response.json(
				{ error: "Server configuration error: MODAL_API_URL is not set" },
				{ status: 500 }
			);
		}

		console.log("Generating image with Modal ComfyUI...");
		console.log(`  - Prompt: ${prompt?.substring(0, 50)}...`);
		console.log(`  - Groom LoRA: ${groomLoraUrl ? "provided" : "not provided"}`);
		console.log(`  - Bride LoRA: ${brideLoraUrl ? "provided" : "not provided"}`);

		// 3. Modal API 호출
		const response = await fetch(modalApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt,
				groomLoraUrl,
				brideLoraUrl,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Modal API error:", response.status, errorText);

			let errorDetails;
			try {
				errorDetails = JSON.parse(errorText);
			} catch {
				errorDetails = { message: errorText };
			}

			return Response.json(
				{ error: "Image generation failed", details: errorDetails },
				{ status: response.status }
			);
		}

		const result = await response.json();

		// 4. Modal 응답을 프론트엔드 형식으로 변환
		// Modal은 Base64 이미지를 반환하므로 Data URL로 변환
		interface ModalImage {
			base64: string;
			content_type: string;
			width?: number;
			height?: number;
		}

		const images = result.images?.map((img: ModalImage) => ({
			url: `data:${img.content_type};base64,${img.base64}`,
			width: img.width || 1024,
			height: img.height || 1024,
			content_type: img.content_type,
		}));

		console.log(`Generation complete: ${images?.length || 0} images`);

		return Response.json({ images });
	} catch (error: unknown) {
		console.error("API Error:", error);

		const message = error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ error: "Image generation failed", details: message },
			{ status: 500 }
		);
	}
}
