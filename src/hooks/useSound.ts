import { useCallback, useEffect, useState } from 'react';
import { Language } from '../types';

export const useSound = (lang: Language, enabled: boolean = true) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  // Navegadores bloqueiam áudio até a primeira interação do usuário (clique/toque)
  useEffect(() => {
    const unlock = () => setHasInteracted(true);
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Gera um beep simples usando OscillatorNode (sem arquivos externos)
  const playBeep = useCallback((freq = 600, duration = 100) => {
     if (!enabled || !hasInteracted) return;
     try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = freq;
        gain.gain.value = 0.05; // Volume baixo para não incomodar
        osc.type = 'sine';
        
        osc.start();
        setTimeout(() => {
            osc.stop();
            ctx.close(); // Importante fechar para liberar memória
        }, duration);
     } catch (e) {
         console.error('Audio Context Error:', e);
     }
  }, [enabled, hasInteracted]);

  // Texto para Fala (TTS)
  const speak = useCallback((text: string) => {
    if (!enabled || !window.speechSynthesis) return;
    
    // Cancela falas anteriores pendentes
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Tenta ajustar o idioma base
    utterance.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = 1.2; // Um pouco mais rápido para dinâmica de jogo
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }, [enabled, lang]);

  return { speak, playBeep };
};