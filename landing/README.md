# ship-toolkit Landing Page

Terminal-nostalgic landing page for ship-toolkit, built with Next.js 15 and Tailwind CSS v4.

## Features

- 🖥️ **Retro CRT Terminal Aesthetic**
  - Green phosphor glow effects
  - Scanline overlays
  - CRT flicker animation
  - Monospace typography (JetBrains Mono)

- 🎨 **Patterned Backgrounds**
  - Dot matrix patterns
  - Circuit board grids
  - Gradient overlays

- ⚡ **Interactive Elements**
  - Animated typing effect on hero
  - Glowing text effects
  - Hover transitions
  - Smooth scroll anchors

- 📱 **Fully Responsive**
  - Mobile-optimized layouts
  - Touch-friendly navigation
  - Adaptive font sizes

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Tailwind CSS v4** - Utility-first CSS with @theme configuration
- **TypeScript** - Type-safe development
- **Google Fonts** - JetBrains Mono font family

## Getting Started

### Environment Variables

Create a `.env.local` file to configure optional features:

```bash
# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

See `.env.example` for all available options.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

```bash
npm run build
```

Creates an optimized production build in `.next/`.

### Production

```bash
npm start
```

Starts the production server.

## Project Structure

```
ship-toolkit-landing/
├── app/
│   ├── globals.css      # Global styles with terminal theme
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main landing page
├── public/              # Static assets
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## Sections

1. **Hero** - Animated command-line demo showing /ship-complete
2. **Problem** - "The Deployment Tax" - shows time wasted on manual tasks
3. **Solution** - "One Command. Done." - statistics and value prop
4. **Features** - All 9 commands with detailed descriptions
5. **Installation** - 3-step quick start guide
6. **Documentation** - Supported frameworks and platforms
7. **CTA** - Final call-to-action with GitHub links
8. **Footer** - Attribution and links

## Customization

### Colors

Edit `app/globals.css` to change terminal colors:

```css
@theme {
  --color-terminal-green: #00ff41;    /* Main green */
  --color-terminal-amber: #ffb000;    /* Accent amber */
  --color-terminal-cyan: #00ffff;     /* Accent cyan */
  --color-terminal-dark: #0a0e27;     /* Dark bg */
  --color-terminal-darkest: #050814;  /* Darkest bg */
}
```

### Typography

Change the monospace font in `app/globals.css`:

```css
@theme {
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Animations

Adjust CRT effects and animations in `app/globals.css`:

```css
.crt-effect {
  animation: flicker 0.15s infinite;
}

.scanlines::after {
  animation: scan 8s linear infinite;
}
```

## Deployment

Deploy to Vercel with zero configuration:

```bash
npx vercel
```

Or deploy to any platform that supports Next.js:

- Netlify
- Railway
- Render
- GitHub Pages (with Next.js static export)

## License

MIT

## Author

Made with 💚 by [René DeAnda](https://renedeanda.com)
