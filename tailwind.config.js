export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0A0E17',
          page: '#090C12',
        },
        card: {
          DEFAULT: '#151B2B',
          alt: '#1C2333',
        },
        border: {
          DEFAULT: '#1F2937',
          alt: '#1C2333',
        },
        primary: {
          DEFAULT: '#00D6A3',
          dim: 'rgba(0, 214, 163, 0.1)',
          border: 'rgba(0, 214, 163, 0.25)',
        },
        secondary: {
          DEFAULT: '#0084FF',
          dim: 'rgba(0, 132, 255, 0.1)',
        },
        danger: {
          DEFAULT: '#FF4E4E',
          dim: 'rgba(255, 78, 78, 0.1)',
        },
        warning: {
          DEFAULT: '#F5A623',
          dim: 'rgba(245, 166, 35, 0.1)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0ABC0',
          subtle: '#707B90',
          disabled: '#8E98A8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        '3xl': ['32px', '40px'],
        'hero': ['40px', '48px'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
        xxl: '32px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
    },
  },
  plugins: [],
}
