import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const installed = localStorage.getItem("pwa-installed");
    
    if (dismissed || installed) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem("pwa-installed", "true");
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS Safari (no beforeinstallprompt event)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    
    if (isIOS && !isStandalone && !dismissed && !installed) {
      // Show iOS-specific banner after a short delay
      setTimeout(() => setShowBanner(true), 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("pwa-installed", "true");
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="container max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">Installer l'application</h3>
            {isIOS && !deferredPrompt ? (
              <p className="text-sm text-muted-foreground">
                Appuyez sur <span className="font-medium">Partager</span> puis <span className="font-medium">"Sur l'écran d'accueil"</span> pour installer.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Installez l'app pour un accès rapide et hors-ligne.
              </p>
            )}
            {deferredPrompt && (
              <Button onClick={handleInstall} size="sm" className="mt-3">
                Installer
              </Button>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 h-8 w-8" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
