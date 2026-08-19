/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", // slate-200
        input: "var(--color-input)", // white
        ring: "var(--color-ring)", // blue-600
        background: "var(--color-background)", // gray-50
        foreground: "var(--color-foreground)", // slate-800
        primary: {
          DEFAULT: "var(--color-primary)", // blue-600
          foreground: "var(--color-primary-foreground)", // white
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", // slate-500
          foreground: "var(--color-secondary-foreground)", // white
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", // red-500
          foreground: "var(--color-destructive-foreground)", // white
        },
        muted: {
          DEFAULT: "var(--color-muted)", // slate-100
          foreground: "var(--color-muted-foreground)", // slate-500
        },
        accent: {
          DEFAULT: "var(--color-accent)", // emerald-600
          foreground: "var(--color-accent-foreground)", // white
        },
        popover: {
          DEFAULT: "var(--color-popover)", // white
          foreground: "var(--color-popover-foreground)", // slate-800
        },
        card: {
          DEFAULT: "var(--color-card)", // slate-50
          foreground: "var(--color-card-foreground)", // slate-800
        },
        success: {
          DEFAULT: "var(--color-success)", // emerald-500
          foreground: "var(--color-success-foreground)", // white
        },
        warning: {
          DEFAULT: "var(--color-warning)", // amber-500
          foreground: "var(--color-warning-foreground)", // white
        },
        error: {
          DEFAULT: "var(--color-error)", // red-500
          foreground: "var(--color-error-foreground)", // white
        },
        // Brand Colors
        "brand-primary": "var(--color-brand-primary)", // blue-600
        "brand-secondary": "var(--color-brand-secondary)", // violet-600
        "brand-accent": "var(--color-brand-accent)", // emerald-600
        "trust-builder": "var(--color-trust-builder)", // slate-900
        "conversion-accent": "var(--color-conversion-accent)", // red-600
        // Text Colors
        "text-primary": "var(--color-text-primary)", // slate-800
        "text-secondary": "var(--color-text-secondary)", // slate-500
        // Surface Colors
        surface: "var(--color-surface)", // slate-50
        "surface-elevated": "var(--color-surface-elevated)", // white
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'value-prop': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        'unit': 'var(--space-unit)',
        '2unit': 'calc(var(--space-unit) * 2)',
        '3unit': 'calc(var(--space-unit) * 3)',
        '4unit': 'calc(var(--space-unit) * 4)',
        '6unit': 'calc(var(--space-unit) * 6)',
        '8unit': 'calc(var(--space-unit) * 8)',
      },
      boxShadow: {
        'subtle': 'var(--shadow-subtle)',
        'moderate': 'var(--shadow-moderate)',
        'elevated': 'var(--shadow-elevated)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
      },
      backdropBlur: {
        'enterprise': '10px',
      },
      gridTemplateColumns: {
        'enterprise': 'repeat(12, 1fr)',
        'hero-split': '1.2fr 1fr',
      },
      zIndex: {
        'header': '50',
        'sidebar': '40',
        'modal': '100',
        'tooltip': '110',
      },

      backgroundImage: {
        'subtle-pattern': "url('/src/background-pattern.svg')", // Adjust path if needed
      }
    },
  },
 plugins: [
    require("tailwindcss-animate"),
  ],
}

