/**
 * Launch Checklist Validator - Validate project readiness for launch
 * Checks assets, SEO, performance, security, and more
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { detectFramework } from '../utils/framework-detector.js';

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'skip';

export interface ChecklistItem {
  id: string;
  name: string;
  status: CheckStatus;
  required: boolean;
  message?: string;
  fix?: string;
  automated?: boolean;
}

export interface ChecklistSection {
  name: string;
  items: ChecklistItem[];
  score: number; // 0-100
  required: boolean;
}

export interface LaunchChecklist {
  sections: ChecklistSection[];
  overallScore: number; // 0-100
  readyToLaunch: boolean;
  criticalIssues: ChecklistItem[];
  warnings: ChecklistItem[];
  timestamp: Date;
}

/**
 * Run complete launch checklist
 */
export async function runLaunchChecklist(
  projectRoot: string
): Promise<LaunchChecklist> {
  logger.info('🚀 Running pre-launch checklist...');

  const sections: ChecklistSection[] = [];

  // 1. Assets & Branding
  sections.push(await checkAssets(projectRoot));

  // 2. SEO Optimization
  sections.push(await checkSEO(projectRoot));

  // 3. Performance
  sections.push(await checkPerformance(projectRoot));

  // 4. Security
  sections.push(await checkSecurity(projectRoot));

  // 5. Functionality
  sections.push(await checkFunctionality(projectRoot));

  // 6. Analytics & Monitoring
  sections.push(await checkAnalytics(projectRoot));

  // 7. Documentation
  sections.push(await checkDocumentation(projectRoot));

  // 8. Legal & Compliance
  sections.push(await checkLegal(projectRoot));

  // Calculate overall score
  const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
  const overallScore = Math.round(totalScore / sections.length);

  // Collect critical issues and warnings
  const criticalIssues: ChecklistItem[] = [];
  const warnings: ChecklistItem[] = [];

  sections.forEach(section => {
    section.items.forEach(item => {
      if (item.status === 'fail' && item.required) {
        criticalIssues.push(item);
      } else if (item.status === 'warning') {
        warnings.push(item);
      }
    });
  });

  // Determine if ready to launch
  const readyToLaunch = criticalIssues.length === 0 && overallScore >= 70;

  const checklist: LaunchChecklist = {
    sections,
    overallScore,
    readyToLaunch,
    criticalIssues,
    warnings,
    timestamp: new Date(),
  };

  if (readyToLaunch) {
    logger.success(`Ready to launch! Score: ${overallScore}/100`);
  } else {
    logger.warn(`Not ready to launch. Score: ${overallScore}/100`);
    logger.warn(`Critical issues: ${criticalIssues.length}`);
  }

  return checklist;
}

/**
 * Check assets and branding
 */
async function checkAssets(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];

  // Check favicon
  const faviconExists = existsSync(path.join(projectRoot, 'public/favicon.ico'));
  items.push({
    id: 'favicon',
    name: 'Favicon generated',
    status: faviconExists ? 'pass' : 'fail',
    required: true,
    message: faviconExists ? 'favicon.ico found' : 'No favicon.ico',
    fix: faviconExists ? undefined : 'Run /ship-assets',
    automated: true,
  });

  // Check OG images
  const ogImages = await glob('public/*og-image*.{png,jpg}', {
    cwd: projectRoot,
  });
  items.push({
    id: 'og-images',
    name: 'Open Graph images created',
    status: ogImages.length > 0 ? 'pass' : 'fail',
    required: true,
    message: ogImages.length > 0 ? `${ogImages.length} OG images found` : 'No OG images',
    fix: ogImages.length > 0 ? undefined : 'Run /ship-assets',
    automated: true,
  });

  // Check Twitter cards
  const twitterImages = await glob('public/*twitter*.{png,jpg}', {
    cwd: projectRoot,
  });
  items.push({
    id: 'twitter-cards',
    name: 'Twitter cards configured',
    status: twitterImages.length > 0 ? 'pass' : 'warning',
    required: false,
    message: twitterImages.length > 0 ? 'Twitter images found' : 'No Twitter card images',
    automated: true,
  });

  // Check PWA icons
  const pwaIcons = await glob('public/android-chrome-*.png', {
    cwd: projectRoot,
  });
  items.push({
    id: 'pwa-icons',
    name: 'PWA icons ready',
    status: pwaIcons.length >= 2 ? 'pass' : 'warning',
    required: false,
    message: pwaIcons.length >= 2 ? `${pwaIcons.length} PWA icons found` : 'Missing PWA icons',
    automated: true,
  });

  // Check manifest
  const manifestExists = existsSync(path.join(projectRoot, 'public/manifest.json'));
  items.push({
    id: 'manifest',
    name: 'Manifest.json exists',
    status: manifestExists ? 'pass' : 'warning',
    required: false,
    message: manifestExists ? 'manifest.json found' : 'No manifest.json',
    automated: true,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'Assets & Branding',
    items,
    score,
    required: true,
  };
}

/**
 * Check SEO optimization
 */
async function checkSEO(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];
  const detection = await detectFramework(projectRoot);

  // Check sitemap
  let sitemapExists = false;
  if (detection.framework === 'next-app') {
    sitemapExists = existsSync(path.join(projectRoot, 'app/sitemap.ts')) ||
                    existsSync(path.join(projectRoot, 'app/sitemap.js'));
  } else {
    sitemapExists = existsSync(path.join(projectRoot, 'public/sitemap.xml'));
  }

  items.push({
    id: 'sitemap',
    name: 'Sitemap generated',
    status: sitemapExists ? 'pass' : 'fail',
    required: true,
    message: sitemapExists ? 'Sitemap found' : 'No sitemap',
    fix: sitemapExists ? undefined : 'Run /ship-seo',
    automated: true,
  });

  // Check robots.txt
  const robotsExists = existsSync(path.join(projectRoot, 'public/robots.txt'));
  items.push({
    id: 'robots',
    name: 'Robots.txt created',
    status: robotsExists ? 'pass' : 'fail',
    required: true,
    message: robotsExists ? 'robots.txt found' : 'No robots.txt',
    fix: robotsExists ? undefined : 'Run /ship-seo',
    automated: true,
  });

  // Check meta tags (simplified check)
  let hasMetaTags = false;
  if (detection.framework === 'next-app') {
    const layoutPath = path.join(projectRoot, 'app/layout.tsx');
    if (existsSync(layoutPath)) {
      const content = await fs.readFile(layoutPath, 'utf-8');
      hasMetaTags = content.includes('metadata') && content.includes('description');
    }
  }

  items.push({
    id: 'meta-tags',
    name: 'Meta tags complete',
    status: hasMetaTags ? 'pass' : 'warning',
    required: true,
    message: hasMetaTags ? 'Meta tags configured' : 'Meta tags may be incomplete',
    fix: hasMetaTags ? undefined : 'Run /ship-seo',
    automated: true,
  });

  // Check structured data
  items.push({
    id: 'structured-data',
    name: 'Structured data added',
    status: 'skip',
    required: false,
    message: 'Manual verification needed',
    automated: false,
  });

  // Google Search Console
  items.push({
    id: 'search-console',
    name: 'Google Search Console setup',
    status: 'skip',
    required: false,
    message: 'Manual setup required',
    automated: false,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'SEO Optimization',
    items,
    score,
    required: true,
  };
}

/**
 * Check performance
 */
async function checkPerformance(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];

  // Check if build output exists
  const buildExists = existsSync(path.join(projectRoot, '.next')) ||
                      existsSync(path.join(projectRoot, 'dist')) ||
                      existsSync(path.join(projectRoot, 'build'));

  items.push({
    id: 'build-output',
    name: 'Production build exists',
    status: buildExists ? 'pass' : 'warning',
    required: true,
    message: buildExists ? 'Build output found' : 'No build output',
    fix: buildExists ? undefined : 'Run: npm run build',
    automated: false,
  });

  // Check for optimized images (WebP)
  const webpImages = await glob('public/**/*.webp', {
    cwd: projectRoot,
  });

  items.push({
    id: 'optimized-images',
    name: 'Images optimized',
    status: webpImages.length > 0 ? 'pass' : 'warning',
    required: false,
    message: webpImages.length > 0 ? `${webpImages.length} WebP images found` : 'No optimized images',
    fix: webpImages.length === 0 ? 'Run /ship-perf' : undefined,
    automated: true,
  });

  // Check Next.js config optimization
  const detection = await detectFramework(projectRoot);
  if (detection.framework === 'next-app' || detection.framework === 'next-pages') {
    const configPath = path.join(projectRoot, 'next.config.js');
    let configOptimized = false;

    if (existsSync(configPath)) {
      const content = await fs.readFile(configPath, 'utf-8');
      configOptimized = content.includes('swcMinify') && content.includes('compress');
    }

    items.push({
      id: 'config-optimized',
      name: 'Framework config optimized',
      status: configOptimized ? 'pass' : 'warning',
      required: false,
      message: configOptimized ? 'Config optimized' : 'Config not optimized',
      fix: configOptimized ? undefined : 'Run /ship-perf',
      automated: true,
    });
  }

  // Lighthouse score (would need actual Lighthouse run)
  items.push({
    id: 'lighthouse-score',
    name: 'Lighthouse score > 90',
    status: 'skip',
    required: false,
    message: 'Run /ship-perf to check',
    automated: true,
  });

  // Core Web Vitals
  items.push({
    id: 'core-web-vitals',
    name: 'Core Web Vitals good',
    status: 'skip',
    required: false,
    message: 'Run /ship-perf to check',
    automated: true,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'Performance',
    items,
    score,
    required: true,
  };
}

/**
 * Check security
 */
async function checkSecurity(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];

  // Check for .env in .gitignore
  const gitignorePath = path.join(projectRoot, '.gitignore');
  let envIgnored = false;

  if (existsSync(gitignorePath)) {
    const content = await fs.readFile(gitignorePath, 'utf-8');
    envIgnored = content.includes('.env');
  }

  items.push({
    id: 'env-gitignore',
    name: 'Environment variables not exposed',
    status: envIgnored ? 'pass' : 'warning',
    required: true,
    message: envIgnored ? '.env is gitignored' : '.env may not be gitignored',
    automated: false,
  });

  // Check for security headers
  const detection = await detectFramework(projectRoot);
  let hasSecurityHeaders = false;

  if (detection.framework === 'next-app' || detection.framework === 'next-pages') {
    const configPath = path.join(projectRoot, 'next.config.js');
    if (existsSync(configPath)) {
      const content = await fs.readFile(configPath, 'utf-8');
      hasSecurityHeaders = content.includes('headers()');
    }
  }

  items.push({
    id: 'security-headers',
    name: 'Security headers set',
    status: hasSecurityHeaders ? 'pass' : 'warning',
    required: false,
    message: hasSecurityHeaders ? 'Headers configured' : 'No security headers',
    automated: true,
  });

  // Check dependencies for vulnerabilities
  items.push({
    id: 'dependencies',
    name: 'Dependencies up to date',
    status: 'skip',
    required: false,
    message: 'Run: npm audit',
    automated: false,
  });

  // Check for API keys in code
  items.push({
    id: 'no-secrets',
    name: 'No API keys in client code',
    status: 'skip',
    required: true,
    message: 'Manual verification needed',
    automated: false,
  });

  // HTTPS enabled
  items.push({
    id: 'https',
    name: 'HTTPS enabled',
    status: 'skip',
    required: true,
    message: 'Verify after deployment',
    automated: false,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'Security',
    items,
    score,
    required: true,
  };
}

/**
 * Check functionality
 */
async function checkFunctionality(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];

  // 404 page
  const detection = await detectFramework(projectRoot);
  let has404 = false;

  if (detection.framework === 'next-app') {
    has404 = existsSync(path.join(projectRoot, 'app/not-found.tsx')) ||
             existsSync(path.join(projectRoot, 'app/not-found.jsx'));
  } else if (detection.framework === 'next-pages') {
    has404 = existsSync(path.join(projectRoot, 'pages/404.tsx')) ||
             existsSync(path.join(projectRoot, 'pages/404.jsx'));
  }

  items.push({
    id: '404-page',
    name: '404 page exists',
    status: has404 ? 'pass' : 'warning',
    required: false,
    message: has404 ? '404 page found' : 'No custom 404 page',
    automated: false,
  });

  // Error handling
  items.push({
    id: 'error-handling',
    name: 'Error handling in place',
    status: 'skip',
    required: false,
    message: 'Manual verification needed',
    automated: false,
  });

  // Forms working
  items.push({
    id: 'forms',
    name: 'Forms working correctly',
    status: 'skip',
    required: false,
    message: 'Manual testing required',
    automated: false,
  });

  // Links not broken
  items.push({
    id: 'links',
    name: 'Links not broken',
    status: 'skip',
    required: false,
    message: 'Manual verification needed',
    automated: false,
  });

  // Mobile responsive
  items.push({
    id: 'mobile-responsive',
    name: 'Mobile responsive',
    status: 'skip',
    required: false,
    message: 'Manual testing required',
    automated: false,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'Functionality',
    items,
    score,
    required: false,
  };
}

/**
 * Check analytics and monitoring
 */
async function checkAnalytics(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];

  // Analytics installed
  items.push({
    id: 'analytics',
    name: 'Analytics installed',
    status: 'skip',
    required: false,
    message: 'Manual setup (Google Analytics, Vercel Analytics, etc.)',
    automated: false,
  });

  // Error tracking
  items.push({
    id: 'error-tracking',
    name: 'Error tracking setup',
    status: 'skip',
    required: false,
    message: 'Manual setup (Sentry, LogRocket, etc.)',
    automated: false,
  });

  // Performance monitoring
  items.push({
    id: 'performance-monitoring',
    name: 'Performance monitoring',
    status: 'skip',
    required: false,
    message: 'Manual setup',
    automated: false,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'Analytics & Monitoring',
    items,
    score,
    required: false,
  };
}

/**
 * Check documentation
 */
async function checkDocumentation(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];

  // README
  const readmeExists = existsSync(path.join(projectRoot, 'README.md'));
  items.push({
    id: 'readme',
    name: 'README.md complete',
    status: readmeExists ? 'pass' : 'warning',
    required: false,
    message: readmeExists ? 'README.md found' : 'No README.md',
    automated: false,
  });

  // CHANGELOG
  const changelogExists = existsSync(path.join(projectRoot, 'CHANGELOG.md'));
  items.push({
    id: 'changelog',
    name: 'Changelog started',
    status: changelogExists ? 'pass' : 'skip',
    required: false,
    message: changelogExists ? 'CHANGELOG.md found' : 'No CHANGELOG.md',
    automated: false,
  });

  // API docs (if applicable)
  items.push({
    id: 'api-docs',
    name: 'API docs (if applicable)',
    status: 'skip',
    required: false,
    message: 'Only if you have an API',
    automated: false,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'Documentation',
    items,
    score,
    required: false,
  };
}

/**
 * Check legal and compliance
 */
async function checkLegal(projectRoot: string): Promise<ChecklistSection> {
  const items: ChecklistItem[] = [];

  // Privacy policy
  items.push({
    id: 'privacy-policy',
    name: 'Privacy policy (if needed)',
    status: 'skip',
    required: false,
    message: 'Required if collecting user data',
    automated: false,
  });

  // Terms of service
  items.push({
    id: 'terms',
    name: 'Terms of service (if needed)',
    status: 'skip',
    required: false,
    message: 'Required for commercial apps',
    automated: false,
  });

  // Cookie consent
  items.push({
    id: 'cookies',
    name: 'Cookie consent (if needed)',
    status: 'skip',
    required: false,
    message: 'Required for GDPR compliance',
    automated: false,
  });

  const score = calculateSectionScore(items);

  return {
    name: 'Legal & Compliance',
    items,
    score,
    required: false,
  };
}

/**
 * Calculate score for a section
 */
function calculateSectionScore(items: ChecklistItem[]): number {
  if (items.length === 0) return 100;

  const total = items.length;
  const passed = items.filter(i => i.status === 'pass').length;
  const warnings = items.filter(i => i.status === 'warning').length;
  const skipped = items.filter(i => i.status === 'skip').length;

  // Pass = 100%, Warning = 50%, Skip = 75%, Fail = 0%
  const score = ((passed * 100) + (warnings * 50) + (skipped * 75)) / total;

  return Math.round(score);
}

/**
 * Get quick status check
 */
export async function getQuickStatus(
  projectRoot: string
): Promise<{ ready: boolean; score: number; missing: string[] }> {
  const checklist = await runLaunchChecklist(projectRoot);

  const missing = checklist.criticalIssues.map(i => i.name);

  return {
    ready: checklist.readyToLaunch,
    score: checklist.overallScore,
    missing,
  };
}
