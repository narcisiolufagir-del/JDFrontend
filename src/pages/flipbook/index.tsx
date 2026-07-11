import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, adminAPI, buildFileUrl } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Monitor, FileText } from 'lucide-react';
import type { Jornal } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const BRAND = "#2B58C5";

export default function FlipBook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [jornal, setJornal] = useState<Jornal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('ID do jornal não fornecido');
      setLoading(false);
      return;
    }

    const fetchJornal = async () => {
      try {
        setLoading(true);
        const jornalData = isAdmin
          ? await adminAPI.getJornal(parseInt(id))
          : await userAPI.getJornal(parseInt(id));
        setJornal(jornalData);
      } catch (err: unknown) {
        console.error('Erro ao carregar jornal:', err);
        setError('Erro ao carregar o jornal. Verifique se você tem acesso.');
      } finally {
        setLoading(false);
      }
    };

    fetchJornal();
  }, [id, isAdmin]);

  const handleDownload = () => {
    if (jornal?.arquivopdf) {
      const pdfUrl = buildFileUrl(jornal.arquivopdf);
      window.open(pdfUrl, '_blank');
    }
  };

  const toggleViewer = () => {
    setUseFallback((prev) => !prev);
    setIframeLoading(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: BRAND }} />
          <p className="text-gray-500 text-sm">A carregar jornal...</p>
        </div>
      </div>
    );
  }

  if (error || !jornal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar jornal</h2>
          <p className="text-gray-500 text-sm mb-4">{error || 'Jornal não encontrado'}</p>
          <Button onClick={() => navigate('/jornais')} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos jornais
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        {/* Mobile toolbar */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-3 h-14">
            <button
              type="button"
              onClick={() => navigate('/jornais')}
              className="p-2 -ml-1 text-gray-800"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0 px-2 text-center">
              <h1 className="text-sm font-semibold text-gray-900 truncate">{jornal.titulo}</h1>
              <p className="text-[11px] text-gray-400">
                {new Date(jornal.data_publicacao).toLocaleDateString('pt-PT')}
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={toggleViewer}
                className="p-2 text-gray-700"
                aria-label={useFallback ? 'Modo Google Viewer' : 'Modo directo'}
              >
                {useFallback ? <Monitor className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 text-gray-700"
                aria-label="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop toolbar */}
        <div className="hidden lg:block">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Button
                  onClick={() => navigate('/jornais')}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">{jornal.titulo}</h1>
                  <p className="text-sm text-gray-400">
                    {new Date(jornal.data_publicacao).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button onClick={toggleViewer} variant="outline" size="sm">
                  {useFallback ? 'Google Viewer' : 'Download Directo'}
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-2 sm:px-4 py-2 sm:py-4">
        <div className="mx-auto max-w-7xl h-full bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
          <div className="h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-5.5rem)] relative">
            {useFallback ? (
              <iframe
                src={buildFileUrl(jornal.arquivopdf)}
                className="w-full h-full border-0"
                title={jornal.titulo}
                allowFullScreen
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setError('Erro ao carregar o visualizador. Tente fazer download do PDF.');
                }}
              />
            ) : (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(buildFileUrl(jornal.arquivopdf) || '')}&embedded=true`}
                className="w-full h-full border-0"
                title={jornal.titulo}
                allowFullScreen
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setError('Erro ao carregar o visualizador. Tente fazer download do PDF.');
                }}
              />
            )}
            {iframeLoading && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: BRAND }} />
                  <p className="text-gray-500 text-sm">
                    {useFallback ? 'A carregar PDF...' : 'A carregar visualizador...'}
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
