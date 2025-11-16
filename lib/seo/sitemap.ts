import { writeFileSync, existsSync, statSync } from 'fs';
import { join, relative } from 'path';
import { findPages } from '../utils/file-finder.js';
import { detectFramework } from '../utils/framework-detector.js';
import { logger } from '../utils/logger.js';

/**
 * Sitemap generation for SEO
 */

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number; // 0.0 to 1.0
  images?: string[];
}

export interface SitemapConfig {
  baseUrl: string;
  defaultChangeFreq?: ChangeFrequency;
  defaultPriority?: number;
  excludePatterns?: string[];
}

/**
 * Generate sitemap entries from project
 */
export async function generateSitemap(
  projectRoot: string,
  config: SitemapConfig
): Promise<SitemapEntry[]> {
  const detection = await detectFramework(projectRoot);
  const pages = await findPages(projectRoot, detection.framework);

  const entries: SitemapEntry[] = [];
  const excludePatterns = config.excludePatterns || ['404', '_app', '_document', 'api'];

  for (const page of pages) {
    // Skip excluded patterns
    const relativePath = relative(projectRoot, page);
    if (excludePatterns.some(pattern => relativePath.includes(pattern))) {
      continue;
    }

    // Convert file path to URL
    const url = filePathToUrl(page, projectRoot, detection.framework, config.baseUrl);

    // Get file modification time
    const stats = statSync(page);
    const lastModified = stats.mtime;

    // Determine priority based on path depth
    const priority = calculatePriority(url, config.defaultPriority);

    entries.push({
      url,
      lastModified,
      changeFrequency: config.defaultChangeFreq || 'weekly',
      priority
    });
  }

  // Add homepage if not present
  const hasHomepage = entries.some(e => e.url === config.baseUrl || e.url === `${config.baseUrl}/`);
  if (!hasHomepage) {
    entries.unshift({
      url: config.baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    });
  }

  // Sort by priority (highest first)
  entries.sort((a, b) => b.priority - a.priority);

  return entries;
}

/**
 * Create sitemap XML from entries
 */
export function createSitemapXML(entries: SitemapEntry[]): string {
  const urls = entries.map(entry => {
    const lastmod = entry.lastModified.toISOString().split('T')[0];

    return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Generate Next.js dynamic sitemap (app/sitemap.ts)
 */
export function createNextJSSitemap(entries: SitemapEntry[], baseUrl: string): string {
  const routes = entries.map(entry => {
    const path = entry.url.replace(baseUrl, '');
    return `  {
    url: '${entry.url}',
    lastModified: new Date('${entry.lastModified.toISOString()}'),
    changeFrequency: '${entry.changeFrequency}' as const,
    priority: ${entry.priority},
  }`;
  }).join(',\n');

  return `import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
${routes}
  ]
}`;
}

/**
 * Save sitemap to file
 */
export async function saveSitemap(
  entries: SitemapEntry[],
  outputPath: string,
  format: 'xml' | 'nextjs' = 'xml'
): Promise<string> {
  let content: string;

  if (format === 'nextjs') {
    // Extract base URL from first entry
    const baseUrl = entries.length > 0 ? new URL(entries[0].url).origin : 'https://example.com';
    content = createNextJSSitemap(entries, baseUrl);
  } else {
    content = createSitemapXML(entries);
  }

  writeFileSync(outputPath, content, 'utf-8');
  logger.success(`Sitemap saved to ${outputPath}`);

  return outputPath;
}

/**
 * Convert file path to URL
 */
function filePathToUrl(
  filePath: string,
  projectRoot: string,
  framework: string,
  baseUrl: string
): string {
  let relativePath = relative(projectRoot, filePath);

  // Remove framework-specific directories
  if (framework === 'next-app') {
    relativePath = relativePath.replace(/^app\//, '');
    relativePath = relativePath.replace(/\/page\.(tsx|jsx|ts|js)$/, '');
  } else if (framework === 'next-pages') {
    relativePath = relativePath.replace(/^pages\//, '');
    relativePath = relativePath.replace(/\.(tsx|jsx|ts|js)$/, '');
  } else if (framework.includes('react') || framework === 'vue') {
    relativePath = relativePath.replace(/^src\/(pages|views)\//, '');
    relativePath = relativePath.replace(/\.(tsx|jsx|ts|js|vue)$/, '');
  } else if (framework === 'svelte') {
    relativePath = relativePath.replace(/^src\/routes\//, '');
    relativePath = relativePath.replace(/\.svelte$/, '');
  } else if (framework === 'astro') {
    relativePath = relativePath.replace(/^src\/pages\//, '');
    relativePath = relativePath.replace(/\.astro$/, '');
  } else if (framework === 'static-html') {
    relativePath = relativePath.replace(/\.html$/, '');
  }

  // Handle index files
  if (relativePath === 'index' || relativePath === '') {
    return baseUrl;
  }

  // Remove trailing index
  relativePath = relativePath.replace(/\/index$/, '');

  // Construct URL
  const url = `${baseUrl}/${relativePath}`;

  return url.replace(/\/+/g, '/').replace(':/', '://');
}

/**
 * Calculate priority based on URL depth
 */
function calculatePriority(url: string, defaultPriority = 0.7): number {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Homepage
    if (path === '/' || path === '') {
      return 1.0;
    }

    // Count depth (number of slashes)
    const depth = (path.match(/\//g) || []).length;

    // Higher priority for shallow pages
    if (depth === 1) {
      return 0.9; // /about, /pricing
    } else if (depth === 2) {
      return 0.7; // /blog/post
    } else {
      return 0.5; // /blog/category/post
    }
  } catch {
    return defaultPriority;
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate sitemap index (for large sites with multiple sitemaps)
 */
export function createSitemapIndex(sitemapUrls: string[]): string {
  const sitemaps = sitemapUrls.map(url => {
    return `  <sitemap>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

/**
 * Validate sitemap URL
 */
export function validateSitemapEntry(entry: SitemapEntry): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate URL
  try {
    new URL(entry.url);
  } catch {
    errors.push(`Invalid URL: ${entry.url}`);
  }

  // Validate priority
  if (entry.priority < 0 || entry.priority > 1) {
    errors.push(`Priority must be between 0 and 1, got ${entry.priority}`);
  }

  // Validate change frequency
  const validFreqs: ChangeFrequency[] = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  if (!validFreqs.includes(entry.changeFrequency)) {
    errors.push(`Invalid change frequency: ${entry.changeFrequency}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get sitemap statistics
 */
export function getSitemapStats(entries: SitemapEntry[]): {
  totalPages: number;
  avgPriority: number;
  changeFreqDistribution: Record<ChangeFrequency, number>;
  oldestPage: Date;
  newestPage: Date;
} {
  const totalPages = entries.length;
  const avgPriority = entries.reduce((sum, e) => sum + e.priority, 0) / totalPages;

  const changeFreqDistribution: Record<string, number> = {};
  for (const entry of entries) {
    changeFreqDistribution[entry.changeFrequency] = (changeFreqDistribution[entry.changeFrequency] || 0) + 1;
  }

  const dates = entries.map(e => e.lastModified.getTime());
  const oldestPage = new Date(Math.min(...dates));
  const newestPage = new Date(Math.max(...dates));

  return {
    totalPages,
    avgPriority,
    changeFreqDistribution: changeFreqDistribution as Record<ChangeFrequency, number>,
    oldestPage,
    newestPage
  };
}

export default {
  generateSitemap,
  createSitemapXML,
  createNextJSSitemap,
  saveSitemap,
  createSitemapIndex,
  validateSitemapEntry,
  getSitemapStats
};
