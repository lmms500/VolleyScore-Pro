import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  // Função chamada quando o usuário clica no botão "Atualizar"
  const reloadPage = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  useEffect(() => {
    // Só registra em produção para evitar loops durante desenvolvimento
    // @ts-ignore
    const isProd = import.meta.env.PROD;
    if (!isProd) return;

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          // Se já tem uma atualização esperando
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowReload(true);
          }

          // Monitora novas atualizações chegando
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setShowReload(true);
                }
              });
            }
          });
        })
        .catch((err) => console.error('Erro SW:', err));

      // --- PROTEÇÃO CONTRA LOOP INFINITO ---
      // Variável local para garantir que só recarregamos uma vez
      let refreshing = false;

      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return { showReload, reloadPage };
};