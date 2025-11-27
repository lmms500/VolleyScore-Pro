import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar o ciclo de vida do Service Worker e atualizações.
 */
export const useServiceWorker = () => {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Função para forçar a atualização do Service Worker
  const updateApp = useCallback(() => {
    if (registration && registration.waiting) {
      // 1. Envia a mensagem para o SW em waiting para que ele chame skipWaiting()
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // 2. Limpa o estado e força o reload da página após o controle ser assumido
      const controllerChangeHandler = () => {
        window.location.reload();
      };

      // Escuta quando o novo SW assumir o controle
      navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
      setNeedsUpdate(false); 
    }
  }, [registration]);

  useEffect(() => {
    // CRÍTICO: Registra o SW apenas em ambiente de produção para evitar conflitos com HMR
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      
      const swUrl = `/service-worker.js`;

      navigator.serviceWorker.register(swUrl)
        .then((reg) => {
          setRegistration(reg);

          // Escuta por uma atualização
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;

            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Novo conteúdo disponível e pronto para ser ativado (waiting)
                    setNeedsUpdate(true);
                  } else {
                    // Primeiro registro: conteúdo foi cacheado.
                    console.log('Service Worker installed successfully.');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
        
    }
    
    // Se não for produção (DEV), garante que o SW não seja usado.
    if (!import.meta.env.PROD) {
        console.log('Service Worker registration skipped in development environment.');
    }
    
  }, []);
  
  // Adiciona listener para a mensagem de skipWaiting
  useEffect(() => {
    if (registration && registration.waiting) {
        // Se já houver um waiting worker ao carregar, dispara o prompt de atualização
        setNeedsUpdate(true);
    }
  }, [registration]);


  return { needsUpdate, updateApp, registration };
};