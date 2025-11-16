import sharp from 'sharp';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

/**
 * Social image generation - OG images, Twitter cards
 */

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const TWITTER_IMAGE_SIZE = { width: 1200, height: 600 };

export interface SocialImageTemplate {
  title: string;
  description?: string;
  logo?: Buffer;
  backgroundColor: string;
  textColor: string;
  accentColor?: string;
  layout: 'centered' | 'left' | 'split' | 'minimal';
}

export interface SocialImageSet {
  ogImage: string;
  twitterImage: string;
}

/**
 * Generate Open Graph image
 */
export async function generateOGImage(
  template: SocialImageTemplate,
  outputPath: string
): Promise<string> {
  logger.info('Generating Open Graph image...');

  const svg = createSocialImageSVG(template, OG_IMAGE_SIZE);

  const buffer = await sharp(Buffer.from(svg))
    .resize(OG_IMAGE_SIZE.width, OG_IMAGE_SIZE.height)
    .png({ quality: 95 })
    .toBuffer();

  // Ensure directory exists
  const dir = join(outputPath, '..');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outputPath, buffer);
  logger.success(`Created OG image: ${outputPath}`);

  return outputPath;
}

/**
 * Generate Twitter card image
 */
export async function generateTwitterCard(
  template: SocialImageTemplate,
  outputPath: string
): Promise<string> {
  logger.info('Generating Twitter card image...');

  const svg = createSocialImageSVG(template, TWITTER_IMAGE_SIZE);

  const buffer = await sharp(Buffer.from(svg))
    .resize(TWITTER_IMAGE_SIZE.width, TWITTER_IMAGE_SIZE.height)
    .png({ quality: 95 })
    .toBuffer();

  // Ensure directory exists
  const dir = join(outputPath, '..');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outputPath, buffer);
  logger.success(`Created Twitter card: ${outputPath}`);

  return outputPath;
}

/**
 * Generate complete social image set
 */
export async function generateSocialImageSet(
  template: SocialImageTemplate,
  outputDir: string
): Promise<SocialImageSet> {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const ogImagePath = join(outputDir, 'og-image.png');
  const twitterImagePath = join(outputDir, 'twitter-image.png');

  await generateOGImage(template, ogImagePath);
  await generateTwitterCard(template, twitterImagePath);

  return {
    ogImage: ogImagePath,
    twitterImage: twitterImagePath
  };
}

/**
 * Create SVG for social images based on template
 */
function createSocialImageSVG(
  template: SocialImageTemplate,
  size: { width: number; height: number }
): string {
  const { title, description, backgroundColor, textColor, accentColor, layout } = template;
  const { width, height } = size;

  // Wrap text to fit within bounds
  const wrappedTitle = wrapText(title, 30); // ~30 chars per line
  const wrappedDescription = description ? wrapText(description, 60) : '';

  // Calculate positions based on layout
  let titleY = height / 2;
  let titleSize = 72;
  let descSize = 36;
  let textAnchor = 'middle';
  let titleX = width / 2;

  if (layout === 'left') {
    titleX = 100;
    titleY = height / 2 - 50;
    textAnchor = 'start';
  } else if (layout === 'split') {
    titleX = width / 4;
    textAnchor = 'start';
  }

  // Create gradient background
  const gradientColor1 = backgroundColor;
  const gradientColor2 = adjustColorBrightness(backgroundColor, -15);
  const accent = accentColor || adjustColorBrightness(backgroundColor, 30);

  // Build SVG
  let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradientColor1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradientColor2};stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg-gradient)" />
  `;

  // Add decorative elements based on layout
  if (layout === 'minimal') {
    // Add subtle accent line
    svg += `
      <rect x="100" y="${height - 120}" width="200" height="8" fill="${accent}" rx="4" />
    `;
  } else if (layout === 'split') {
    // Add vertical accent bar
    svg += `
      <rect x="${width / 2}" y="0" width="8" height="${height}" fill="${accent}" opacity="0.3" />
    `;
  }

  // Add title
  const titleLines = wrappedTitle.split('\n');
  titleLines.forEach((line, index) => {
    const lineY = titleY + (index * titleSize * 1.2);
    svg += `
      <text
        x="${titleX}"
        y="${lineY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${titleSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="${textAnchor}"
      >${escapeHtml(line)}</text>
    `;
  });

  // Add description if provided
  if (description) {
    const descLines = wrappedDescription.split('\n');
    const descY = titleY + (titleLines.length * titleSize * 1.2) + 40;

    descLines.forEach((line, index) => {
      const lineY = descY + (index * descSize * 1.2);
      svg += `
        <text
          x="${titleX}"
          y="${lineY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${descSize}"
          font-weight="normal"
          fill="${textColor}"
          opacity="0.9"
          text-anchor="${textAnchor}"
        >${escapeHtml(line)}</text>
      `;
    });
  }

  // Close SVG
  svg += `
    </svg>
  `;

  return svg;
}

/**
 * Wrap text to specified character width
 */
function wrapText(text: string, maxChars: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
}

/**
 * Adjust color brightness
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
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Escape HTML entities in text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate HTML meta tags for social images
 */
export function generateSocialMetaTags(
  ogImageUrl: string,
  twitterImageUrl: string,
  title: string,
  description?: string
): string {
  const tags: string[] = [];

  // Open Graph tags
  tags.push(`<meta property="og:image" content="${ogImageUrl}" />`);
  tags.push(`<meta property="og:image:width" content="${OG_IMAGE_SIZE.width}" />`);
  tags.push(`<meta property="og:image:height" content="${OG_IMAGE_SIZE.height}" />`);
  tags.push(`<meta property="og:image:alt" content="${escapeHtml(title)}" />`);

  // Twitter Card tags
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:image" content="${twitterImageUrl}" />`);
  tags.push(`<meta name="twitter:image:alt" content="${escapeHtml(title)}" />`);

  if (description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(description)}" />`);
    tags.push(`<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  }

  return tags.join('\n');
}

export default {
  generateOGImage,
  generateTwitterCard,
  generateSocialImageSet,
  generateSocialMetaTags,
  OG_IMAGE_SIZE,
  TWITTER_IMAGE_SIZE
};
