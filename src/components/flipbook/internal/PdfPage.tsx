import React, { forwardRef, memo } from 'react';
import { Page } from 'react-pdf';

type PdfPageProps = {
  page: number;
  height: number;
  zoomScale: number;
  isPageInView: boolean;
  isPageInViewRange: boolean;
};

const PdfPage = forwardRef<HTMLDivElement, PdfPageProps>(({ page, height, zoomScale, isPageInView, isPageInViewRange }, ref) => {
  return (
    <div ref={ref} className={`${page % 2 === 0 ? 'bg-white' : 'bg-gray-50'} shadow-lg border border-gray-200`}>
      {isPageInViewRange && (
        <Page
          devicePixelRatio={isPageInView && zoomScale > 1.5 ? Math.min(zoomScale * window.devicePixelRatio, 3) : window.devicePixelRatio}
          height={height}
          pageNumber={page}
          loading={<div className="flex items-center justify-center h-full">Carregando...</div>}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          className="border-r border-gray-300"
        />
      )}
    </div>
  );
});

PdfPage.displayName = 'PdfPage';
export default memo(PdfPage);


