import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import Flipbook from './internal/Flipbook';
import screenfull from 'screenfull';
import { TransformWrapper } from 'react-zoom-pan-pinch';
import { Document, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { buildFileUrl } from '@/services/api';
import './flipbook.css';

// pdf.js worker for react-pdf - using local worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type FlipbookViewerProps = {
  pdfUrl: string;
  className?: string;
  onError?: () => void;
};

export default function FlipbookViewer({ pdfUrl, className, onError }: FlipbookViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flipbookRef = useRef<any>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [pdfDetails, setPdfDetails] = useState<null | { totalPages: number; width: number; height: number }>(null);
  const [viewerStates, setViewerStates] = useState({ currentPageIndex: 0, zoomScale: 1 });

  const onDocumentLoadSuccess = useCallback(async (document: any) => {
    try {
      const pageDetails = await document.getPage(1);
      setPdfDetails({
        totalPages: document.numPages,
        width: pageDetails.view[2],
        height: pageDetails.view[3],
      });
      setPdfLoading(false);
      setPdfError(false);
    } catch (err) {
      console.error('Error loading document:', err);
      setPdfError(true);
      setPdfLoading(false);
      onError?.();
    }
  }, [onError]);

  // Força o carregamento do PDF via fetch para evitar o visualizador nativo
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        // Use buildFileUrl to ensure we have the correct base URL
        const fullPdfUrl = buildFileUrl(pdfUrl) || pdfUrl;
        const response = await fetch(fullPdfUrl, {
          headers: {
            'Accept': 'application/pdf',
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setPdfBlob(blobUrl);
        } else {
          console.error('Failed to fetch PDF:', response.status, response.statusText);
          onError?.();
        }
      } catch (error) {
        console.error('Error fetching PDF:', error);
        onError?.();
      }
    };
    fetchPdf();
  }, [pdfUrl, onError]);

  const onDocumentLoadError = useCallback((error: any) => {
    console.error('PDF load error:', error);
    setPdfError(true);
    setPdfLoading(false);
    onError?.();
  }, [onError]);

  // Memoizar as opções para evitar recarregamentos desnecessários
  const pdfOptions = useMemo(() => ({
    cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  if (pdfError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <div className="text-center p-6">
          <div className="text-destructive mb-2">Erro ao carregar PDF</div>
          <p className="text-sm text-muted-foreground">
            O visualizador não conseguiu carregar o PDF. Tente usar o modo de download direto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative h-[25rem] xs:h-[30rem] lg:h-[40rem] xl:h-[45rem] bg-gray-100 w-full overflow-hidden ${className ?? ''}`}>
      {pdfLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando visualizador...</p>
          </div>
        </div>
      )}
      <Document 
        file={pdfBlob || pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess} 
        onLoadError={onDocumentLoadError}
        loading={<></>}
        options={pdfOptions}
      >
        {pdfDetails && !pdfLoading && (
          <TransformWrapper
            doubleClick={{ disabled: true }}
            pinch={{ step: 2 }}
            disablePadding={viewerStates.zoomScale <= 1}
            initialScale={1}
            minScale={1}
            maxScale={5}
            onTransformed={({ state }) => setViewerStates({ ...viewerStates, zoomScale: state.scale })}
          >
            <div className="w-full relative bg-foreground flex flex-col justify-between">
              <Flipbook
                viewerStates={viewerStates}
                setViewerStates={setViewerStates}
                flipbookRef={flipbookRef}
                screenfull={screenfull}
                pdfDetails={pdfDetails}
              />
            </div>
          </TransformWrapper>
        )}
      </Document>
    </div>
  );
}


