// next.config.ts

import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // React Strict Mode 활성화
  reactStrictMode: true,

  // Turbopack 활성화 (Next.js 15.1.4 기준)
  // Turbopack은 실험적 기능일 수 있으며, 별도의 설정이 필요할 수 있습니다.

  // SWC 최소화 설정 (Next.js 15.1.4 기준)

  // 콘솔 로그 제거 설정
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'], // 'error'와 'warn' 로그는 유지, 나머지는 제거
    },
  },

  // 이미지 최적화 설정
  images: {
    domains: ['example.com'], // 외부 이미지 도메인 추가
    formats: ['image/avif', 'image/webp'], // 지원할 이미지 포맷
    minimumCacheTTL: 60, // 캐시 TTL 설정 (초 단위)
  },

  // 환경 변수 설정 (프로덕션과 개발 환경 분리)
  env: {
    CUSTOM_ENV_VARIABLE: process.env.CUSTOM_ENV_VARIABLE,
  },

  // Turbopack과 호환되는 설정만 포함 (Webpack 설정 제거)
  // Webpack 설정을 포함할 경우 Turbopack과 충돌할 수 있습니다.
  // Turbopack을 사용하는 경우 Webpack 관련 설정을 제거하세요.
};

export default nextConfig;
