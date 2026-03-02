# Momen Design System - Color Palette

## Color Values

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Slate (Primary) | `#355872` | `rgb(53, 88, 114)` | Primary actions, headers, important text |
| Sky (Secondary) | `#7AAACE` | `rgb(122, 170, 206)` | Secondary actions, accents, links |
| Ice (Accent) | `#9CD5FF` | `rgb(156, 213, 255)` | Highlights, info states, badges |
| Cream (Background) | `#F7F8F0` | `rgb(247, 248, 240)` | Main background, cards |

---

## Color Mapping by Component

### 1. Background Colors

| Component | Color | Hex | Rationale |
|-----------|-------|-----|-----------|
| **Page Background** | Cream | `#F7F8F0` | Warm, neutral base - easy on eyes |
| **Card/Container Background** | White | `#FFFFFF` | Content separation from page bg |
| **Modal/Sheet Background** | White | `#FFFFFF` | Focused content area |
| **Sidebar Background** | Slate | `#355872` | Navigation hierarchy |
| **Header Background** | Slate | `#355872` | Top-level branding area |
| **Table Row (even)** | White | `#FFFFFF` | Zebra striping for readability |
| **Table Row (odd)** | Cream | `#F7F8F0` | Subtle differentiation |
| **Table Row (hover)** | Ice (10% opacity) | `rgba(156, 213, 255, 0.1)` | Interactive feedback |

---

### 2. Text Colors

| Text Type | Color | Hex | Use Case |
|-----------|-------|-----|----------|
| **Primary Text** | Slate | `#355872` | Headings, body text, labels |
| **Secondary Text** | Sky | `#7AAACE` | Descriptions, metadata, captions |
| **Muted Text** | Sky (60% opacity) | `rgba(122, 170, 206, 0.6)` | Placeholders, disabled text |
| **On Dark Background** | White | `#FFFFFF` | Text on Slate backgrounds |
| **Links** | Sky | `#7AAACE` | Interactive text links |
| **Links (hover)** | Ice | `#9CD5FF` | Link hover state |

---

### 3. Button Colors

| Button Type | Background | Text | Border | Hover |
|-------------|------------|------|--------|-------|
| **Primary** | Slate `#355872` | White `#FFFFFF` | Transparent | Darken 10% |
| **Secondary** | Sky `#7AAACE` | White `#FFFFFF` | Transparent | Darken 10% |
| **Outline** | Transparent | Slate `#355872` | Slate `#355872` | Slate bg 5% |
| **Ghost** | Transparent | Slate `#355872` | Transparent | Cream `#F7F8F0` |
| **Destructive** | Error Red | White | Transparent | Darken 10% |

---

### 4. Container & Card Colors

| Component | Background | Border | Shadow |
|-----------|------------|--------|--------|
| **Card** | White `#FFFFFF` | Sky (20%) `rgba(122, 170, 206, 0.2)` | Subtle |
| **Elevated Card** | White `#FFFFFF` | Sky (30%) | Medium |
| **Input Field** | White `#FFFFFF` | Sky (40%) | None |
| **Input (focus)** | White `#FFFFFF` | Sky `#7AAACE` | Glow |
| **Dropdown Menu** | White `#FFFFFF` | Sky (20%) | Medium |
| **Popover** | White `#FFFFFF` | Sky (30%) | Large |
| **Divider/Border** | Transparent | Sky (20%) | None |

---

### 5. Status Colors

| Status | Background | Text/Badge | Border |
|--------|------------|------------|--------|
| **Success** | Green tint | Green | Green |
| **Warning** | Amber tint | Amber | Amber |
| **Error** | Red tint | Red | Red |
| **Info** | Ice (20%) `rgba(156, 213, 255, 0.2)` | Sky `#7AAACE` | Ice (40%) |
| **Pending** | Cream `#F7F8F0` | Slate `#355872` | Sky (20%) |

---

### 6. Interactive States

| State | Background | Border | Text |
|-------|------------|--------|------|
| **Default** | Component base | Sky (20%) | Slate |
| **Hover** | Cream `#F7F8F0` | Sky (40%) | Slate |
| **Active/Pressed** | Sky (20%) `rgba(122, 170, 206, 0.2)` | Sky `#7AAACE` | Slate |
| **Focus** | Ice (10%) `rgba(156, 213, 255, 0.1)` | Ice `#9CD5FF` | Slate |
| **Disabled** | Cream (50%) | Sky (10%) | Sky (40%) |

---

### 7. Table Specific Colors

| Table Element | Background | Border | Text |
|---------------|------------|--------|------|
| **Header** | Slate `#355872` | Sky (20%) | White |
| **Row (even)** | White `#FFFFFF` | Sky (10%) | Slate |
| **Row (odd)** | Cream `#F7F8F0` | Sky (10%) | Slate |
| **Row (hover)** | Ice (5%) `rgba(156, 213, 255, 0.05)` | Sky (20%) | Slate |
| **Row (selected)** | Ice (15%) `rgba(156, 213, 255, 0.15)` | Sky `#7AAACE` | Slate |
| **Cell (empty)** | Sky (10%) | - | Sky (40%) italic |

---

### 8. Overlay & Backdrop

| Overlay Type | Color | Opacity |
|--------------|-------|---------|
| **Modal Backdrop** | Slate `#355872` | 50% |
| **Drawer Backdrop** | Slate `#355872` | 40% |
| **Dropdown Backdrop** | Slate `#355872` | 30% |
| **Tooltip Backdrop** | Slate `#355872` | 90% |

---

### 9. Gradient Applications

| Gradient Use | Colors | Direction |
|--------------|--------|-----------|
| **Hero Section** | Slate → Sky | 135deg |
| **CTA Button** | Sky → Ice | 90deg |
| **Photo Overlay** | Transparent → Slate (80%) | 180deg |
| **Loading Shimmer** | Sky (10%) → Sky (20%) → Sky (10%) | 90deg |

---

## Accessibility Considerations

### WCAG AA Compliance
- **Slate (#355872) on White (#FFFFFF)**: Contrast ratio 8.2:1 ✅
- **Sky (#7AAACE) on White (#FFFFFF)**: Contrast ratio 3.0:1 ⚠️ (use for large text only)
- **Slate (#355872) on Cream (#F7F8F0)**: Contrast ratio 7.8:1 ✅

### Recommendations:
1. Use Sky (`#7AAACE`) only for text ≥18px or bold
2. Use Slate (`#355872`) for body text and important labels
3. Ensure focus indicators use Ice (`#9CD5FF`) for visibility

---

## CSS Variables Implementation

```css
:root {
  /* Primary Colors */
  --color-slate: #355872;
  --color-sky: #7AAACE;
  --color-ice: #9CD5FF;
  --color-cream: #F7F8F0;

  /* Backgrounds */
  --bg-page: var(--color-cream);
  --bg-card: #FFFFFF;
  --bg-overlay: rgba(53, 88, 114, 0.5);

  /* Text */
  --text-primary: var(--color-slate);
  --text-secondary: var(--color-sky);
  --text-muted: rgba(122, 170, 206, 0.6);
  --text-on-dark: #FFFFFF;

  /* Borders */
  --border-default: rgba(122, 170, 206, 0.2);
  --border-strong: rgba(122, 170, 206, 0.4);
  --border-focus: var(--color-ice);

  /* Interactive */
  --hover-bg: var(--color-cream);
  --active-bg: rgba(122, 170, 206, 0.2);
  --focus-ring: rgba(156, 213, 255, 0.4);

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: var(--color-sky);
}
```

---

## Tailwind Config Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        slate: '#355872',
        sky: '#7AAACE',
        ice: '#9CD5FF',
        cream: '#F7F8F0',
      },
      backgroundColor: {
        'page': 'var(--bg-page)',
        'card': 'var(--bg-card)',
      }
    }
  }
}
```

---

## Component Color Examples

### Button Examples
```
┌─────────────────────────────────────────────────────┐
│ Primary Button                                      │
│ BG: #355872  |  Text: #FFFFFF  │  Border: None      │
├─────────────────────────────────────────────────────┤
│ Secondary Button                                    │
│ BG: #7AAACE  |  Text: #FFFFFF  │  Border: None      │
├─────────────────────────────────────────────────────┤
│ Outline Button                                      │
│ BG: Transparent  │  Text: #355872  │  Border: #355872 │
└─────────────────────────────────────────────────────┘
```

### Card Examples
```
┌─────────────────────────────────────────────────────┐
│ Event Card                                          │
│ BG: #FFFFFF  │  Border: rgba(122,170,206,0.2)       │
│ Title: #355872  │  Meta: #7AAACE                    │
└─────────────────────────────────────────────────────┘
```

---

*Part of Momen Design System v1.0*
