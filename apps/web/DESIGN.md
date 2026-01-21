# Pareto Presents Design System

This document outlines the design specifications for the Pareto Presents web application.

## Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Pareto Dark | `#15131c` | Primary background color |
| Pareto Pink | `#ff7eba` | Accent color, section backgrounds |
| Pareto Yellow | `#f9df57` | Accent color, section backgrounds |
| Pareto Orange | `#fe7e20` | Accent color |
| Pareto Green | `#39b16c` | Accent color |
| Pareto Blue | `#6caade` | Accent color |
| Pareto Light | `#f6f1ee` | Text on dark backgrounds, light elements |
| Black Text | `#000000` | Text on light backgrounds |

### Rainbow Color Order
For rainbow effects (like the logo), use colors in this order:
1. Pink (`#ff7eba`)
2. Yellow (`#f9df57`)
3. Orange (`#fe7e20`)
4. Green (`#39b16c`)
5. Blue (`#6caade`)

## Typography

### Font Families

**Display Font: Mrs Pickles**
- File location: `/public/fonts/` (local, not committed to repo)
- File formats: WOFF2 (modern browsers) and WOFF (legacy support)
- Usage: Logo (rainbow), sidebar navigation (each link different color), section headers
- License: Single-website commercial license
- **Special Features**:
  - **Character Variations**: Contains 3 variations of each character for organic handdrawn look
  - **Custom Ligature**: `:)` automatically becomes a custom smiley character and `??` and `!!` should be used instead of `?` and `!`
  - **OpenType Features**: Stylistic alternates enabled for natural variation

**Body Font: Open Sans**
- Source: Google Fonts
- Weights: 300-800 (variable)
- Styles: Normal and Italic
- Usage: Body text, UI elements, navigation
- License: Apache License 2.0

### Font Hierarchy

- **Logo**: Mrs Pickles (rainbow colored, character-by-character)
- **Sidebar Navigation**: Mrs Pickles (each nav item different color)
- **Section Headers**: Mrs Pickles (e.g., "What is Pareto Presents?", "Our team's results")
- **Body Text**: Open Sans, regular weight (400)
- **UI Elements**: Open Sans, medium weight (500-600)

## Logo Specifications

**Text**: "Pareto Presents :)"

**Styling**:
- Font: Mrs Pickles
- Color Treatment: Each character gets a different color, cycling through the rainbow palette in order (pink → yellow → orange → green → blue → repeat)
- Example pattern:
  - P = Pink
  - a = Yellow
  - r = Orange
  - e = Green
  - t = Blue
  - o = Pink
  - (space) = (no color)
  - P = Yellow
  - r = Orange
  - ... and so on

## Layout Specifications

### Desktop Layout

**Sidebar (Fixed)**
- Position: Fixed left side
- Background: Pareto Dark (`#15131c`)
- Width: ~200px (TBD based on content)
- Contains:
  - Logo (top, rainbow Mrs Pickles)
  - Navigation links (Mrs Pickles font, each link different color):
    - Home (Pink)
    - Dashboard (Yellow)
    - Results (Orange)
    - About (Green)
    - Settings (Blue)

**Main Content Area**
- Scrollable
- Full height sections with different background colors

### Sections

1. **Hero Section**
   - Background: Pareto Dark (`#15131c`)
   - Layout: Split (60/40)
     - Left: Tagline + Action buttons
     - Right: SVG illustration (group1.svg)
   - Tagline: "Helping you and your friends gift give (more optimally)"
   - Buttons: "Create a group" and "Join a Group" (will use handdrawn SVG shapes)

2. **What is Pareto Presents? Section**
   - Background: Pareto Yellow (`#f9df57`) border with organic white rectangular blob in Pareto Light `#f6f1ee`
   - Text Color: Pareto Dark (`#15131c`)
   - Content: (TBD - placeholder for now)

3. **Example Results Section**
   - Background: Pareto Pink (`#ff7eba`) border with organic white rectangular blob in Pareto Light `#f6f1ee`
   - Text Color: Pareto Dark (`#15131c`)
   - Header: "Our team's results"
   - Content: (TBD - placeholder for now)

## Interactive Elements

### Buttons
- Will use custom handdrawn SVG shapes
- Hover states: TBD
- Active states: TBD

### Future Enhancements
- **Cursor-Following Eye Animations**: SVG characters with eyes that follow the cursor, different animations on hover
  - Potential library: Framer Motion (not implemented in prototype)

## Component Architecture

### Reusable Components
- `RainbowText`: Component that applies rainbow coloring letter-by-letter
- `Sidebar`: Fixed navigation sidebar
- `Section`: Wrapper component for full-height colored sections

## Development Notes

- Built with Next.js 15.5.4, React 19, TypeScript 5
- Styled with Tailwind CSS v4
- Custom fonts loaded via `next/font/local` (Mrs Pickles) and `next/font/google` (Open Sans)
- SVG assets stored in `/public/assets/`