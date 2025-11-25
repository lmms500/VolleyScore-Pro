import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  // Função que recarrega a página com a nova versão
  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    window.location.reload();
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('SW registrado:', registration.scope);

          // Se já tem um SW esperando (atualização baixada mas não ativa)
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowReload(true);
          }

          // Monitora novas instalações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                // Se instalou e tem um controlador anterior, é atualização!
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setShowReload(true);
                }
              });
            }
          });
        })
        .catch((err) => console.error('Erro SW:', err));

      // Recarrega quando o novo SW assumir o controle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  return { showReload, reloadPage };
};