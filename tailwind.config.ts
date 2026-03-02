import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ============================================
         MOMEN COLOR PALETTE
         ============================================ */
      colors: {
        /* Primary Colors */
        slate: {
          DEFAULT: "#355872",
          50: "#F0F3F6",
          100: "#E1E8EF",
          200: "#C3D1E0",
          300: "#A5B9D0",
          400: "#87A1C1",
          500: "#7AAACE", // Sky
          600: "#6B94C0",
          700: "#5C7FB2",
          800: "#355872", // Primary Slate
          900: "#2A465A",
          950: "#1F2C38",
        },
        sky: {
          50: "#F0F7FD",
          100: "#E1EFF9",
          200: "#C3DFF3",
          300: "#A5CFED",
          400: "#87BFE7",
          500: "#7AAACE", // Primary Sky
          600: "#6590B5",
          700: "#50769C",
          800: "#3B5C83",
          900: "#264269",
        },
        ice: {
          DEFAULT: "#9CD5FF",
          50: "#F5FAFF",
          100: "#EBF5FF",
          200: "#D7ECFF",
          300: "#C3E3FF",
          400: "#AFDAFF",
          500: "#9CD5FF", // Primary Ice
          600: "#7AC7FF",
          700: "#58B9FF",
          800: "#36ABFF",
          900: "#149DFF",
        },
        cream: {
          DEFAULT: "#F7F8F0",
          50: "#FCFCF9",
          100: "#F9FAF3",
          200: "#F3F4E9",
          300: "#EDEEE2",
          400: "#E7E8DB",
          500: "#F7F8F0", // Primary Cream
          600: "#DCDED0",
          700: "#C1C3B1",
          800: "#A6A892",
          900: "#8B8D73",
        },

        /* Semantic Colors */
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#D97706",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#DC2626",
        },
        info: {
          DEFAULT: "#7AAACE",
          light: "#E1EFF9",
          dark: "#50769C",
        },
      },

      /* ============================================
         BACKGROUND COLORS
         ============================================ */
      backgroundColor: {
        "page": "var(--bg-page)",
        "card": "var(--bg-card)",
        "card-secondary": "var(--bg-card-secondary)",
        "overlay": "var(--bg-overlay)",
        "sidebar": "var(--bg-sidebar)",
        "header": "var(--bg-header)",
      },

      /* ============================================
         TEXT COLORS
         ============================================ */
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        "on-dark": "var(--text-on-dark)",
      },

      /* ============================================
         BORDER COLORS
         ============================================ */
      borderColor: {
        DEFAULT: "var(--border-default)",
        medium: "var(--border-medium)",
        strong: "var(--border-strong)",
        focus: "var(--border-focus)",
        input: "var(--border-input)",
      },

      /* ============================================
         GRADIENTS
         ============================================ */
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-cta": "var(--gradient-cta)",
        "gradient-overlay": "var(--gradient-overlay)",
        "gradient-shimmer": "var(--gradient-shimmer)",
      },

      /* ============================================
         SHADOWS
         ============================================ */
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "focus": "0 0 0 3px var(--focus-ring)",
      },

      /* ============================================
         BORDER RADIUS
         ============================================ */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },

      /* ============================================
         TRANSITION DURATION
         ============================================ */
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
