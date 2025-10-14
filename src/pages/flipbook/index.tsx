import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, adminAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import type { Jornal } from '@/types/api';
import FlipbookViewer from '@/components/flipbook/FlipbookViewer';
import { useAuth } from '@/contexts/AuthContext';

export default function FlipBook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [jornal, setJornal] = useState<Jornal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(true);
  const [pdfViewerError, setPdfViewerError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('ID do jornal não fornecido');
      setLoading(false);
      return;
    }

    const fetchJornal = async () => {
      try {
        setLoading(true);
        // Admin usa adminAPI, usuário comum usa userAPI
        const jornalData = isAdmin 
          ? await adminAPI.getJornal(parseInt(id))
          : await userAPI.getJornal(parseInt(id));
        setJornal(jornalData);
      } catch (error: any) {
        console.error('Erro ao carregar jornal:', error);
        setError('Erro ao carregar o jornal. Verifique se você tem acesso.');
      } finally {
        setLoading(false);
      }
    };

    fetchJornal();
  }, [id, isAdmin]);

  const handleDownload = () => {
    if (jornal?.arquivopdf) {
      window.open(jornal.arquivopdf, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const handleIframeError = () => {
    setIframeLoading(false);
    setError('Erro ao carregar o visualizador. Tente fazer download do PDF.');
  };

  const handlePdfViewerError = () => {
    setPdfViewerError(true);
    setUseFallback(true); // Auto switch to fallback
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando jornal...</p>
        </div>
      </div>
    );
  }

  if (error || !jornal) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-destructive mb-2">Erro ao carregar jornal</h2>
            <p className="text-muted-foreground mb-4">{error || 'Jornal não encontrado'}</p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-xl border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="bg-background/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  {jornal.titulo}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {new Date(jornal.data_publicacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setUseFallback(!useFallback);
                  setPdfViewerError(false);
                }}
                variant="outline"
                size="sm"
                className="bg-background/50"
              >
                {useFallback ? 'Google Viewer' : 'Download Direto'}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="bg-background/50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Flipbook Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card/50 backdrop-blur-xl rounded-lg border border-primary/20 overflow-hidden">
          <div className="h-[calc(100vh-200px)] min-h-[600px] relative">
            {useFallback ? (
              <div className="w-full h-full">
                <iframe
                  src={jornal.arquivopdf}
                  className="w-full h-full border-0"
                  title={jornal.titulo}
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </div>
            ) : (
              <div className="w-full h-full">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(jornal.arquivopdf)}&embedded=true`}
                  className="w-full h-full border-0"
                  title={jornal.titulo}
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </div>
            )}
            {iframeLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {useFallback ? 'Carregando PDF...' : 'Carregando visualizador...'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Se o PDF não carregar, tente alternar o modo de visualização ou use o botão Download PDF
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
