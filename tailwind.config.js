/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          primaryNuxt: 'var(--ui-primary)',
          secondaryNuxt: 'var(--ui-secondary)',
          success: 'var(--ui-success)',
          info: 'var(--ui-info)',
          warning: 'var(--ui-warning)',
          error: 'var(--ui-error)',
          
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
          chart: {
            1: 'hsl(var(--chart-1))',
            2: 'hsl(var(--chart-2))',
            3: 'hsl(var(--chart-3))',
            4: 'hsl(var(--chart-4))',
            5: 'hsl(var(--chart-5))',
          },
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        keyframes: {
          'accordion-down': {
            from: {
              height: '0',
            },
            to: {
              height: 'var(--radix-accordion-content-height)',
            },
          },
          'accordion-up': {
            from: {
              height: 'var(--radix-accordion-content-height)',
            },
            to: {
              height: '0',
            },
          },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
        },
        fontFamily: {
            poppinstnum:['var(--font-poppins-tnum)'],
            montserrat:['var(--font-montserrat)'],
            poppins: ['var(--font-poppins)'],
            khand: ['var(--font-khand)'],
            sans: ['var(--font-inter)'],
            mono: ['var(--font-roboto-mono)'],
          },
      },
    },
    variants: {
      extend: {},
    },
    plugins: [
      function ({ addUtilities }) {
        addUtilities({
          '.tnum': {
            fontFeatureSettings: '"tnum"',
            fontFamily: 'var(--font-poppins-tnum)', // important
          },
        })
      }
    ],
  }
  