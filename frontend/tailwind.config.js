/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        lg: '1rem',
                        md: 'calc(1rem - 2px)',
                        sm: 'calc(1rem - 4px)',
                        'xl': '0.75rem',
                        '2xl': '1rem',
                        '3xl': '1.5rem',
                        'full': '9999px'
                },
                colors: {
                        background: '#FDFBF7',
                        foreground: '#2D3436',
                        card: {
                                DEFAULT: '#FFFFFF',
                                foreground: '#2D3436'
                        },
                        popover: {
                                DEFAULT: '#FFFFFF',
                                foreground: '#2D3436'
                        },
                        primary: {
                                DEFAULT: '#E76F51',
                                foreground: '#FFFFFF'
                        },
                        secondary: {
                                DEFAULT: '#264653',
                                foreground: '#FFFFFF'
                        },
                        muted: {
                                DEFAULT: '#F4F1EA',
                                foreground: '#64748B'
                        },
                        accent: {
                                DEFAULT: '#E9C46A',
                                foreground: '#264653'
                        },
                        destructive: {
                                DEFAULT: '#EF476F',
                                foreground: '#FFFFFF'
                        },
                        border: '#E5E0D8',
                        input: '#FFFFFF',
                        ring: '#E76F51',
                        chart: {
                                '1': '#E76F51',
                                '2': '#2A9D8F',
                                '3': '#E9C46A',
                                '4': '#F4A261',
                                '5': '#264653'
                        }
                },
                fontFamily: {
                        fraunces: ['Fraunces', 'serif'],
                        nunito: ['Nunito', 'sans-serif'],
                },
                boxShadow: {
                        'pop': '4px 4px 0px 0px rgba(38, 70, 83, 0.1)',
                        'pop-hover': '6px 6px 0px 0px rgba(38, 70, 83, 0.15)',
                },
                keyframes: {
                        'accordion-down': {
                                from: {
                                        height: '0'
                                },
                                to: {
                                        height: 'var(--radix-accordion-content-height)'
                                }
                        },
                        'accordion-up': {
                                from: {
                                        height: 'var(--radix-accordion-content-height)'
                                },
                                to: {
                                        height: '0'
                                }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};