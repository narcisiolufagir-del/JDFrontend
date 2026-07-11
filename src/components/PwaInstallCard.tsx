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

export function PwaInstallCard() {
  const { canInstall, isIOS, hasNativePrompt, promptInstall, dismiss } = usePwaInstall();
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!canInstall) return null;

  const handleInstall = async () => {
    if (!hasNativePrompt) {
      setOpen(true);
      return;
    }
    setInstalling(true);
    try {
      await promptInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-3 text-left min-w-0"
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
                  Acesso rápido a notícias e jornais no telemóvel
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
            onClick={dismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <p className="text-sm text-gray-600">
              Instale o <strong>O Destaque</strong> no ecrã inicial para abrir como app, sem precisar do browser.
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
                <p className="text-xs font-semibold text-gray-700">No iPhone / iPad:</p>
                <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                  <li className="flex items-start gap-1.5">
                    <span>Toque em</span>
                    <Share className="w-3.5 h-3.5 inline shrink-0 mt-0.5" />
                    <span><strong>Partilhar</strong> no Safari</span>
                  </li>
                  <li>Escolha <strong>Adicionar ao Ecrã Principal</strong></li>
                  <li>Confirme em <strong>Adicionar</strong></li>
                </ol>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Abra o menu do browser (⋮) e escolha <strong>Instalar app</strong> ou{" "}
                  <strong>Adicionar ao ecrã inicial</strong>.
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
