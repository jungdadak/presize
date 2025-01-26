'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Card, CardContent } from '@/components/card';
import { FileItem } from '@/store/fileStore';
import { useFileProcessing } from '@/hooks/useFileProcessing';

import ImagePreview from '@/components/ImagePreview';
import ProcessingOptions from '@/components/ProcessingOptions';
import Header from '@/components/PreviewHeader';
import ActionButtons from '@/components/ActionButtons';
import SwiperNavigation from '@/components/Swiper/SwiperNavigation';

import 'swiper/css';
import 'swiper/css/pagination';

export default function PollingPreviewPage() {
  const {
    files,
    totalFiles,
    totalSize,
    uploadStatus,

    stage,
    handleMethodToggle,
    handleAspectRatioChange,
    handleUpscaleFactorChange,
    handleSquareTargetResChange,
    handleRemoveFile,
    handleCancel,
    handleProcess,
  } = useFileProcessing();

  return (
    <div className="min-h-screen py-12 transition-colors duration-300 bg-white text-gray-900 dark:bg-[#141414]">
      {' '}
      <h1 className="text-cyan-400 text-center mb-10 font-bold text-4xl">
        폴링테스트 페이지 입니당
      </h1>
      <Header totalFiles={totalFiles} totalSize={totalSize} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 bg-white text-gray-900 dark:bg-[#141414] dark:text-gray-100 dark:backdrop-blur-sm">
          <CardContent className="p-0">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={40}
              slidesPerView={1}
            >
              {files.map((fileItem: FileItem, index: number) => (
                <SwiperSlide key={index} className="p-4">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <ImagePreview
                      fileItem={fileItem}
                      index={index}
                      onRemove={handleRemoveFile}
                    />
                    <div className="lg:w-1/2">
                      <div className="flex flex-col w-full">
                        <ProcessingOptions
                          fileItem={fileItem}
                          index={index}
                          onMethodToggle={handleMethodToggle}
                          onAspectRatioChange={handleAspectRatioChange}
                          onUpscaleFactorChange={handleUpscaleFactorChange}
                          onSquareTargetResChange={handleSquareTargetResChange}
                        />
                      </div>{' '}
                      <SwiperNavigation totalFiles={totalFiles} />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <ActionButtons
              onCancel={handleCancel}
              onProcess={handleProcess}
              stage={stage}
              uploadStatus={uploadStatus}
              hasValidOptions={files.every(
                (file) => file.processingOption !== null
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
