import { useState } from "react";
import { ChevronDown, Download, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { cn } from "@/lib/utils";

const BRAND = "#2B58C5";

type PwaInstallCardProps = {
  variant?: "inline" | "fixed";
};

export function PwaInstallCard({ variant = "inline" }: PwaInstallCardProps) {
  const { canInstall, isIOS, isAndroid, hasNativePrompt, promptInstall, dismiss } =
    usePwaInstall();
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!canInstall) return null;

  const handleInstall = async () => {
    if (hasNativePrompt) {
      setInstalling(true);
      try {
        await promptInstall();
      } finally {
        setInstalling(false);
      }
      return;
    }
    setOpen(true);
  };

  const card = (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden",
          variant === "fixed" && "shadow-lg"
        )}
      >
        <div className="flex items-center gap-2 p-3 sm:p-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-3 text-left min-w-0"
              onClick={() => setOpen((v) => !v)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BRAND}15` }}
              >
                <Smartphone className="w-5 h-5" style={{ color: BRAND }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">Instalar a app</p>
                <p className="text-xs text-gray-400 truncate">
                  Notícias e jornais no ecrã inicial
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-gray-400 shrink-0 transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <CollapsibleContent>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 pt-3 space-y-3">
            <p className="text-sm text-gray-600">
              Instale o <strong>O Destaque</strong> para abrir como app, sem precisar do browser.
            </p>

            {hasNativePrompt ? (
              <Button
                className="w-full text-white h-11"
                style={{ backgroundColor: BRAND }}
                onClick={handleInstall}
                disabled={installing}
              >
                <Download className="w-4 h-4 mr-2" />
                {installing ? "A instalar..." : "Instalar agora"}
              </Button>
            ) : isIOS ? (
              <div className="rounded-xl bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-700">No iPhone / iPad (Safari):</p>
                <ol className="text-xs text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Toque em <Share className="w-3.5 h-3.5 inline" /> <strong>Partilhar</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span><strong>Adicionar ao Ecrã Principal</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Confirme em <strong>Adicionar</strong></span>
                  </li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div className="rounded-xl bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-700">No Android (Chrome):</p>
                <ol className="text-xs text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Toque no menu <strong>⋮</strong> do browser</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Escolha <strong>Instalar app</strong> ou <strong>Adicionar ao ecrã inicial</strong></span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  No menu do browser, escolha <strong>Instalar aplicação</strong> ou{" "}
                  <strong>Adicionar ao ecrã inicial</strong>.
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );

  if (variant === "fixed") {
    return (
      <div className="lg:hidden fixed bottom-[66px] left-0 right-0 z-40 px-3 pointer-events-none">
        <div className="pointer-events-auto max-w-lg mx-auto">{card}</div>
      </div>
    );
  }

  return card;
}
