import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

/**
 * SEO Analysis - Audit existing meta tags and SEO health
 */

export type IssueSeverity = 'critical' | 'warning' | 'info';
export type IssueType = 'missing' | 'invalid' | 'suboptimal';

export interface SEOIssue {
  type: IssueType;
  severity: IssueSeverity;
  message: string;
  fix?: string;
  element?: string;
}

export interface SEOAnalysis {
  score: number; // 0-100
  issues: SEOIssue[];
  suggestions: string[];
  criticalIssues: SEOIssue[];
  warnings: SEOIssue[];
  passed: string[];
}

export interface MetaTagAnalysis {
  hasTitle: boolean;
  titleLength?: number;
  hasDescription: boolean;
  descriptionLength?: number;
  hasKeywords: boolean;
  hasOGTags: boolean;
  hasTwitterCard: boolean;
  hasCanonical: boolean;
  hasViewport: boolean;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
}

export interface SchemaAnalysis {
  hasSchema: boolean;
  schemaTypes: string[];
  isValid: boolean;
  schemas: any[];
}

export interface SitemapAnalysis {
  exists: boolean;
  path?: string;
  isDynamic: boolean;
  pageCount?: number;
}

/**
 * Analyze SEO health of a project
 */
export async function analyzeSEO(projectRoot: string): Promise<SEOAnalysis> {
  const issues: SEOIssue[] = [];
  const suggestions: string[] = [];
  const passed: string[] = [];

  // Find HTML files to analyze
  const htmlFiles = await findHTMLFiles(projectRoot);

  if (htmlFiles.length === 0) {
    issues.push({
      type: 'missing',
      severity: 'warning',
      message: 'No HTML files found to analyze',
      fix: 'This might be a framework project - check layout/app files'
    });
  }

  // Analyze meta tags
  const metaAnalysis = await analyzeMetaTags(htmlFiles, projectRoot);
  const metaIssues = getMetaTagIssues(metaAnalysis);
  issues.push(...metaIssues);

  // Analyze sitemap
  const sitemapAnalysis = await analyzeSitemap(projectRoot);
  if (!sitemapAnalysis.exists) {
    issues.push({
      type: 'missing',
      severity: 'critical',
      message: 'No sitemap.xml found',
      fix: 'Run /ship-seo to generate sitemap'
    });
  } else {
    passed.push('Sitemap exists');
  }

  // Check robots.txt
  const hasRobots = existsSync(join(projectRoot, 'public', 'robots.txt')) ||
                    existsSync(join(projectRoot, 'robots.txt'));

  if (!hasRobots) {
    issues.push({
      type: 'missing',
      severity: 'critical',
      message: 'No robots.txt found',
      fix: 'Run /ship-seo to generate robots.txt'
    });
  } else {
    passed.push('Robots.txt exists');
  }

  // Analyze structured data
  const schemaAnalysis = await analyzeStructuredData(htmlFiles);
  if (!schemaAnalysis.hasSchema) {
    issues.push({
      type: 'missing',
      severity: 'warning',
      message: 'No structured data (Schema.org) found',
      fix: 'Add Schema.org markup for better search results'
    });
  } else {
    passed.push(`Structured data found (${schemaAnalysis.schemaTypes.join(', ')})`);
  }

  // Generate suggestions
  if (metaAnalysis.titleLength && metaAnalysis.titleLength < 30) {
    suggestions.push('Consider making your title longer (30-60 characters optimal)');
  }

  if (metaAnalysis.descriptionLength && metaAnalysis.descriptionLength < 120) {
    suggestions.push('Consider making your meta description longer (120-160 characters optimal)');
  }

  if (!metaAnalysis.hasKeywords) {
    suggestions.push('Consider adding keywords meta tag (though less important than before)');
  }

  // Calculate score
  const score = calculateSEOScore(issues, passed);

  // Categorize issues
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warnings = issues.filter(i => i.severity === 'warning');

  return {
    score,
    issues,
    suggestions,
    criticalIssues,
    warnings,
    passed
  };
}

/**
 * Analyze meta tags in HTML files
 */
async function analyzeMetaTags(htmlFiles: string[], projectRoot: string): Promise<MetaTagAnalysis> {
  const analysis: MetaTagAnalysis = {
    hasTitle: false,
    hasDescription: false,
    hasKeywords: false,
    hasOGTags: false,
    hasTwitterCard: false,
    hasCanonical: false,
    hasViewport: false,
    ogTags: {},
    twitterTags: {}
  };

  // Check Next.js layout files
  const layoutFiles = [
    join(projectRoot, 'app', 'layout.tsx'),
    join(projectRoot, 'app', 'layout.jsx'),
    join(projectRoot, 'pages', '_app.tsx'),
    join(projectRoot, 'pages', '_app.jsx')
  ];

  for (const layoutFile of layoutFiles) {
    if (existsSync(layoutFile)) {
      const content = readFileSync(layoutFile, 'utf-8');

      // Check for Next.js metadata export
      if (content.includes('export const metadata')) {
        analysis.hasTitle = content.includes('title:') || content.includes('title =');
        analysis.hasDescription = content.includes('description:');
        analysis.hasOGTags = content.includes('openGraph:');
        analysis.hasTwitterCard = content.includes('twitter:');
        return analysis;
      }
    }
  }

  // Analyze HTML files
  if (htmlFiles.length === 0) {
    return analysis;
  }

  const htmlFile = htmlFiles[0]; // Analyze first HTML file
  if (!existsSync(htmlFile)) {
    return analysis;
  }

  const html = readFileSync(htmlFile, 'utf-8');
  const $ = cheerio.load(html);

  // Check title
  const title = $('title').text();
  analysis.hasTitle = title.length > 0;
  analysis.titleLength = title.length;

  // Check meta description
  const description = $('meta[name="description"]').attr('content') || '';
  analysis.hasDescription = description.length > 0;
  analysis.descriptionLength = description.length;

  // Check keywords
  analysis.hasKeywords = $('meta[name="keywords"]').length > 0;

  // Check viewport
  analysis.hasViewport = $('meta[name="viewport"]').length > 0;

  // Check canonical
  analysis.hasCanonical = $('link[rel="canonical"]').length > 0;

  // Check Open Graph tags
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property');
    const content = $(el).attr('content');
    if (property && content) {
      analysis.ogTags[property] = content;
    }
  });
  analysis.hasOGTags = Object.keys(analysis.ogTags).length > 0;

  // Check Twitter Card tags
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr('name');
    const content = $(el).attr('content');
    if (name && content) {
      analysis.twitterTags[name] = content;
    }
  });
  analysis.hasTwitterCard = Object.keys(analysis.twitterTags).length > 0;

  return analysis;
}

/**
 * Get issues from meta tag analysis
 */
function getMetaTagIssues(analysis: MetaTagAnalysis): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!analysis.hasTitle) {
    issues.push({
      type: 'missing',
      severity: 'critical',
      message: 'No page title found',
      fix: 'Add <title> tag or Next.js metadata.title',
      element: '<title>'
    });
  } else if (analysis.titleLength && (analysis.titleLength < 30 || analysis.titleLength > 60)) {
    issues.push({
      type: 'suboptimal',
      severity: 'warning',
      message: `Title length (${analysis.titleLength} chars) should be 30-60 characters`,
      fix: 'Adjust title length for optimal search display'
    });
  }

  if (!analysis.hasDescription) {
    issues.push({
      type: 'missing',
      severity: 'critical',
      message: 'No meta description found',
      fix: 'Add <meta name="description"> tag',
      element: '<meta name="description">'
    });
  } else if (analysis.descriptionLength && (analysis.descriptionLength < 120 || analysis.descriptionLength > 160)) {
    issues.push({
      type: 'suboptimal',
      severity: 'warning',
      message: `Meta description length (${analysis.descriptionLength} chars) should be 120-160 characters`,
      fix: 'Adjust description length for optimal search display'
    });
  }

  if (!analysis.hasOGTags) {
    issues.push({
      type: 'missing',
      severity: 'critical',
      message: 'No Open Graph tags found',
      fix: 'Add og:title, og:description, og:image tags for social sharing',
      element: '<meta property="og:...">'
    });
  }

  if (!analysis.hasTwitterCard) {
    issues.push({
      type: 'missing',
      severity: 'warning',
      message: 'No Twitter Card tags found',
      fix: 'Add twitter:card, twitter:title, twitter:description tags',
      element: '<meta name="twitter:...">'
    });
  }

  if (!analysis.hasViewport) {
    issues.push({
      type: 'missing',
      severity: 'critical',
      message: 'No viewport meta tag found',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      element: '<meta name="viewport">'
    });
  }

  if (!analysis.hasCanonical) {
    issues.push({
      type: 'missing',
      severity: 'warning',
      message: 'No canonical URL found',
      fix: 'Add <link rel="canonical"> to prevent duplicate content issues',
      element: '<link rel="canonical">'
    });
  }

  return issues;
}

/**
 * Analyze sitemap
 */
async function analyzeSitemap(projectRoot: string): Promise<SitemapAnalysis> {
  const possiblePaths = [
    join(projectRoot, 'public', 'sitemap.xml'),
    join(projectRoot, 'sitemap.xml'),
    join(projectRoot, 'app', 'sitemap.ts'),
    join(projectRoot, 'app', 'sitemap.js')
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return {
        exists: true,
        path,
        isDynamic: path.endsWith('.ts') || path.endsWith('.js'),
        pageCount: path.endsWith('.xml') ? await countSitemapPages(path) : undefined
      };
    }
  }

  return { exists: false, isDynamic: false };
}

/**
 * Count pages in XML sitemap
 */
async function countSitemapPages(sitemapPath: string): Promise<number> {
  try {
    const xml = readFileSync(sitemapPath, 'utf-8');
    const $ = cheerio.load(xml, { xmlMode: true });
    return $('url').length;
  } catch {
    return 0;
  }
}

/**
 * Analyze structured data (Schema.org)
 */
async function analyzeStructuredData(htmlFiles: string[]): Promise<SchemaAnalysis> {
  const analysis: SchemaAnalysis = {
    hasSchema: false,
    schemaTypes: [],
    isValid: true,
    schemas: []
  };

  if (htmlFiles.length === 0) {
    return analysis;
  }

  const htmlFile = htmlFiles[0];
  if (!existsSync(htmlFile)) {
    return analysis;
  }

  const html = readFileSync(htmlFile, 'utf-8');
  const $ = cheerio.load(html);

  // Find JSON-LD scripts
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html();
    if (content) {
      try {
        const schema = JSON.parse(content);
        analysis.schemas.push(schema);

        // Extract schema type
        if (schema['@type']) {
          analysis.schemaTypes.push(schema['@type']);
        }
      } catch {
        analysis.isValid = false;
      }
    }
  });

  analysis.hasSchema = analysis.schemas.length > 0;

  return analysis;
}

/**
 * Find HTML files in project
 */
async function findHTMLFiles(projectRoot: string): Promise<string[]> {
  const possibleFiles = [
    join(projectRoot, 'index.html'),
    join(projectRoot, 'public', 'index.html'),
    join(projectRoot, 'src', 'index.html')
  ];

  return possibleFiles.filter(existsSync);
}

/**
 * Calculate SEO score (0-100)
 */
function calculateSEOScore(issues: SEOIssue[], passed: string[]): number {
  let score = 100;

  // Deduct points for issues
  for (const issue of issues) {
    if (issue.severity === 'critical') {
      score -= 15;
    } else if (issue.severity === 'warning') {
      score -= 5;
    } else {
      score -= 2;
    }
  }

  // Bonus points for passed checks
  score += passed.length * 2;

  return Math.max(0, Math.min(100, score));
}

export default {
  analyzeSEO,
  analyzeMetaTags,
  analyzeSitemap,
  analyzeStructuredData
};
