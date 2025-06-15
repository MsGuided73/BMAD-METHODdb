# {Project Name} Style Guide

## Introduction

This document defines the visual design system and styling standards for {Project Name}. It serves as the single source of truth for all visual design decisions, ensuring consistency across all user interfaces and components.

## Brand Identity

### Brand Overview
- **Brand Mission:** {Brief statement of what the brand represents}
- **Brand Personality:** {Key personality traits - e.g., Professional, Friendly, Modern, Trustworthy}
- **Brand Voice:** {How the brand communicates - e.g., Conversational, Authoritative, Helpful}

### Logo & Brand Mark
- **Primary Logo:** {Link to logo file or description}
- **Logo Variations:** {Horizontal, vertical, icon-only versions}
- **Logo Usage Guidelines:**
  - Minimum size: {dimensions}
  - Clear space: {spacing requirements}
  - Acceptable backgrounds: {light, dark, color restrictions}
  - What NOT to do: {common misuse examples}

## Color System

### Primary Colors
```css
/* Primary Brand Colors */
--color-primary-50: {#hex-value};   /* Lightest tint */
--color-primary-100: {#hex-value};
--color-primary-200: {#hex-value};
--color-primary-300: {#hex-value};
--color-primary-400: {#hex-value};
--color-primary-500: {#hex-value};  /* Base primary color */
--color-primary-600: {#hex-value};
--color-primary-700: {#hex-value};
--color-primary-800: {#hex-value};
--color-primary-900: {#hex-value};  /* Darkest shade */
```

### Secondary Colors
```css
/* Secondary Brand Colors */
--color-secondary-50: {#hex-value};
--color-secondary-100: {#hex-value};
--color-secondary-200: {#hex-value};
--color-secondary-300: {#hex-value};
--color-secondary-400: {#hex-value};
--color-secondary-500: {#hex-value}; /* Base secondary color */
--color-secondary-600: {#hex-value};
--color-secondary-700: {#hex-value};
--color-secondary-800: {#hex-value};
--color-secondary-900: {#hex-value};
```

### Neutral Colors
```css
/* Neutral/Gray Scale */
--color-neutral-50: {#hex-value};   /* Almost white */
--color-neutral-100: {#hex-value};
--color-neutral-200: {#hex-value};
--color-neutral-300: {#hex-value};
--color-neutral-400: {#hex-value};
--color-neutral-500: {#hex-value};  /* True gray */
--color-neutral-600: {#hex-value};
--color-neutral-700: {#hex-value};
--color-neutral-800: {#hex-value};
--color-neutral-900: {#hex-value};  /* Almost black */
```

### Semantic Colors
```css
/* Status/Feedback Colors */
--color-success-50: {#hex-value};
--color-success-500: {#hex-value};  /* Success green */
--color-success-700: {#hex-value};

--color-warning-50: {#hex-value};
--color-warning-500: {#hex-value};  /* Warning yellow/orange */
--color-warning-700: {#hex-value};

--color-error-50: {#hex-value};
--color-error-500: {#hex-value};    /* Error red */
--color-error-700: {#hex-value};

--color-info-50: {#hex-value};
--color-info-500: {#hex-value};     /* Info blue */
--color-info-700: {#hex-value};
```

### Color Usage Guidelines
- **Primary Colors:** Use for main CTAs, navigation, key brand elements
- **Secondary Colors:** Use for secondary actions, accents, highlights
- **Neutral Colors:** Use for text, backgrounds, borders, subtle elements
- **Semantic Colors:** Use only for their intended purpose (success, warning, error, info)

### Accessibility Requirements
- **Contrast Ratios:** All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Color Blindness:** Never rely on color alone to convey information
- **High Contrast Mode:** Ensure compatibility with high contrast display modes

## Typography

### Font Families
```css
/* Primary Font Stack */
--font-primary: '{Primary Font Name}', {fallback-fonts}, sans-serif;
/* Usage: Headings, important text, brand elements */

/* Secondary Font Stack */
--font-secondary: '{Secondary Font Name}', {fallback-fonts}, sans-serif;
/* Usage: Body text, general content */

/* Monospace Font Stack */
--font-mono: '{Monospace Font Name}', 'Courier New', monospace;
/* Usage: Code, technical content, data display */
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px - Base size */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Typography Usage
- **H1 Headings:** `--text-4xl` or `--text-5xl`, `--font-weight-bold`, `--font-primary`
- **H2 Headings:** `--text-3xl`, `--font-weight-semibold`, `--font-primary`
- **H3 Headings:** `--text-2xl`, `--font-weight-semibold`, `--font-primary`
- **H4 Headings:** `--text-xl`, `--font-weight-medium`, `--font-primary`
- **Body Text:** `--text-base`, `--font-weight-normal`, `--font-secondary`
- **Small Text:** `--text-sm`, `--font-weight-normal`, `--font-secondary`
- **Captions:** `--text-xs`, `--font-weight-normal`, `--font-secondary`

## Spacing System

### Spacing Scale
```css
/* Spacing Units (based on 4px grid) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Spacing Usage Guidelines
- **Component Padding:** Use `--space-4` to `--space-6` for most components
- **Section Spacing:** Use `--space-12` to `--space-20` between major sections
- **Element Margins:** Use `--space-2` to `--space-4` between related elements
- **Layout Gaps:** Use `--space-6` to `--space-8` for grid and flex gaps

## Layout & Grid System

### Breakpoints
```css
/* Responsive Breakpoints */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Container Sizes
```css
/* Container Max Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Grid System
- **Columns:** 12-column grid system
- **Gutters:** `--space-6` (24px) between columns
- **Margins:** `--space-4` to `--space-8` on container sides

## Shadows & Elevation

### Shadow Scale
```css
/* Box Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Shadow Usage
- **Cards:** `--shadow-base` or `--shadow-md`
- **Modals:** `--shadow-xl` or `--shadow-2xl`
- **Dropdowns:** `--shadow-lg`
- **Buttons (hover):** `--shadow-md`

## Border Radius

### Radius Scale
```css
/* Border Radius */
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;    /* Fully rounded */
```

### Radius Usage
- **Buttons:** `--radius-md` to `--radius-lg`
- **Cards:** `--radius-lg` to `--radius-xl`
- **Input Fields:** `--radius-base` to `--radius-md`
- **Avatars:** `--radius-full`

## Iconography

### Icon System
- **Icon Library:** {Specify icon library - e.g., Heroicons, Feather, Lucide}
- **Icon Sizes:** 16px, 20px, 24px, 32px, 48px
- **Icon Style:** {Outline, Solid, or Mixed}

### Icon Usage Guidelines
- **Consistency:** Use icons from the same library/style
- **Size:** Match icon size to text size when paired
- **Color:** Use semantic colors or inherit text color
- **Accessibility:** Always provide alt text or aria-labels

## Component Styling Standards

### Buttons
- **Primary Button:** Primary color background, white text, `--shadow-base`
- **Secondary Button:** Transparent background, primary color border and text
- **Danger Button:** Error color background, white text
- **Disabled State:** Reduced opacity (0.5), no hover effects

### Form Elements
- **Input Fields:** Neutral border, focus ring in primary color
- **Labels:** Medium font weight, slightly smaller than base text
- **Error States:** Error color border and text
- **Success States:** Success color border and text

### Cards
- **Background:** White or very light neutral
- **Border:** Light neutral color or none
- **Shadow:** `--shadow-base` or `--shadow-md`
- **Padding:** `--space-6` to `--space-8`

## Animation & Transitions

### Timing Functions
```css
/* Easing Functions */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Duration Scale
```css
/* Animation Durations */
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### Common Transitions
- **Hover Effects:** `--duration-150` with `--ease-out`
- **Focus States:** `--duration-100` with `--ease-out`
- **Modal Animations:** `--duration-200` with `--ease-in-out`
- **Page Transitions:** `--duration-300` with `--ease-in-out`

## Implementation Guidelines

### CSS Custom Properties
All design tokens should be implemented as CSS custom properties (variables) for consistency and easy theming.

### Tailwind CSS Integration
```javascript
// tailwind.config.js example
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          // ... other shades
        }
      },
      fontFamily: {
        primary: 'var(--font-primary)',
        secondary: 'var(--font-secondary)',
      },
      spacing: {
        // Map to CSS custom properties
      }
    }
  }
}
```

### Component Library Integration
- Use design tokens consistently across all components
- Create base component styles that can be extended
- Ensure all components support theming through CSS custom properties

## Quality Assurance

### Design Review Checklist
- [ ] Colors meet accessibility contrast requirements
- [ ] Typography is consistent and readable
- [ ] Spacing follows the defined scale
- [ ] Components use appropriate shadows and borders
- [ ] Icons are consistent in style and size
- [ ] Animations are smooth and purposeful
- [ ] Design works across all defined breakpoints

### Implementation Checklist
- [ ] All design tokens are implemented as CSS custom properties
- [ ] Tailwind/CSS framework is properly configured
- [ ] Components use design tokens consistently
- [ ] No hardcoded values in component styles
- [ ] Dark mode support (if required)
- [ ] High contrast mode compatibility

## Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
