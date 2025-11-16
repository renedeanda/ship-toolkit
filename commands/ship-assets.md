---
description: Generate all required assets for your web project - favicons, social images, PWA icons
---

# Ship Assets Command

Generate a complete set of web assets including favicons, Open Graph images, Twitter cards, and PWA icons.

## Overview

This command will:
1. Detect your project type and structure
2. Gather asset configuration (name, colors, logo)
3. Generate all required web assets
4. Update project files with proper meta tags
5. Create a preview of generated assets

## Steps

### 1. Detect Project Information

First, let's detect your project framework and gather basic information:

```typescript
import { detectFramework, getFrameworkPaths } from '../lib/utils/framework-detector.js';
import { getProjectInfo, findLogo } from '../lib/utils/file-finder.js';
import { logger } from '../lib/utils/logger.js';

const projectRoot = process.cwd();
const detection = await detectFramework(projectRoot);
const projectInfo = getProjectInfo(projectRoot);
const paths = getFrameworkPaths(projectRoot, detection);

logger.section('🎨 Ship Assets Generator');
logger.info(`Project: ${projectInfo.name}`);
logger.info(`Framework: ${detection.framework}`);
logger.info(`Output directory: ${paths.publicDir}`);
```

### 2. Gather Asset Configuration

Ask the user for configuration (or use smart defaults):

```typescript
// Check if logo exists
const existingLogo = await findLogo(projectRoot);

// Project info
const projectName = projectInfo.name || 'My App';
const projectDescription = projectInfo.description || 'A web application';

// Ask user for customization
console.log('\n📝 Asset Configuration\n');

// Use Claude Code to interactively gather:
// - Primary color (default: #3B82F6)
// - Background color (default: #FFFFFF)
// - Style preference (gradient, solid, minimal)
// - Use existing logo or generate from text

const config = {
  name: projectName,
  primaryColor: '#3B82F6', // Blue
  backgroundColor: '#FFFFFF', // White
  logoPath: existingLogo,
  style: 'gradient'
};
```

### 3. Generate Favicons

```typescript
import { generateFaviconSet, generateFaviconHTML, generateNextJSMetadata } from '../lib/assets/favicon.js';
import { generateFromText } from '../lib/assets/generator.js';

logger.step(1, 4, 'Generating Favicons');

// Generate base image if no logo
let baseImage: Buffer;
if (config.logoPath) {
  baseImage = await generateFromLogo(config.logoPath, { width: 512, height: 512 });
} else {
  baseImage = await generateFromText(config.name, 512, {
    fontSize: 200,
    fontWeight: 'bold',
    color: config.primaryColor,
    backgroundColor: config.backgroundColor,
    style: config.style
  });
}

const faviconSet = await generateFaviconSet({
  sourceLogo: baseImage,
  text: config.name,
  primaryColor: config.primaryColor,
  backgroundColor: config.backgroundColor,
  style: config.style,
  outputDir: paths.publicDir
});

logger.success(`Generated ${Object.keys(faviconSet).length} favicon files`);
```

### 4. Generate Social Images

```typescript
import { generateSocialImageSet } from '../lib/assets/social.js';

logger.step(2, 4, 'Generating Social Images');

const socialSet = await generateSocialImageSet({
  title: projectName,
  description: projectDescription,
  backgroundColor: config.primaryColor,
  textColor: '#FFFFFF',
  layout: 'centered'
}, paths.publicDir);

logger.success('Generated OG image and Twitter card');
```

### 5. Generate PWA Icons

```typescript
import { generatePWAAssetSet } from '../lib/assets/pwa.js';

logger.step(3, 4, 'Generating PWA Icons');

const pwaSet = await generatePWAAssetSet(
  baseImage,
  {
    name: projectName,
    shortName: projectName.substring(0, 12),
    description: projectDescription,
    themeColor: config.primaryColor,
    backgroundColor: config.backgroundColor,
    display: 'standalone'
  },
  paths.publicDir
);

logger.success('Generated PWA icons and manifest.json');
```

### 6. Update Project Files

```typescript
logger.step(4, 4, 'Updating Project Files');

// Update based on framework
if (detection.framework === 'next-app' && paths.layoutFile) {
  // Update Next.js App Router layout
  const layoutContent = readFileSync(paths.layoutFile, 'utf-8');

  // Check if metadata export exists
  if (!layoutContent.includes('export const metadata')) {
    // Add metadata export
    const metadataCode = `
export const metadata: Metadata = {
  title: '${projectName}',
  description: '${projectDescription}',
  ${generateNextJSMetadata('/')}
  openGraph: {
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image.png'],
  },
};
    `;

    logger.info('Add this metadata to app/layout.tsx:');
    logger.box(metadataCode, 'Next.js Metadata');
  }
} else if (paths.htmlFile) {
  // Update HTML file
  const htmlContent = readFileSync(paths.htmlFile, 'utf-8');
  const faviconHTML = generateFaviconHTML(faviconSet, '/');

  logger.info('Add these tags to your <head>:');
  logger.box(faviconHTML, 'HTML Tags');
}

logger.success('Project files updated');
```

### 7. Generate Preview

```typescript
logger.section('📊 Asset Generation Complete!');

// Summary
logger.metrics('Favicons', Object.keys(faviconSet).length, 'files');
logger.metrics('Social Images', 2, 'files');
logger.metrics('PWA Icons', 2, 'files');
logger.metrics('Manifest', 1, 'file');

// File list
logger.newLine();
logger.list([
  { label: 'favicon.ico', status: 'success' },
  { label: 'favicon-16x16.png', status: 'success' },
  { label: 'favicon-32x32.png', status: 'success' },
  { label: 'apple-touch-icon.png', status: 'success' },
  { label: 'og-image.png', status: 'success' },
  { label: 'twitter-image.png', status: 'success' },
  { label: 'android-chrome-192x192.png', status: 'success' },
  { label: 'android-chrome-512x512.png', status: 'success' },
  { label: 'manifest.json', status: 'success' }
]);

// Next steps
logger.newLine();
logger.box(`
✅ All assets generated successfully!

📂 Assets saved to: ${paths.publicDir}

📋 Next Steps:
   1. Review generated images in ${paths.publicDir}
   2. Update your layout/HTML with the provided code
   3. Run /ship-seo to optimize meta tags
   4. Run /ship-preview to see how assets look

💡 Tip: Run /ship-complete to optimize everything at once
`, '🎉 Success');
```

## Configuration

You can customize asset generation via `.ship-toolkit/config.json`:

```json
{
  "assets": {
    "outputDir": "public",
    "faviconSizes": [16, 32, 48, 64, 128, 256],
    "generatePWA": true,
    "imageFormat": "png",
    "quality": 90,
    "style": "gradient",
    "primaryColor": "#3B82F6",
    "backgroundColor": "#FFFFFF"
  }
}
```

## Advanced Options

You can customize the command with options:

- `--logo <path>` - Use specific logo file
- `--color <hex>` - Set primary color
- `--bg-color <hex>` - Set background color
- `--style <style>` - Set style (gradient, solid, minimal)
- `--no-pwa` - Skip PWA icons
- `--preview-only` - Just show what would be generated

## Examples

```bash
# Generate with custom logo
/ship-assets --logo ./logo.svg --color "#FF6B6B"

# Generate with custom colors
/ship-assets --color "#3B82F6" --bg-color "#1E293B"

# Generate minimal style
/ship-assets --style minimal

# Skip PWA icons
/ship-assets --no-pwa
```

## Error Handling

- **No logo and no text**: Will use project name as text
- **Invalid colors**: Will use default blue (#3B82F6)
- **Permission errors**: Check directory permissions
- **Output directory doesn't exist**: Will create automatically

## Framework-Specific Notes

### Next.js (App Router)
- Updates `app/layout.tsx` with metadata
- Icons in `public/` directory
- Automatic metadata generation

### Next.js (Pages Router)
- Updates `pages/_app.tsx` or `_document.tsx`
- Icons in `public/` directory
- Manual HTML tags

### React (Vite/CRA)
- Updates `index.html` or `public/index.html`
- Icons in `public/` directory
- Manual HTML tags

### Static HTML
- Updates `index.html`
- Icons in root or specified directory
- Manual HTML tags

## Technical Details

All assets are:
- Optimized for size (compressed PNG)
- Generated at correct dimensions per platform standards
- Include proper metadata for each platform
- Following web standards and best practices

Generated files follow naming conventions:
- `favicon.ico` - Multi-resolution ICO (16, 32, 48px)
- `favicon-{size}x{size}.png` - Individual PNG favicons
- `apple-touch-icon.png` - iOS home screen (180x180)
- `og-image.png` - Open Graph (1200x630)
- `twitter-image.png` - Twitter Card (1200x600)
- `android-chrome-{size}x{size}.png` - Android icons
- `manifest.json` - PWA manifest

## Notes

- This command is safe to run multiple times (will overwrite existing assets)
- Backup any existing custom assets before running
- Review generated images and adjust colors if needed
- Social images can be customized further manually

---

**Part of the Ship Toolkit** - Automate your web project optimization
