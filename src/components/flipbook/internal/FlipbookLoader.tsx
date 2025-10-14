import React, { forwardRef, memo, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import PdfPage from './PdfPage';

const MemoizedPdfPage = memo(PdfPage);

type FlipbookLoaderProps = {
  pdfDetails: { totalPages: number; width: number; height: number };
  scale: number;
  viewerStates: { currentPageIndex: number; zoomScale: number };
  setViewerStates: (v: { currentPageIndex: number; zoomScale: number }) => void;
  viewRange: [number, number];
  setViewRange: (r: [number, number]) => void;
};

const FlipbookLoader = forwardRef<any, FlipbookLoaderProps>(
  ({ pdfDetails, scale, viewerStates, setViewerStates, viewRange, setViewRange }, ref) => {
    const isPageInViewRange = (index: number) => index >= viewRange[0] && index <= viewRange[1];
    const isPageInView = (index: number) => viewerStates.currentPageIndex === index || viewerStates.currentPageIndex + 1 === index;

    const onFlip = useCallback(
      (e: any) => {
        let newViewRange: [number, number];
        if (e.data > viewerStates.currentPageIndex) {
          newViewRange = [viewRange[0], Math.max(Math.min(e.data + 4, pdfDetails.totalPages), viewRange[1])];
        } else if (e.data < viewerStates.currentPageIndex) {
          newViewRange = [Math.min(Math.max(e.data - 4, 0), viewRange[0]), viewRange[1]];
        } else {
          newViewRange = viewRange;
        }
        setViewRange(newViewRange);
        setViewerStates({ ...viewerStates, currentPageIndex: e.data });
      },
      [viewerStates, viewRange, setViewRange, setViewerStates, pdfDetails.totalPages]
    );


    return (
      <div className="relative">
        <HTMLFlipBook
          ref={ref}
          key={scale}
          startPage={viewerStates.currentPageIndex}
          width={pdfDetails.width * scale * 5}
          height={pdfDetails.height * scale * 5}
          size="stretch"
          drawShadow={false}
          flippingTime={700}
          usePortrait={false}
          showCover={true}
          showPageCorners={false}
          onFlip={onFlip}
          disableFlipByClick={window.innerWidth < 768 ? true : false}
          className={viewerStates.zoomScale > 1 ? 'pointer-events-none md:pointer-events-none' : ''}
        >
          {Array.from({ length: pdfDetails.totalPages }, (_, index) => (
            <MemoizedPdfPage
              key={index}
              height={pdfDetails.height * scale}
              zoomScale={viewerStates.zoomScale}
              page={index + 1}
              isPageInViewRange={isPageInViewRange(index)}
              isPageInView={isPageInView(index)}
            />
          ))}
        </HTMLFlipBook>
      </div>
    );
  }
);

FlipbookLoader.displayName = 'FlipbookLoader';
export default FlipbookLoader;


