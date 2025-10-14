import React, { memo, useState, useEffect, useCallback } from 'react';
import FlipbookLoader from './FlipbookLoader';
import { TransformComponent } from 'react-zoom-pan-pinch';

type FlipbookProps = {
  viewerStates: { currentPageIndex: number; zoomScale: number };
  setViewerStates: (v: { currentPageIndex: number; zoomScale: number }) => void;
  flipbookRef: any;
  screenfull: any;
  pdfDetails: { totalPages: number; width: number; height: number };
};

const Flipbook = memo(({ viewerStates, setViewerStates, flipbookRef, pdfDetails }: FlipbookProps) => {
  const [scale, setScale] = useState(1);
  const [wrapperCss, setWrapperCss] = useState<React.CSSProperties>({});
  const [viewRange, setViewRange] = useState<[number, number]>([0, 4]);

  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.flipbook-container');
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Ajustar escala para melhor legibilidade - usar 80% do espaço disponível
      const availableWidth = width * 0.8;
      const availableHeight = height * 0.8;
      const calculatedScale = Math.min(availableWidth / (2 * pdfDetails.width), availableHeight / pdfDetails.height);
      
      setScale(calculatedScale);
      setWrapperCss({
        width: `${pdfDetails.width * calculatedScale}px`,
        height: `${pdfDetails.height * calculatedScale}px`,
        margin: '0 auto',
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDetails]);

  const shrinkPageLoadingRange = useCallback(() => {
    setViewRange([
      Math.max(viewerStates.currentPageIndex - 2, 0),
      Math.min(viewerStates.currentPageIndex + 2, pdfDetails.totalPages),
    ]);
  }, [viewerStates.currentPageIndex, pdfDetails.totalPages]);

  useEffect(() => {
    const onFsChange = () => {
      shrinkPageLoadingRange();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [shrinkPageLoadingRange]);

  return (
    <div className="flipbook-container relative h-[20rem] xs:h-[25rem] lg:h-[35rem] xl:h-[40rem] w-full bg-transparent flex justify-center items-center overflow-hidden">
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
        <div className='overflow-hidden flex justify-center items-center h-full w-full'>
          {pdfDetails && scale && (
            <div style={wrapperCss}>
              <FlipbookLoader
                ref={flipbookRef}
                pdfDetails={pdfDetails}
                scale={scale}
                viewRange={viewRange}
                setViewRange={setViewRange}
                viewerStates={viewerStates}
                setViewerStates={setViewerStates}
              />
            </div>
          )}
        </div>
      </TransformComponent>
    </div>
  );
});

Flipbook.displayName = 'Flipbook';
export default Flipbook;


