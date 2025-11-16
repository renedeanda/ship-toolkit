import sharp from 'sharp';
import { existsSync, readFileSync } from 'fs';
import { logger } from '../utils/logger.js';

/**
 * Core image generation functionality using Sharp
 */

export interface AssetConfig {
  name: string;
  primaryColor: string;
  backgroundColor?: string;
  logoPath?: string;
  logoText?: string;
  style: 'gradient' | 'solid' | 'pattern' | 'minimal';
}

export interface Size {
  width: number;
  height: number;
}

export interface GeneratedAsset {
  path: string;
  size: Size;
  type: 'favicon' | 'social' | 'pwa';
  format: 'png' | 'ico' | 'svg';
  buffer: Buffer;
}

export interface TextOptions {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor: string;
  style: 'gradient' | 'solid' | 'minimal';
}

/**
 * Generate image from text (creates a simple text logo)
 */
export async function generateFromText(
  text: string,
  size: number,
  options: TextOptions
): Promise<Buffer> {
  const { fontSize, color, backgroundColor, style } = options;

  // Create SVG with text
  const svg = createTextSVG(text, size, fontSize, color, backgroundColor, style);

  // Convert SVG to PNG
  return await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();
}

/**
 * Generate image from logo file (PNG, JPG, SVG)
 */
export async function generateFromLogo(
  logoPath: string,
  size: Size
): Promise<Buffer> {
  if (!existsSync(logoPath)) {
    throw new Error(`Logo file not found: ${logoPath}`);
  }

  const image = sharp(logoPath);
  const metadata = await image.metadata();

  // Determine if we need to add padding to maintain aspect ratio
  const { width, height } = size;

  return await image
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
}

/**
 * Optimize an image buffer
 */
export async function optimizeImage(buffer: Buffer, quality = 90): Promise<Buffer> {
  return await sharp(buffer)
    .png({
      quality,
      compressionLevel: 9,
      adaptiveFiltering: true
    })
    .toBuffer();
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(buffer: Buffer, quality = 85): Promise<Buffer> {
  return await sharp(buffer)
    .webp({ quality })
    .toBuffer();
}

/**
 * Convert image to AVIF format (next-gen format)
 */
export async function convertToAVIF(buffer: Buffer, quality = 80): Promise<Buffer> {
  return await sharp(buffer)
    .avif({ quality })
    .toBuffer();
}

/**
 * Resize image to specific dimensions
 */
export async function resizeImage(
  buffer: Buffer,
  width: number,
  height: number,
  fit: 'contain' | 'cover' | 'fill' = 'contain'
): Promise<Buffer> {
  return await sharp(buffer)
    .resize(width, height, {
      fit,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
}

/**
 * Create multiple sizes from a source image
 */
export async function generateMultipleSizes(
  sourceBuffer: Buffer,
  sizes: number[]
): Promise<Map<number, Buffer>> {
  const results = new Map<number, Buffer>();

  for (const size of sizes) {
    const resized = await resizeImage(sourceBuffer, size, size);
    results.set(size, resized);
  }

  return results;
}

/**
 * Add padding/border to an image
 */
export async function addPadding(
  buffer: Buffer,
  padding: number,
  backgroundColor = '#FFFFFF'
): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image metadata');
  }

  const newWidth = metadata.width + (padding * 2);
  const newHeight = metadata.height + (padding * 2);

  // Parse hex color to RGB
  const rgb = hexToRgb(backgroundColor);

  return await sharp({
    create: {
      width: newWidth,
      height: newHeight,
      channels: 4,
      background: rgb
    }
  })
    .composite([{
      input: buffer,
      top: padding,
      left: padding
    }])
    .png()
    .toBuffer();
}

/**
 * Create SVG text logo
 */
function createTextSVG(
  text: string,
  size: number,
  fontSize: number,
  textColor: string,
  backgroundColor: string,
  style: 'gradient' | 'solid' | 'minimal'
): string {
  // Get first letter or first two letters
  const displayText = text.length > 2 ? text.substring(0, 2).toUpperCase() : text.toUpperCase();

  let backgroundDef = '';

  if (style === 'gradient') {
    // Create gradient background
    const gradientColor1 = backgroundColor;
    const gradientColor2 = adjustColorBrightness(backgroundColor, -20);

    backgroundDef = `
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradientColor1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradientColor2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg-gradient)" />
    `;
  } else if (style === 'solid') {
    backgroundDef = `<rect width="${size}" height="${size}" fill="${backgroundColor}" />`;
  } else {
    // Minimal - transparent or white background
    backgroundDef = `<rect width="${size}" height="${size}" fill="#FFFFFF" />`;
  }

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDef}
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle"
        dominant-baseline="central"
      >${displayText}</text>
    </svg>
  `;
}

/**
 * Adjust color brightness (for gradients)
 */
function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);

  const adjust = (value: number) => {
    const adjusted = value + (value * percent / 100);
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  const newR = adjust(rgb.r);
  const newG = adjust(rgb.g);
  const newB = adjust(rgb.b);

  return rgbToHex(newR, newG, newB);
}

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number; alpha: number } {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b, alpha: 1 };
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<Size> {
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }

  return {
    width: metadata.width,
    height: metadata.height
  };
}

/**
 * Validate image format
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    await sharp(buffer).metadata();
    return true;
  } catch {
    return false;
  }
}

export default {
  generateFromText,
  generateFromLogo,
  optimizeImage,
  convertToWebP,
  convertToAVIF,
  resizeImage,
  generateMultipleSizes,
  addPadding,
  getImageDimensions,
  isValidImage
};
