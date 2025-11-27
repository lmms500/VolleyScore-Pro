import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar o Screen Wake Lock: previne que a tela se apague.
 * @param isActive Se true, tenta adquirir o Wake Lock.
 */
export const useWakeLock = (isActive: boolean) => {
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && !isLocked) {
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          console.log('Wake Lock released');
          setIsLocked(false);
        });
        setWakeLock(sentinel);
        setIsLocked(true);
        console.log('Wake Lock acquired');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
        setIsLocked(false);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release();
      setWakeLock(null);
      setIsLocked(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      requestWakeLock();
      
      // Re-adquire o lock se a tela for re-focada (pode ser perdido ao mudar de aba)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isActive && !isLocked) {
          requestWakeLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleWakeLockOnFullscreenChange);

      return () => {
        releaseWakeLock();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleWakeLockOnFullscreenChange);
      };
    } else {
      releaseWakeLock();
    }
    
  }, [isActive]);
  
  // Função auxiliar para Wake Lock em Fullscreen (se o navegador exigir)
  const handleWakeLockOnFullscreenChange = () => {
      // Alguns navegadores soltam o lock ao entrar/sair de fullscreen.
      // Re-adquirimos se o lock estiver ativo.
      if (document.fullscreenElement && isActive && !isLocked) {
          requestWakeLock();
      }
  };

  return { isLocked, releaseWakeLock, requestWakeLock };
};