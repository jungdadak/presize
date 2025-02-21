// app/api/image/proxy/[processId]/route.ts
import { NextResponse } from 'next/server';
import { processStore } from '@/lib/process-store';
import { API_TIMEOUT } from '@/types/transform';

interface ProcessInfo {
  s3Url: string;
  originalFileName: string;
  method: string;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ processId: string }> }
) {
  try {
    // 먼저 전체 params 객체를 await하여 가져옵니다.
    const paramsData = await context.params;
    const processId = paramsData.processId;

    if (!processId) {
      console.error('❌ No processId provided in URL');
      return new NextResponse('Not found', { status: 404 });
    }

    console.log(`🔍 Fetching process info for ID: ${processId}`);
    const processInfo = processStore.get(processId) as ProcessInfo | undefined;

    if (!processInfo) {
      console.error(`❌ Process ID ${processId} not found in store`);
      return new NextResponse('Not found', { status: 404 });
    }

    console.log(`📝 원본 S3 URL: ${processInfo.s3Url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    console.log(`📥 Fetching image from S3: ${processInfo.originalFileName}`);
    try {
      const response = await fetch(processInfo.s3Url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `❌ Failed to fetch from S3: ${response.status} ${response.statusText}`
        );
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log(
        `✅ Successfully fetched image for: ${processInfo.originalFileName}`
      );

      // 파일명을 UTF-8로 인코딩합니다.
      const encodedFilename = encodeURIComponent(processInfo.originalFileName);

      return new NextResponse(blob, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000',
          'Content-Disposition': `inline; filename*=UTF-8''${encodedFilename}`,
          'Access-Control-Expose-Headers': 'Content-Disposition',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(
          `🚨 S3 fetch timed out for: ${processInfo.originalFileName}`
        );
        return new NextResponse('Timeout fetching image', {
          status: 504,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      throw error; // 다른 에러는 외부 catch 블록으로 전달
    }
  } catch (error) {
    console.error(`🚨 Proxy error for processId`, error);
    return new NextResponse('Error fetching image', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
