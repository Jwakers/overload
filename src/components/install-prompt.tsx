"use client";

import { Check, Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  } | null>(null);

  useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandaloneMode = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    setIsIOS(isIOSDevice);
    setIsStandalone(isStandaloneMode);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired", e);
      e.preventDefault();
      setDeferredPrompt(
        e as unknown as {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: string }>;
        }
      );
    };

    // For non-iOS devices, show install prompt even without beforeinstallprompt
    // This allows users to manually install via browser menu
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setDeferredPrompt(null);
          toast.success("App installed successfully", {
            description:
              "Overload has been added to your home screen. Enjoy the app experience!",
          });
        } else {
          toast.info("Installation cancelled", {
            description:
              "You can install the app anytime using the browser menu.",
          });
        }
      } catch (error) {
        console.error("Install prompt error:", error);
        toast.error("Installation failed", {
          description: "There was an error with the installation prompt.",
        });
      }
    } else {
      // Fallback for when beforeinstallprompt is not available
      toast.info("Manual installation required", {
        description:
          "Click the install icon in your browser's address bar or use the browser menu to install this app.",
        action: {
          label: "Learn More",
          onClick: () => {
            window.open(
              "https://support.google.com/chrome/answer/9658361",
              "_blank"
            );
          },
        },
      });
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-success-muted rounded-full flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Install Overload</h3>
          <p className="text-sm text-muted-foreground">
            Get quick access and a better experience
          </p>
        </div>
      </div>

      {isIOS ? (
        <div className="space-y-4">
          <div className="bg-brand-muted/50 border border-brand/20 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-brand-foreground">
                  1
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Tap the Share button
                </p>
                <p className="text-xs text-muted-foreground">
                  Look for the share icon in your browser toolbar
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-muted/50 border border-brand/20 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-brand-foreground">
                  2
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Select &ldquo;Add to Home Screen&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">
                  Choose this option from the share menu
                </p>
              </div>
            </div>
          </div>

          <div className="bg-success-muted/50 border border-success/20 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-success-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Enjoy the app experience
                </p>
                <p className="text-xs text-muted-foreground">
                  Launch Overload from your home screen anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  deferredPrompt ? "bg-success" : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm text-muted-foreground">
                {deferredPrompt
                  ? "Available for installation"
                  : "Manual installation required"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleInstallClick} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              {deferredPrompt ? "Install Overload" : "Install via Browser"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
