import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
	title: "스드메 AI - 300만 원 아끼는 3분, AI 웨딩 사진",
	description:
		"스튜디오 촬영 없는 모바일 청첩장 사진. 실속파 예비부부를 위한 AI 웨딩 사진 생성 서비스.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko" suppressHydrationWarning>
			<body className={`font-sans antialiased bg-background text-secondary`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
