/**
 * Image Optimizer - Optimize images for web performance
 * Convert to WebP/AVIF, resize, compress, and add lazy loading
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { detectFramework } from '../utils/framework-detector.js';

export interface ImageOptimization {
  filePath: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  format: 'webp' | 'avif' | 'png' | 'jpg';
  width?: number;
  height?: number;
}

export interface OptimizationOptions {
  quality?: number; // 1-100
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'avif' | 'original';
  removeExif?: boolean;
  progressive?: boolean;
}

export interface ImageAnalysis {
  totalImages: number;
  totalSize: number;
  oversizedImages: Array<{
    path: string;
    size: number;
    dimensions: { width: number; height: number };
  }>;
  unoptimizedFormats: Array<{
    path: string;
    format: string;
    size: number;
  }>;
  missingAltTags: string[];
}

const DEFAULT_QUALITY = 85;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

/**
 * Optimize all images in a directory
 */
export async function optimizeImages(
  projectRoot: string,
  options: OptimizationOptions = {}
): Promise<ImageOptimization[]> {
  logger.info('🖼️  Optimizing images...');

  const imagePatterns = [
    'public/**/*.{jpg,jpeg,png}',
    'src/**/*.{jpg,jpeg,png}',
    'assets/**/*.{jpg,jpeg,png}',
    'images/**/*.{jpg,jpeg,png}',
  ];

  const results: ImageOptimization[] = [];

  for (const pattern of imagePatterns) {
    const files = await glob(pattern, {
      cwd: projectRoot,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'],
    });

    for (const file of files) {
      try {
        const optimization = await optimizeImage(file, options);
        results.push(optimization);
      } catch (error) {
        logger.warn(`Failed to optimize ${file}: ${error}`);
      }
    }
  }

  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const savingsPercent = totalOriginal > 0 ? (totalSavings / totalOriginal) * 100 : 0;

  logger.success(
    `Optimized ${results.length} images. Saved ${formatBytes(totalSavings)} (${savingsPercent.toFixed(1)}%)`
  );

  return results;
}

/**
 * Optimize a single image
 */
export async function optimizeImage(
  filePath: string,
  options: OptimizationOptions = {}
): Promise<ImageOptimization> {
  const stats = await fs.stat(filePath);
  const originalSize = stats.size;

  const quality = options.quality || DEFAULT_QUALITY;
  const maxWidth = options.maxWidth || MAX_WIDTH;
  const maxHeight = options.maxHeight || MAX_HEIGHT;

  // Read image metadata
  const image = sharp(filePath);
  const metadata = await image.metadata();

  let processor = sharp(filePath);

  // Resize if needed
  if (metadata.width && metadata.width > maxWidth) {
    processor = processor.resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  if (metadata.height && metadata.height > maxHeight) {
    processor = processor.resize(null, maxHeight, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  // Remove EXIF data if requested
  if (options.removeExif !== false) {
    processor = processor.rotate(); // Auto-rotate based on EXIF, then strip
  }

  // Determine output format
  let outputFormat: 'webp' | 'avif' | 'jpg' | 'png' = 'webp';
  let outputExt = '.webp';

  if (options.format === 'avif') {
    outputFormat = 'avif';
    outputExt = '.avif';
  } else if (options.format === 'original') {
    outputFormat = metadata.format === 'png' ? 'png' : 'jpg';
    outputExt = metadata.format === 'png' ? '.png' : '.jpg';
  }

  // Apply format-specific optimization
  switch (outputFormat) {
    case 'webp':
      processor = processor.webp({ quality });
      break;
    case 'avif':
      processor = processor.avif({ quality });
      break;
    case 'jpg':
      processor = processor.jpeg({
        quality,
        progressive: options.progressive !== false,
      });
      break;
    case 'png':
      processor = processor.png({
        quality,
        compressionLevel: 9,
      });
      break;
  }

  // Generate output path
  const dir = path.dirname(filePath);
  const name = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(dir, `${name}${outputExt}`);

  // Save optimized image
  await processor.toFile(outputPath);

  const optimizedStats = await fs.stat(outputPath);
  const optimizedSize = optimizedStats.size;
  const savings = originalSize - optimizedSize;
  const savingsPercent = (savings / originalSize) * 100;

  // If optimization didn't help, keep original
  if (savings <= 0 && outputPath !== filePath) {
    await fs.unlink(outputPath);
    return {
      filePath,
      originalSize,
      optimizedSize: originalSize,
      savings: 0,
      savingsPercent: 0,
      format: (metadata.format as any) || 'png',
    };
  }

  // Remove original if we created a new file
  if (outputPath !== filePath && savings > 0) {
    await fs.unlink(filePath);
  }

  return {
    filePath: outputPath,
    originalSize,
    optimizedSize,
    savings,
    savingsPercent,
    format: outputFormat,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(
  imagePath: string,
  quality: number = DEFAULT_QUALITY
): Promise<string> {
  const outputPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  await sharp(imagePath)
    .webp({ quality })
    .toFile(outputPath);

  logger.success(`Converted ${path.basename(imagePath)} to WebP`);

  return outputPath;
}

/**
 * Convert image to AVIF format (next-gen format)
 */
export async function convertToAVIF(
  imagePath: string,
  quality: number = DEFAULT_QUALITY
): Promise<string> {
  const outputPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.avif');

  await sharp(imagePath)
    .avif({ quality })
    .toFile(outputPath);

  logger.success(`Converted ${path.basename(imagePath)} to AVIF`);

  return outputPath;
}

/**
 * Generate responsive image sizes
 */
export async function generateResponsiveImages(
  imagePath: string,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
): Promise<string[]> {
  const dir = path.dirname(imagePath);
  const ext = path.extname(imagePath);
  const name = path.basename(imagePath, ext);

  const outputPaths: string[] = [];

  for (const width of sizes) {
    const outputPath = path.join(dir, `${name}-${width}w${ext}`);

    await sharp(imagePath)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .toFile(outputPath);

    outputPaths.push(outputPath);
  }

  logger.success(`Generated ${outputPaths.length} responsive images for ${path.basename(imagePath)}`);

  return outputPaths;
}

/**
 * Analyze images in project
 */
export async function analyzeImages(projectRoot: string): Promise<ImageAnalysis> {
  logger.info('🔍 Analyzing images...');

  const imagePatterns = [
    'public/**/*.{jpg,jpeg,png,gif,webp,avif}',
    'src/**/*.{jpg,jpeg,png,gif,webp,avif}',
    'assets/**/*.{jpg,jpeg,png,gif,webp,avif}',
  ];

  let totalImages = 0;
  let totalSize = 0;
  const oversizedImages: ImageAnalysis['oversizedImages'] = [];
  const unoptimizedFormats: ImageAnalysis['unoptimizedFormats'] = [];

  for (const pattern of imagePatterns) {
    const files = await glob(pattern, {
      cwd: projectRoot,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
    });

    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        const metadata = await sharp(file).metadata();

        totalImages++;
        totalSize += stats.size;

        // Check if image is oversized
        if (metadata.width && metadata.width > MAX_WIDTH) {
          oversizedImages.push({
            path: file,
            size: stats.size,
            dimensions: {
              width: metadata.width,
              height: metadata.height || 0,
            },
          });
        }

        // Check if image is in old format
        if (metadata.format === 'jpeg' || metadata.format === 'png') {
          unoptimizedFormats.push({
            path: file,
            format: metadata.format,
            size: stats.size,
          });
        }
      } catch (error) {
        logger.warn(`Failed to analyze ${file}`);
      }
    }
  }

  // Check for missing alt tags (simplified - would need HTML parsing)
  const missingAltTags: string[] = [];

  logger.success(`Analyzed ${totalImages} images (${formatBytes(totalSize)} total)`);

  return {
    totalImages,
    totalSize,
    oversizedImages,
    unoptimizedFormats,
    missingAltTags,
  };
}

/**
 * Add lazy loading to images in HTML/JSX
 */
export async function addLazyLoading(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const detection = await detectFramework(path.dirname(filePath));

  let updatedContent = content;

  if (detection.framework === 'next-app' || detection.framework === 'next-pages') {
    // Convert <img> to Next.js <Image>
    // This is a simplified version - real implementation would use AST parsing
    updatedContent = content.replace(
      /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
      '<Image $1src="$2"$3 loading="lazy" />'
    );
  } else {
    // Add loading="lazy" to regular img tags
    updatedContent = content.replace(
      /<img\s+(?!.*loading=)([^>]+)>/g,
      '<img loading="lazy" $1>'
    );
  }

  if (updatedContent !== content) {
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    logger.success(`Added lazy loading to ${path.basename(filePath)}`);
  }
}

/**
 * Convert Next.js project to use next/image
 */
export async function convertToNextImage(projectRoot: string): Promise<number> {
  logger.info('Converting images to Next.js <Image> component...');

  const files = await glob('**/*.{tsx,jsx}', {
    cwd: projectRoot,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  let converted = 0;

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');

      // Check if already using Image
      if (content.includes('next/image')) {
        continue;
      }

      // Simple conversion (real implementation would use AST)
      let updated = content;

      // Add import if needed
      if (/<img/.test(content) && !content.includes('next/image')) {
        updated = `import Image from 'next/image';\n${updated}`;
      }

      // Convert img tags (simplified)
      updated = updated.replace(
        /<img\s+src=["']([^"']+)["']\s+alt=["']([^"']+)["']([^>]*?)>/g,
        '<Image src="$1" alt="$2" width={500} height={300}$3 />'
      );

      if (updated !== content) {
        await fs.writeFile(file, updated, 'utf-8');
        converted++;
      }
    } catch (error) {
      logger.warn(`Failed to update ${file}`);
    }
  }

  logger.success(`Converted ${converted} files to use Next.js Image`);
  return converted;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
