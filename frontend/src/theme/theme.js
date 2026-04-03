// src/theme/theme.js
// InsurGenie Design System — "Insurance Made Magical"
// Generated from brand logo palette

const theme = {
  // ─── Colour Tokens ────────────────────────────────────────────────────────

  colors: {
    // Primary blues (from the genie character)
    primary: {
      900: "#0D2A5C", // darkest — deep brand navy
      800: "#1A4B8C", // logo wordmark / main headings  ← brand anchor
      700: "#235FA8",
      600: "#2E74C4",
      500: "#3A7BD5", // royal blue — CTAs, links, active states
      400: "#5A96DF",
      300: "#6BA8E8", // sky blue — hover states, icons
      200: "#A8CCF2",
      100: "#D6E8FA", // pale blue — card/section backgrounds
      50:  "#EEF5FD", // lightest tint — subtle backgrounds
    },

    // Accent gold (from the magic lamp)
    gold: {
      900: "#6B4A00",
      800: "#8C6200",
      700: "#A87A0A",
      600: "#C8941A", // rich gold — icons, badges, premium CTAs ← accent anchor
      500: "#D9A428",
      400: "#E8B84B", // warm gold — stars, highlights, tags
      300: "#F0CA72",
      200: "#F7DFA5",
      100: "#FDF0CF",
      50:  "#FFFAEE",
    },

    // Alert red (from the sash)
    red: {
      700: "#8B1A14",
      600: "#C0392B", // sash red — errors, alerts, urgency ← accent anchor
      500: "#D94537",
      400: "#E86C60",
      100: "#FDECEA",
      50:  "#FEF6F5",
    },

    // Neutrals
    neutral: {
      900: "#111827",
      800: "#1A2233", // deep navy — footer, dark sections, dark mode bg
      700: "#2D3748",
      600: "#4A5568",
      500: "#5A6475", // slate grey — body text, subtitles
      400: "#7B8794",
      300: "#A0AABA",
      200: "#CBD5E0",
      100: "#E8EDF5",
      50:  "#F4F7FC", // cloud white — section alternate backgrounds
      0:   "#FFFFFF", // pure white — page background
    },

    // Semantic aliases (use these in components)
    semantic: {
      // Text
      textPrimary:   "#1A2233",
      textSecondary: "#5A6475",
      textMuted:     "#7B8794",
      textInverse:   "#FFFFFF",
      textLink:      "#3A7BD5",
      textLinkHover: "#1A4B8C",

      // Backgrounds
      bgPage:        "#FFFFFF",
      bgSection:     "#F4F7FC",
      bgCard:        "#FFFFFF",
      bgCardAlt:     "#EEF5FD",
      bgDark:        "#1A2233",
      bgNavbar:      "#1A4B8C",
      bgFooter:      "#1A2233",

      // Brand actions
      btnPrimary:        "#3A7BD5",
      btnPrimaryHover:   "#1A4B8C",
      btnPrimaryText:    "#FFFFFF",
      btnSecondary:      "#E8B84B",
      btnSecondaryHover: "#C8941A",
      btnSecondaryText:  "#1A2233",

      // Borders
      borderLight:   "#D6E8FA",
      borderDefault: "#CBD5E0",
      borderDark:    "#A0AABA",

      // Status
      success:       "#1E7D4E",
      successBg:     "#EAF7EF",
      warning:       "#C8941A",
      warningBg:     "#FDF0CF",
      error:         "#C0392B",
      errorBg:       "#FDECEA",
      info:          "#3A7BD5",
      infoBg:        "#D6E8FA",
    },
  },

  // ─── Typography ───────────────────────────────────────────────────────────

  typography: {
    // Font families — add to index.html via Google Fonts or install via npm
    // Recommended: "Plus Jakarta Sans" (headings) + "DM Sans" (body)
    fontHeading: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    fontBody:    "'DM Sans', 'Segoe UI', sans-serif",
    fontMono:    "'JetBrains Mono', 'Fira Code', monospace",

    fontSizes: {
      xs:   "0.75rem",   // 12px
      sm:   "0.875rem",  // 14px
      base: "1rem",      // 16px
      md:   "1.125rem",  // 18px
      lg:   "1.25rem",   // 20px
      xl:   "1.5rem",    // 24px
      "2xl":"1.875rem",  // 30px
      "3xl":"2.25rem",   // 36px
      "4xl":"3rem",      // 48px
      "5xl":"3.75rem",   // 60px
    },

    fontWeights: {
      regular:  400,
      medium:   500,
      semibold: 600,
      bold:     700,
    },

    lineHeights: {
      tight:   1.2,
      snug:    1.4,
      normal:  1.6,
      relaxed: 1.75,
    },

    letterSpacings: {
      tight:  "-0.02em",
      normal: "0",
      wide:   "0.04em",
      wider:  "0.08em",
    },
  },

  // ─── Spacing ──────────────────────────────────────────────────────────────

  spacing: {
    px:   "1px",
    0:    "0",
    1:    "0.25rem",   // 4px
    2:    "0.5rem",    // 8px
    3:    "0.75rem",   // 12px
    4:    "1rem",      // 16px
    5:    "1.25rem",   // 20px
    6:    "1.5rem",    // 24px
    8:    "2rem",      // 32px
    10:   "2.5rem",    // 40px
    12:   "3rem",      // 48px
    16:   "4rem",      // 64px
    20:   "5rem",      // 80px
    24:   "6rem",      // 96px
    32:   "8rem",      // 128px
  },

  // ─── Border Radius ────────────────────────────────────────────────────────

  borderRadius: {
    none:  "0",
    sm:    "4px",
    md:    "8px",
    lg:    "12px",
    xl:    "16px",
    "2xl": "24px",
    full:  "9999px",  // pills / avatars
  },

  // ─── Shadows ──────────────────────────────────────────────────────────────

  shadows: {
    sm:     "0 1px 3px rgba(26, 75, 140, 0.08)",
    md:     "0 4px 12px rgba(26, 75, 140, 0.12)",
    lg:     "0 8px 24px rgba(26, 75, 140, 0.16)",
    xl:     "0 16px 40px rgba(26, 75, 140, 0.20)",
    card:   "0 2px 8px rgba(26, 75, 140, 0.10)",
    button: "0 2px 6px rgba(58, 123, 213, 0.35)",
    gold:   "0 4px 16px rgba(200, 148, 26, 0.30)",
    none:   "none",
  },

  // ─── Transitions ──────────────────────────────────────────────────────────

  transitions: {
    fast:   "150ms ease",
    normal: "250ms ease",
    slow:   "400ms ease",
    bounce: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // ─── Breakpoints ──────────────────────────────────────────────────────────

  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // ─── Z-index ──────────────────────────────────────────────────────────────

  zIndex: {
    base:    0,
    raised:  10,
    dropdown:200,
    sticky:  300,
    overlay: 400,
    modal:   500,
    toast:   600,
  },
};

export default theme;