module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FDE7F3',
          blue: '#DFF3FF',
          mint: '#D9F7E8',
          yellow: '#FFF4C2',
          peach: '#FFE5D3',
          lilac: '#E9E0FF',
        },
        cartoon: {
          ink: '#2C2A3A',
          sky: '#BFEAFF',
          mint: '#B9F1C2',
          peach: '#F9C7A7',
          cream: '#FFFDF7',
          sage: '#DBF0E6',
        },
      },
      borderRadius: {
        ultra: '2rem',
        comic: '2.5rem',
      },
      boxShadow: {
        cartoon: '0 8px 0 #2C2A3A',
        'cartoon-soft': '0 10px 0 rgba(44,42,58,0.9)',
      },
      fontFamily: {
        display: ['Mali', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        floaty: 'floaty 3s ease-in-out infinite',
        'bounce-soft': 'bounce 0.8s ease-in-out 1',
      },
    },
  },
  plugins: [],
};
