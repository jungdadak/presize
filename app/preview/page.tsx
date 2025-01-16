'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { useFileStore, FileItem } from '@/store/fileStore';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import {
  Loader2,
  X,
  FileImage,
  Upload,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getImageDimensions } from '@/utils/image';
import { PROCESSING_METHODS, ASPECT_RATIOS } from '@/lib/constants';

import 'swiper/css';
import 'swiper/css/pagination';

// ------------------- Swiper 네비게이션 -------------------
function SwiperNavigation({ totalFiles }: { totalFiles: number }) {
  const swiper = useSwiper();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleSlideChange = () => {
      setActiveIndex(swiper.activeIndex);
    };

    swiper.on('slideChange', handleSlideChange);
    return () => {
      swiper.off('slideChange', handleSlideChange);
    };
  }, [swiper]);

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => swiper.slidePrev()}
        disabled={activeIndex === 0}
        className={`px-4 py-2.5 flex items-center gap-2 
          bg-gray-900/80 dark:bg-gray-900/80 
          backdrop-blur-sm border border-gray-700/50 
          rounded-xl text-gray-200 dark:text-gray-200 
          shadow-lg transition-all duration-200
          ${
            activeIndex === 0
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-800 hover:border-gray-600 hover:scale-105 hover:shadow-xl'
          }`}
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </button>
      <div
        className="px-6 py-2 min-w-[100px] text-center 
          bg-gray-900/60 dark:bg-gray-900/60 
          backdrop-blur-sm border border-gray-700/50 
          rounded-xl text-gray-200 dark:text-gray-200
        "
      >
        {activeIndex + 1} / {totalFiles}
      </div>
      <button
        onClick={() => swiper.slideNext()}
        disabled={activeIndex === totalFiles - 1}
        className={`px-4 py-2.5 flex items-center gap-2
          bg-gray-900/80 dark:bg-gray-900/80
          backdrop-blur-sm border border-gray-700/50
          rounded-xl text-gray-200 dark:text-gray-200
          shadow-lg transition-all duration-200
          ${
            activeIndex === totalFiles - 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-800 hover:border-gray-600 hover:scale-105 hover:shadow-xl'
          }
        `}
      >
        Next
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ------------------- S3 업로드 함수 -------------------
async function uploadFileToS3UsingAxios(
  presignedUrl: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    formData.append(k, v);
  });
  formData.append('file', file);

  await axios.post(presignedUrl, formData, {
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress?.(percent);
      }
    },
  });
}

// ------------------- 이미지 사이즈 업데이트 -------------------
function setFileDimensions(index: number, width: number, height: number) {
  useFileStore.getState().updateFile(index, {
    dimensions: { width, height },
  });
}

// ------------------- 메인 컴포넌트 -------------------
export default function PreviewPage() {
  const router = useRouter();

  const {
    files,
    uploadStatus,
    setUploadStatus,
    resetFileStore,
    setProcessingOption,
  } = useFileStore();

  const [isUploading, setIsUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);

  const totalFiles = useMemo(() => files.length, [files]);
  const totalSize = useMemo(() => {
    const bytes = files.reduce((acc, item) => acc + item.file.size, 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  }, [files]);

  // ------------------- useEffect: 파일 없으면 메인으로, 이미지 dimensions 세팅 -------------------

  useEffect(() => {
    if (files.length === 0) {
      router.push('/');
      return;
    }
    files.forEach(async (fileItem, index) => {
      if (!fileItem.dimensions) {
        try {
          const dims = await getImageDimensions(fileItem.previewUrl);
          setFileDimensions(index, dims.width, dims.height);
        } catch (error) {
          console.error('Error loading image dimensions', error);
        }
      }
    });
  }, [files, router]);

  // ------------------- 옵션 토글 핸들러들 -------------------
  const handleMethodToggle = (fileIndex: number, methodId: string) => {
    const { processingOption } = files[fileIndex];
    if (processingOption?.method === methodId) {
      setProcessingOption(fileIndex, null);
    } else {
      if (methodId === 'uncrop') {
        setProcessingOption(fileIndex, {
          method: 'uncrop',
          aspectRatio: '1:1',
        });
      } else if (methodId === 'upscale') {
        setProcessingOption(fileIndex, { method: 'upscale', factor: 'x1' });
      } else if (methodId === 'square') {
        setProcessingOption(fileIndex, { method: 'square' });
      }
    }
  };

  const handleAspectRatioChange = (
    fileIndex: number,
    ratio: '1:1' | '1:2' | '2:1'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'uncrop') {
      setProcessingOption(fileIndex, { ...currentOption, aspectRatio: ratio });
    }
  };

  const handleUpscaleFactorChange = (
    fileIndex: number,
    factor: 'x1' | 'x2' | 'x4'
  ) => {
    const currentOption = files[fileIndex].processingOption;
    if (currentOption?.method === 'upscale') {
      setProcessingOption(fileIndex, { ...currentOption, factor });
    }
  };

  const handleRemoveFile = (index: number) => {
    useFileStore.getState().removeFile(index);
  };

  // ------------------- 취소 버튼 -------------------
  const handleCancel = () => {
    resetFileStore();
    router.push('/');
  };

  // ------------------- 업로드 & transform 이동 -------------------
  const handleProcess = async () => {
    if (files.length === 0) return;

    const hasProcessingOptions = files.some(
      (file) => file.processingOption !== null
    );
    if (!hasProcessingOptions) {
      setUploadStatus({
        stage: 'idle',
        error: 'Please select at least one processing option.',
      });
      return;
    }

    try {
      setUploadStatus({ stage: 'getting-url' });
      setIsUploading(true);
      setCurrentFileIndex(0);
      setCurrentFileProgress(0);

      // presigned url + s3Key 가져오기
      const presignedRequests = files.map(async (fileItem) => {
        const filename = encodeURIComponent(fileItem.file.name);
        const res = await fetch(`/api/image?file=${filename}`, {
          method: 'GET',
        });
        if (!res.ok) {
          throw new Error(`Failed to get upload URL for ${fileItem.file.name}`);
        }
        const presignedData = await res.json();
        if (!presignedData.success) {
          throw new Error(
            presignedData.error ||
              `Failed to get upload URL for ${fileItem.file.name}`
          );
        }
        return {
          fileItem,
          presigned: presignedData.data.presigned,
          s3Key: presignedData.data.s3Key,
        };
      });

      const presignedResults = await Promise.all(presignedRequests);

      // 파일 하나씩 S3 업로드
      for (let i = 0; i < presignedResults.length; i++) {
        const { fileItem, presigned } = presignedResults[i];
        setCurrentFileIndex(i + 1);
        setCurrentFileProgress(0);

        await uploadFileToS3UsingAxios(
          presigned.url,
          presigned.fields,
          fileItem.file,
          (percent) => setCurrentFileProgress(percent)
        );
      }

      // 업로드 완료 후 transform 페이지로 이동
      setUploadStatus({ stage: 'idle', error: '' });
      const transformDataArray = presignedResults.map(
        ({ fileItem, s3Key }) => ({
          s3Key,
          processingOptions: fileItem.processingOption,
          originalFileName: fileItem.file.name,
          previewUrl: fileItem.previewUrl,
        })
      );

      router.push(
        `/transform?data=${encodeURIComponent(
          JSON.stringify(transformDataArray)
        )}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'An unknown error occurred';

      setUploadStatus({ stage: 'idle', error: errorMessage });
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`
        min-h-screen py-12 transition-colors duration-300 
        bg-white text-gray-900 
        dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 dark:text-gray-100
      `}
    >
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div
          className={`
            flex items-center justify-between rounded-2xl shadow-lg p-8
            bg-white border border-gray-200
            dark:bg-gray-800/80 dark:border-none dark:backdrop-blur-sm
          `}
        >
          <div className="space-y-2">
            <h1
              className={`
                text-3xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-indigo-400 to-violet-400
              `}
            >
              Image Processing Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Transform your images with advanced AI processing
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Badge
              variant="secondary"
              className={`
                px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 
                dark:bg-gray-900/80 dark:border-gray-700/50 dark:text-gray-200
              `}
            >
              <FileImage className="w-4 h-4 mr-2" />
              {totalFiles} Files
            </Badge>
            <Badge
              variant="secondary"
              className={`
                px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 
                dark:bg-gray-900/80 dark:border-gray-700/50 dark:text-gray-200
              `}
            >
              <Upload className="w-4 h-4 mr-2" />
              {totalSize} MB
            </Badge>
          </div>
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          className={`
            shadow-xl rounded-2xl border-0 
            bg-white text-gray-900
            dark:bg-gray-800/50 dark:text-gray-100 dark:backdrop-blur-sm
          `}
        >
          <CardContent className="p-6">
            {/* Swiper 캐러셀 */}
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={40}
              slidesPerView={1}
            >
              {files.map((fileItem: FileItem, index: number) => {
                const sizeMB = (fileItem.file.size / (1024 * 1024)).toFixed(2);

                return (
                  <SwiperSlide key={index} className="p-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* 이미지 프리뷰 */}
                      <div className="relative lg:w-1/2">
                        <div
                          className={`
                            group relative rounded-xl p-6 transition-all duration-300 hover:shadow-lg
                            bg-gray-100 border border-gray-200
                            dark:bg-gray-900/80 dark:border-none dark:backdrop-blur-sm
                          `}
                        >
                          {/* 상단 정보(파일 번호, 이름) */}
                          <div
                            className={`
                              absolute top-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-lg
                              bg-gray-200/70 
                              dark:bg-black/40
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="px-3 py-1 text-sm"
                              >
                                File {index + 1}
                              </Badge>
                              <h2 className="text-sm font-medium truncate">
                                {fileItem.file.name}
                              </h2>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(index)}
                              className={`
                                p-2 rounded-full text-white transition-all duration-200
                                bg-black/40 hover:bg-black/60
                              `}
                              aria-label={`Remove file ${fileItem.file.name}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-center w-full aspect-square">
                            <Image
                              src={fileItem.previewUrl}
                              alt={`Preview ${index + 1}`}
                              width={500}
                              height={500}
                              className="
                                max-h-[500px] object-contain rounded-lg 
                                transition-transform duration-300 group-hover:scale-[1.02]
                              "
                            />
                          </div>

                          {/* 하단 정보(이미지 사이즈, 용량) */}
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                            <Badge
                              variant="secondary"
                              className={`
                                bg-gray-200 text-gray-700 border border-gray-300
                                dark:bg-black/40 dark:text-white
                              `}
                            >
                              {fileItem.dimensions
                                ? `${fileItem.dimensions.width}×${fileItem.dimensions.height}`
                                : 'Loading...'}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`
                                bg-gray-200 text-gray-700 border border-gray-300
                                dark:bg-black/40 dark:text-white
                              `}
                            >
                              {sizeMB} MB
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* 옵션 패널 */}
                      <div className="lg:w-1/2 space-y-6">
                        <div
                          className={`
                            bg-gray-100 border border-gray-200
                            dark:bg-gray-900/50 dark:border-none dark:backdrop-blur-sm
                            rounded-xl p-6
                          `}
                        >
                          <h3 className="text-lg font-semibold mb-4">
                            Processing Options
                          </h3>
                          <div className="space-y-6">
                            {PROCESSING_METHODS.map((method) => (
                              <div key={method.id} className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`${method.id}-${index}`}
                                    checked={
                                      fileItem.processingOption?.method ===
                                      method.id
                                    }
                                    onCheckedChange={() =>
                                      handleMethodToggle(index, method.id)
                                    }
                                    className="data-[state=checked]:bg-indigo-600"
                                  />
                                  <label
                                    htmlFor={`${method.id}-${index}`}
                                    className="text-sm font-medium"
                                  >
                                    {method.label}
                                  </label>
                                </div>

                                {/* uncrop 옵션 */}
                                {method.id === 'uncrop' &&
                                  fileItem.processingOption?.method ===
                                    'uncrop' && (
                                    <div
                                      className={`
                                        ml-8 p-4 rounded-lg shadow-sm
                                        bg-gray-200 
                                        dark:bg-gray-800/80
                                      `}
                                    >
                                      <RadioGroup
                                        value={
                                          fileItem.processingOption.aspectRatio
                                        }
                                        onValueChange={(value: string) =>
                                          handleAspectRatioChange(
                                            index,
                                            value as '1:1' | '1:2' | '2:1'
                                          )
                                        }
                                        className="space-y-2"
                                      >
                                        {ASPECT_RATIOS.map((ratio) => (
                                          <div
                                            key={ratio.id}
                                            className="flex items-center space-x-3"
                                          >
                                            <RadioGroupItem
                                              value={ratio.id}
                                              id={`${ratio.id}-${index}`}
                                              className="border-indigo-600 text-indigo-600"
                                            />
                                            <label
                                              htmlFor={`${ratio.id}-${index}`}
                                              className="text-sm"
                                            >
                                              {ratio.label}
                                            </label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                    </div>
                                  )}

                                {/* upscale 옵션 */}
                                {method.id === 'upscale' &&
                                  fileItem.processingOption?.method ===
                                    'upscale' && (
                                    <div
                                      className={`
                                        ml-8 p-4 rounded-lg shadow-sm
                                        bg-gray-200
                                        dark:bg-gray-800/80
                                      `}
                                    >
                                      <RadioGroup
                                        value={fileItem.processingOption.factor}
                                        onValueChange={(value: string) =>
                                          handleUpscaleFactorChange(
                                            index,
                                            value as 'x1' | 'x2' | 'x4'
                                          )
                                        }
                                        className="space-y-2"
                                      >
                                        {[
                                          {
                                            label: 'x1 (Sharpen)',
                                            value: 'x1',
                                          },
                                          { label: 'x2', value: 'x2' },
                                          { label: 'x4', value: 'x4' },
                                        ].map((option) => (
                                          <div
                                            key={option.value}
                                            className="flex items-center space-x-3"
                                          >
                                            <RadioGroupItem
                                              value={option.value}
                                              id={`upscale-${option.value}-${index}`}
                                              className="border-indigo-600 text-indigo-600"
                                            />
                                            <label
                                              htmlFor={`upscale-${option.value}-${index}`}
                                              className="text-sm"
                                            >
                                              {option.label}
                                            </label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                    </div>
                                  )}

                                {/* square 옵션 */}
                                {method.id === 'square' &&
                                  fileItem.processingOption?.method ===
                                    'square' && (
                                    <div
                                      className={`
                                        ml-8 p-4 rounded-lg
                                        bg-gray-200
                                        dark:bg-gray-800/80
                                      `}
                                    >
                                      <p className="text-sm">
                                        Square option is not yet implemented.
                                      </p>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
              <SwiperNavigation totalFiles={totalFiles} />
            </Swiper>

            {/* 에러 메시지 */}
            {uploadStatus.error && (
              <div
                className={`
                  mt-6 p-4 rounded-lg
                  bg-red-100 border border-red-300 text-red-600
                  dark:bg-red-900/20 dark:border-red-800 dark:text-red-400
                `}
              >
                <p className="text-center">{uploadStatus.error}</p>
              </div>
            )}

            {/* 업로드 진행 상황 */}
            {isUploading && (
              <div
                className={`
                  mt-6 p-6 rounded-lg
                  bg-indigo-100 
                  dark:bg-indigo-900/20
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <div className="space-y-1 text-center">
                    <p className="text-indigo-600 dark:text-indigo-400">
                      Uploading file {currentFileIndex} of {files.length}
                    </p>
                    <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${currentFileProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      {currentFileProgress}% Complete
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className={`
                  px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700
                  hover:bg-gray-200 transition-all duration-200
                  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
                `}
                disabled={uploadStatus.stage !== 'idle'}
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={
                  uploadStatus.stage !== 'idle' ||
                  !files.some((file) => file.processingOption !== null)
                }
                className={`
                  px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200
                  bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50
                  dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 dark:hover:translate-y-[-1px] dark:hover:shadow-lg
                `}
              >
                {uploadStatus.stage === 'getting-url' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Start Processing
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
