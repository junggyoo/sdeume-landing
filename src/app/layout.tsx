import type { Metadata } from 'next';
import { Noto_Sans_KR, Gowun_Batang } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const notoSansKr = Noto_Sans_KR({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-pretendard',
  display: 'swap',
});

const gowunBatang = Gowun_Batang({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-gowun-batang',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '스드메 AI - 300만 원 아끼는 3분, AI 웨딩 사진',
  description: '스튜디오 촬영 없는 모바일 청첩장 사진. 실속파 예비부부를 위한 AI 웨딩 사진 생성 서비스.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSansKr.variable} ${gowunBatang.variable} font-sans antialiased bg-background text-secondary`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
