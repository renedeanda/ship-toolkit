import sharp from 'sharp';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateMultipleSizes, optimizeImage } from './generator.js';
import { logger } from '../utils/logger.js';

/**
 * PWA (Progressive Web App) icon and manifest generation
 */

export const ANDROID_ICON_SIZES = [192, 512];
export const PWA_ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

export interface PWAIconSet {
  'android-chrome-192x192.png': string;
  'android-chrome-512x512.png': string;
  'manifest.json': string;
}

export interface PWAConfig {
  name: string;
  shortName: string;
  description?: string;
  startUrl?: string;
  themeColor: string;
  backgroundColor: string;
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  icons?: PWAIcon[];
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface WebManifest {
  name: string;
  short_name: string;
  description?: string;
  start_url: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: PWAIcon[];
}

/**
 * Generate PWA icons from source image
 */
export async function generatePWAIcons(
  sourceImage: Buffer,
  outputDir: string
): Promise<PWAIconSet> {
  logger.info('Generating PWA icons...');

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Generate Android Chrome icons (192 and 512)
  const icon192 = await sharp(sourceImage)
    .resize(192, 192)
    .png()
    .toBuffer();

  const icon512 = await sharp(sourceImage)
    .resize(512, 512)
    .png()
    .toBuffer();

  // Save icons
  const icon192Path = join(outputDir, 'android-chrome-192x192.png');
  const icon512Path = join(outputDir, 'android-chrome-512x512.png');

  writeFileSync(icon192Path, await optimizeImage(icon192));
  writeFileSync(icon512Path, await optimizeImage(icon512));

  logger.success('Created android-chrome-192x192.png');
  logger.success('Created android-chrome-512x512.png');

  return {
    'android-chrome-192x192.png': icon192Path,
    'android-chrome-512x512.png': icon512Path,
    'manifest.json': '' // Will be set by createManifest
  };
}

/**
 * Create Web App Manifest (manifest.json)
 */
export async function createManifest(
  config: PWAConfig,
  outputPath: string
): Promise<string> {
  logger.info('Creating manifest.json...');

  const manifest: WebManifest = {
    name: config.name,
    short_name: config.shortName || config.name.substring(0, 12),
    description: config.description,
    start_url: config.startUrl || '/',
    display: config.display || 'standalone',
    theme_color: config.themeColor,
    background_color: config.backgroundColor,
    icons: config.icons || [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };

  // Ensure directory exists
  const dir = join(outputPath, '..');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
  logger.success('Created manifest.json');

  return outputPath;
}

/**
 * Generate complete PWA asset set
 */
export async function generatePWAAssetSet(
  sourceImage: Buffer,
  config: PWAConfig,
  outputDir: string
): Promise<PWAIconSet> {
  const iconSet = await generatePWAIcons(sourceImage, outputDir);
  const manifestPath = join(outputDir, 'manifest.json');

  await createManifest(config, manifestPath);

  iconSet['manifest.json'] = manifestPath;

  return iconSet;
}

/**
 * Generate all PWA icon sizes (comprehensive set)
 */
export async function generateAllPWAIconSizes(
  sourceImage: Buffer,
  outputDir: string
): Promise<Map<number, string>> {
  logger.info('Generating comprehensive PWA icon set...');

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const sizes = await generateMultipleSizes(sourceImage, PWA_ICON_SIZES);
  const iconPaths = new Map<number, string>();

  for (const [size, buffer] of sizes.entries()) {
    const filename = `icon-${size}x${size}.png`;
    const filepath = join(outputDir, filename);

    writeFileSync(filepath, await optimizeImage(buffer));
    iconPaths.set(size, filepath);

    logger.success(`Created ${filename}`);
  }

  return iconPaths;
}

/**
 * Generate HTML link tag for manifest
 */
export function generateManifestHTML(manifestPath = '/manifest.json'): string {
  return `<link rel="manifest" href="${manifestPath}" />`;
}

/**
 * Generate theme color meta tag
 */
export function generateThemeColorHTML(color: string): string {
  return `<meta name="theme-color" content="${color}" />`;
}

/**
 * Generate Next.js metadata for PWA
 */
export function generateNextJSPWAMetadata(config: PWAConfig): string {
  return `manifest: '${config.startUrl || '/'}manifest.json',
themeColor: '${config.themeColor}',
viewport: {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
},
appleWebApp: {
  capable: true,
  statusBarStyle: 'default',
  title: '${config.shortName || config.name}',
}`;
}

/**
 * Validate PWA config
 */
export function validatePWAConfig(config: PWAConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.name || config.name.length === 0) {
    errors.push('PWA name is required');
  }

  if (config.name && config.name.length > 45) {
    errors.push('PWA name should be less than 45 characters');
  }

  if (!config.themeColor) {
    errors.push('Theme color is required');
  }

  if (!config.backgroundColor) {
    errors.push('Background color is required');
  }

  // Validate hex colors
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (config.themeColor && !hexColorRegex.test(config.themeColor)) {
    errors.push('Theme color must be a valid hex color (e.g., #FF0000)');
  }

  if (config.backgroundColor && !hexColorRegex.test(config.backgroundColor)) {
    errors.push('Background color must be a valid hex color (e.g., #FFFFFF)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create maskable icon (with padding for safe area)
 */
export async function createMaskableIcon(
  sourceImage: Buffer,
  size: number,
  padding: number = 0.1
): Promise<Buffer> {
  // Maskable icons need 10% padding on all sides
  const paddingPixels = Math.round(size * padding);
  const innerSize = size - (paddingPixels * 2);

  // Create canvas with background color
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  // Resize source image to fit with padding
  const resizedSource = await sharp(sourceImage)
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // Composite the resized image onto the canvas
  return await canvas
    .composite([{
      input: resizedSource,
      top: paddingPixels,
      left: paddingPixels
    }])
    .png()
    .toBuffer();
}

export default {
  generatePWAIcons,
  generatePWAAssetSet,
  generateAllPWAIconSizes,
  createManifest,
  createMaskableIcon,
  generateManifestHTML,
  generateThemeColorHTML,
  generateNextJSPWAMetadata,
  validatePWAConfig,
  ANDROID_ICON_SIZES,
  PWA_ICON_SIZES
};
