import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar se é iOS (iPhone/iPad)
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detectar se já está rodando como app (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    // Capturar evento de instalação (Android/Chrome)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // No iOS, sempre mostramos o botão se não estiver instalado
    if (iOS && !isStandalone) {
      setIsInstallable(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    // Lógica para Android/Desktop
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        // Opcional: esconder botão após aceitar
      }
    } 
  };

  return { isInstallable, install, isIOS };
};