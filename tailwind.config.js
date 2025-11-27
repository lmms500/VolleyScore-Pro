/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'vs-dark': '#020617', // Fundo principal escuro (Slate 950)
        'vs-indigo': '#4f46e5', // Indigo 600
        'vs-rose': '#e11d48', // Rose 600
      },
      fontFamily: {
        // Usar uma fonte sans-serif moderna e limpa para o corpo
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Garantir a fonte Black para o Placar (para o efeito 'metallic')
        black: ['Inter Black', 'Arial Black', 'sans-serif'], 
      },
      // Animação de spin mais lenta para ícones como o SW update
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      // Gradiente Radial (Spotlight/Vignette)
      backgroundImage: {
        'radial-vignette-indigo': 'radial-gradient(circle at center, rgba(79, 70, 229, 0.15) 0%, rgba(2, 6, 23, 0) 70%)',
        'radial-vignette-rose': 'radial-gradient(circle at center, rgba(225, 29, 72, 0.15) 0%, rgba(2, 6, 23, 0) 70%)',
      },
    },
  },
  plugins: [],
}