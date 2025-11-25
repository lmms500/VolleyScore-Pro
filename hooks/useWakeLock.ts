import { useEffect, useRef, useState, useCallback } from 'react';

export const useWakeLock = () => {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const requestLock = useCallback(async () => {
    // Verifica se o navegador suporta e se o documento está visível
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
        wakeLock.current.addEventListener('release', () => setIsLocked(false));
        setIsLocked(true);
        console.log('Wake Lock active');
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
        setIsLocked(false);
      }
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLock.current) {
      try {
        await wakeLock.current.release();
        wakeLock.current = null;
        setIsLocked(false);
      } catch (err) {
        console.warn('Wake Lock release failed:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Tenta ativar ao montar
    requestLock();
    
    // Reativa se o usuário sair e voltar para o app (troca de abas)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestLock();
      } else {
        // Opcional: liberar explicitamente quando oculto, embora o navegador geralmente faça isso
        releaseLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      releaseLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestLock, releaseLock]);

  return { isLocked, requestLock, releaseLock };
};