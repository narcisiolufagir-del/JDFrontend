import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed-session";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectIOS() {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

function detectAndroid() {
  return /Android/i.test(window.navigator.userAgent);
}

/** Já está dentro de app nativa / WebView — não faz sentido pedir instalação PWA */
function detectInAppShell() {
  const ua = window.navigator.userAgent;
  return /; wv\)|\(.*wv.*\)|WebView/i.test(ua);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(detectInstalled);
  const [isIOS, setIsIOS] = useState(detectIOS);
  const [isAndroid, setIsAndroid] = useState(detectAndroid);
  const [inAppShell, setInAppShell] = useState(detectInAppShell);
  const [isDismissed, setIsDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1"
  );

  useEffect(() => {
    setIsIOS(detectIOS());
    setIsAndroid(detectAndroid());
    setInAppShell(detectInAppShell());

    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Mostrar sempre que não está instalado como PWA (excepto se o user fechou nesta sessão)
  const canInstall = !isInstalled && !isDismissed;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setIsInstalled(true);
    return outcome === "accepted";
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setIsDismissed(true);
  }, []);

  return {
    canInstall,
    isInstalled,
    isIOS,
    isAndroid,
    hasNativePrompt: Boolean(deferredPrompt),
    promptInstall,
    dismiss,
  };
}

export function formatPaidJornaisCount(count: number): string {
  if (count === 1) return "1 jornal pago";
  return `${count} jornais pagos`;
}
