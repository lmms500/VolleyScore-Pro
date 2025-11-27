import { useState, useEffect, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Funções de detecção de plataforma
const isIOSDevice = () => {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
};

const isSafariBrowser = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('crios');
};

const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  // Verifica o modo standalone (iOS e Android)
  return window.matchMedia('(display-mode: standalone)').matches ||
         ('standalone' in window.navigator && (window.navigator as any).standalone);
};


export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode());
  const [isIOS, setIsIOS] = useState(isIOSDevice());
  const [isStandalone, setIsStandalone] = useState(isStandaloneMode());
  
  // Lógica para controle da exibição das instruções iOS (mostra apenas uma vez)
  const [showInstructions, setShowInstructions] = useState(false);
  
  // 1. Monitora o status de instalação/standalone
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const checkDisplay = () => {
      const standalone = isStandaloneMode();
      setIsInstalled(standalone);
      setIsStandalone(standalone);
    };

    mediaQuery.addEventListener('change', checkDisplay);
    window.addEventListener('appinstalled', checkDisplay);

    // Inicializa a verificação
    checkDisplay();
    
    return () => {
      mediaQuery.removeEventListener('change', checkDisplay);
      window.removeEventListener('appinstalled', checkDisplay);
    };
  }, []);

  // 2. Armazena o evento de instalação (Android/Chrome)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);
  
  // 3. Lógica para exibir o prompt iOS/Safari (só se não estiver instalado)
  useEffect(() => {
      // Condição: É iOS E está no Safari E NÃO está instalado E nunca mostramos antes
      if (isIOS && isSafariBrowser() && !isInstalled && !localStorage.getItem('ios_pwa_instructed')) {
          const timer = setTimeout(() => {
              setShowInstructions(true);
              localStorage.setItem('ios_pwa_instructed', 'true'); // Marca para não mostrar de novo
          }, 5000); // Mostra após 5 segundos
          return () => clearTimeout(timer);
      }
  }, [isIOS, isInstalled]);

  // Função para disparar o prompt
  const installPWA = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null); 
      });
    }
  }, [deferredPrompt]);
  
  // Função para fechar e dispensar as instruções iOS
  const dismissInstructions = useCallback(() => {
      setShowInstructions(false);
  }, []);

  // Retorna todas as propriedades necessárias
  return { 
      deferredPrompt, 
      isInstalled, 
      installPWA, 
      isIOS, 
      isStandalone, 
      showInstructions, 
      dismissInstructions 
  };
};