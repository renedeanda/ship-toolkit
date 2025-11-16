import sharp from 'sharp';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  generateFromText,
  generateFromLogo,
  generateMultipleSizes,
  optimizeImage,
  TextOptions
} from './generator.js';
import { logger } from '../utils/logger.js';

/**
 * Favicon generation - creates all required favicon formats
 */

export const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];
export const APPLE_ICON_SIZE = 180;
export const APPLE_TOUCH_SIZES = [120, 152, 167, 180];

export interface FaviconSet {
  'favicon.ico': string;
  'favicon-16x16.png': string;
  'favicon-32x32.png': string;
  'favicon-48x48.png'?: string;
  'apple-touch-icon.png': string;
  'safari-pinned-tab.svg'?: string;
}

export interface FaviconConfig {
  sourceLogo?: string | Buffer;
  text?: string;
  primaryColor: string;
  backgroundColor: string;
  style: 'gradient' | 'solid' | 'minimal';
  outputDir: string;
}

/**
 * Generate complete favicon set
 */
export async function generateFaviconSet(
  config: FaviconConfig
): Promise<FaviconSet> {
  const { sourceLogo, text, primaryColor, backgroundColor, style, outputDir } = config;

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  let baseImage: Buffer;

  // Generate base image (largest size first for best quality)
  if (sourceLogo) {
    if (typeof sourceLogo === 'string') {
      baseImage = await generateFromLogo(sourceLogo, { width: 512, height: 512 });
    } else {
      baseImage = sourceLogo;
    }
  } else if (text) {
    const textOptions: TextOptions = {
      fontSize: 200,
      fontWeight: 'bold',
      color: primaryColor,
      backgroundColor,
      style
    };
    baseImage = await generateFromText(text, 512, textOptions);
  } else {
    throw new Error('Either sourceLogo or text must be provided');
  }

  logger.info('Generating favicon set...');

  // Generate all sizes
  const sizes = await generateMultipleSizes(baseImage, FAVICON_SIZES);
  const faviconSet: Partial<FaviconSet> = {};

  // Save individual PNG files
  for (const [size, buffer] of sizes.entries()) {
    const filename = `favicon-${size}x${size}.png`;
    const filepath = join(outputDir, filename);

    const optimized = await optimizeImage(buffer);
    writeFileSync(filepath, optimized);

    if (size === 16) {
      faviconSet['favicon-16x16.png'] = filepath;
    } else if (size === 32) {
      faviconSet['favicon-32x32.png'] = filepath;
    } else if (size === 48) {
      faviconSet['favicon-48x48.png'] = filepath;
    }

    logger.success(`Created ${filename}`);
  }

  // Generate multi-resolution ICO file
  const icoPath = join(outputDir, 'favicon.ico');
  await createIcoFile([
    sizes.get(16)!,
    sizes.get(32)!,
    sizes.get(48)!
  ], icoPath);
  faviconSet['favicon.ico'] = icoPath;
  logger.success('Created favicon.ico');

  // Generate Apple Touch Icon (180x180)
  const appleTouchIcon = await sharp(baseImage)
    .resize(APPLE_ICON_SIZE, APPLE_ICON_SIZE)
    .png()
    .toBuffer();

  const appleTouchIconPath = join(outputDir, 'apple-touch-icon.png');
  writeFileSync(appleTouchIconPath, await optimizeImage(appleTouchIcon));
  faviconSet['apple-touch-icon.png'] = appleTouchIconPath;
  logger.success('Created apple-touch-icon.png');

  // Optionally generate Safari Pinned Tab SVG (monochrome)
  if (text) {
    const safariSvg = createSafariPinnedTabSVG(text, primaryColor);
    const safariSvgPath = join(outputDir, 'safari-pinned-tab.svg');
    writeFileSync(safariSvgPath, safariSvg);
    faviconSet['safari-pinned-tab.svg'] = safariSvgPath;
    logger.success('Created safari-pinned-tab.svg');
  }

  return faviconSet as FaviconSet;
}

/**
 * Create ICO file from multiple PNG buffers
 *
 * Note: This is a simplified ICO creator. For production use,
 * consider using a dedicated ICO library like 'to-ico'
 */
async function createIcoFile(pngBuffers: Buffer[], outputPath: string): Promise<void> {
  // For now, we'll just use the 32x32 PNG as favicon.ico
  // In a real implementation, you'd combine multiple sizes into one ICO file
  // using a library like 'to-ico' or 'png-to-ico'

  // Simple approach: just use the 32x32 image
  // Most modern browsers support PNG favicons anyway
  const favicon32 = pngBuffers[1]; // 32x32 is at index 1

  writeFileSync(outputPath, favicon32);
}

/**
 * Create Safari Pinned Tab SVG (monochrome icon)
 */
function createSafariPinnedTabSVG(text: string, color: string): string {
  const displayText = text.length > 2 ? text.substring(0, 2).toUpperCase() : text.toUpperCase();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${color}" />
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="280"
    font-weight="bold"
    fill="#FFFFFF"
    text-anchor="middle"
    dominant-baseline="central"
  >${displayText}</text>
</svg>`;
}

/**
 * Generate HTML link tags for favicons
 */
export function generateFaviconHTML(faviconSet: FaviconSet, publicPath = '/'): string {
  const links: string[] = [];

  // Standard favicon
  if (faviconSet['favicon.ico']) {
    links.push(`<link rel="icon" type="image/x-icon" href="${publicPath}favicon.ico" />`);
  }

  // PNG favicons
  if (faviconSet['favicon-16x16.png']) {
    links.push(`<link rel="icon" type="image/png" sizes="16x16" href="${publicPath}favicon-16x16.png" />`);
  }

  if (faviconSet['favicon-32x32.png']) {
    links.push(`<link rel="icon" type="image/png" sizes="32x32" href="${publicPath}favicon-32x32.png" />`);
  }

  if (faviconSet['favicon-48x48.png']) {
    links.push(`<link rel="icon" type="image/png" sizes="48x48" href="${publicPath}favicon-48x48.png" />`);
  }

  // Apple Touch Icon
  if (faviconSet['apple-touch-icon.png']) {
    links.push(`<link rel="apple-touch-icon" href="${publicPath}apple-touch-icon.png" />`);
  }

  // Safari Pinned Tab
  if (faviconSet['safari-pinned-tab.svg']) {
    links.push(`<link rel="mask-icon" href="${publicPath}safari-pinned-tab.svg" color="#000000" />`);
  }

  return links.join('\n');
}

/**
 * Generate Next.js metadata for favicons (App Router)
 */
export function generateNextJSMetadata(publicPath = '/'): string {
  return `icons: {
  icon: [
    { url: '${publicPath}favicon.ico' },
    { url: '${publicPath}favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { url: '${publicPath}favicon-32x32.png', sizes: '32x32', type: 'image/png' },
  ],
  apple: [
    { url: '${publicPath}apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}`;
}

export default {
  generateFaviconSet,
  generateFaviconHTML,
  generateNextJSMetadata,
  FAVICON_SIZES,
  APPLE_ICON_SIZE
};
