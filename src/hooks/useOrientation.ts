import { useState, useEffect } from 'react';

export const useOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Verifica se a largura é maior que a altura
      // ou usa a API de orientação se disponível
      const isLand = window.innerWidth > window.innerHeight;
      setIsLandscape(isLand);
    };

    checkOrientation();

    // Escuta mudanças de redimensionamento (que acontecem ao girar)
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return isLandscape;
};