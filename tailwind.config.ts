import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          navy: "hsl(var(--brand-navy))",
          cyan: "hsl(var(--brand-cyan))",
          red: "hsl(var(--brand-red))",
          paper: "hsl(var(--brand-paper))",
        },
        kenya: {
          black: "hsl(var(--kenya-black))",
          red: "hsl(var(--kenya-red))",
          green: "hsl(var(--kenya-green))",
          gold: "hsl(var(--kenya-gold))",
          cream: "hsl(var(--kenya-cream))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        newsroom: {
          sidebar: "hsl(var(--newsroom-sidebar))",
          sidebarHover: "hsl(var(--newsroom-sidebar-hover))",
          sidebarLine: "hsl(var(--newsroom-sidebar-line))",
          sidebarText: "hsl(var(--newsroom-sidebar-text))",
          sidebarMuted: "hsl(var(--newsroom-sidebar-muted))",
          sidebarActive: "hsl(var(--newsroom-sidebar-active))",
          blue: "hsl(var(--newsroom-blue))",
          blueSoft: "hsl(var(--newsroom-blue-soft))",
          canvas: "hsl(var(--newsroom-canvas))",
          surface: "hsl(var(--newsroom-surface))",
          line: "hsl(var(--newsroom-line))",
          ink: "hsl(var(--newsroom-ink))",
          muted: "hsl(var(--newsroom-muted))",
          danger: "hsl(var(--newsroom-danger))",
          success: "hsl(var(--newsroom-success))",
          warning: "hsl(var(--newsroom-warning))",
          overlay: "hsl(var(--newsroom-overlay) / 0.62)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
