import { writeFileSync } from 'fs';
import { logger } from '../utils/logger.js';

/**
 * Robots.txt generation
 */

export interface RobotsConfig {
  sitemapUrl: string;
  allowAll?: boolean;
  disallowPaths?: string[];
  crawlDelay?: number;
  customRules?: RobotsRule[];
}

export interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(config: RobotsConfig): string {
  const lines: string[] = [];

  if (config.allowAll) {
    // Allow all crawlers
    lines.push('# Allow all crawlers');
    lines.push('User-agent: *');
    lines.push('Allow: /');
    lines.push('');
  } else if (config.customRules && config.customRules.length > 0) {
    // Custom rules
    for (const rule of config.customRules) {
      lines.push(`User-agent: ${rule.userAgent}`);

      if (rule.allow) {
        rule.allow.forEach(path => {
          lines.push(`Allow: ${path}`);
        });
      }

      if (rule.disallow) {
        rule.disallow.forEach(path => {
          lines.push(`Disallow: ${path}`);
        });
      }

      if (rule.crawlDelay) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      }

      lines.push('');
    }
  } else {
    // Default: allow all with common disallows
    lines.push('# Allow all crawlers');
    lines.push('User-agent: *');
    lines.push('Allow: /');
    lines.push('');

    // Disallow paths
    if (config.disallowPaths && config.disallowPaths.length > 0) {
      lines.push('# Disallow specific paths');
      config.disallowPaths.forEach(path => {
        lines.push(`Disallow: ${path}`);
      });
      lines.push('');
    }
  }

  // Crawl delay
  if (config.crawlDelay && !config.customRules) {
    lines.push(`Crawl-delay: ${config.crawlDelay}`);
    lines.push('');
  }

  // Sitemap
  lines.push('# Sitemap');
  lines.push(`Sitemap: ${config.sitemapUrl}`);

  return lines.join('\n');
}

/**
 * Generate default robots.txt for web projects
 */
export function generateDefaultRobotsTxt(baseUrl: string): string {
  return generateRobotsTxt({
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    allowAll: true,
    disallowPaths: [
      '/api/*',
      '/admin/*',
      '/_next/static/*',
      '/private/*'
    ]
  });
}

/**
 * Generate strict robots.txt (block all)
 */
export function generateStrictRobotsTxt(sitemapUrl: string): string {
  return generateRobotsTxt({
    sitemapUrl,
    customRules: [
      {
        userAgent: '*',
        disallow: ['/']
      }
    ]
  });
}

/**
 * Save robots.txt to file
 */
export function saveRobotsTxt(content: string, outputPath: string): string {
  writeFileSync(outputPath, content, 'utf-8');
  logger.success(`robots.txt saved to ${outputPath}`);
  return outputPath;
}

/**
 * Generate Next.js robots.ts (App Router)
 */
export function generateNextJSRobots(baseUrl: string): string {
  return `import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/private/'],
    },
    sitemap: '${baseUrl}/sitemap.xml',
  }
}`;
}

/**
 * Validate robots.txt config
 */
export function validateRobotsConfig(config: RobotsConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate sitemap URL
  if (!config.sitemapUrl || config.sitemapUrl.length === 0) {
    errors.push('Sitemap URL is required');
  }

  try {
    new URL(config.sitemapUrl);
  } catch {
    errors.push('Sitemap URL must be a valid URL');
  }

  // Validate crawl delay
  if (config.crawlDelay && config.crawlDelay < 0) {
    errors.push('Crawl delay must be a positive number');
  }

  if (config.crawlDelay && config.crawlDelay > 10) {
    warnings.push('Crawl delay > 10 seconds may slow down indexing');
  }

  // Validate disallow paths
  if (config.disallowPaths) {
    config.disallowPaths.forEach(path => {
      if (!path.startsWith('/')) {
        warnings.push(`Disallow path should start with /: ${path}`);
      }
    });
  }

  // Check if blocking everything
  if (config.customRules) {
    const blockingAll = config.customRules.some(rule =>
      rule.userAgent === '*' &&
      rule.disallow?.includes('/')
    );

    if (blockingAll) {
      warnings.push('Configuration blocks all crawlers - this will prevent indexing');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Parse existing robots.txt
 */
export function parseRobotsTxt(content: string): RobotsConfig {
  const lines = content.split('\n').map(l => l.trim());
  const config: RobotsConfig = {
    sitemapUrl: '',
    customRules: []
  };

  let currentRule: RobotsRule | null = null;

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.length === 0) {
      continue;
    }

    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();

    switch (key.toLowerCase()) {
      case 'user-agent':
        if (currentRule) {
          config.customRules!.push(currentRule);
        }
        currentRule = {
          userAgent: value,
          allow: [],
          disallow: []
        };
        break;

      case 'allow':
        if (currentRule) {
          currentRule.allow = currentRule.allow || [];
          currentRule.allow.push(value);
        }
        break;

      case 'disallow':
        if (currentRule) {
          currentRule.disallow = currentRule.disallow || [];
          currentRule.disallow.push(value);
        }
        break;

      case 'crawl-delay':
        if (currentRule) {
          currentRule.crawlDelay = parseInt(value, 10);
        } else {
          config.crawlDelay = parseInt(value, 10);
        }
        break;

      case 'sitemap':
        config.sitemapUrl = value;
        break;
    }
  }

  // Add last rule
  if (currentRule) {
    config.customRules!.push(currentRule);
  }

  return config;
}

/**
 * Common robots.txt templates
 */
export const RobotsTemplates = {
  /**
   * Standard web application
   */
  standard: (baseUrl: string) => generateRobotsTxt({
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    allowAll: true,
    disallowPaths: ['/api/', '/admin/', '/_next/', '/private/']
  }),

  /**
   * E-commerce site
   */
  ecommerce: (baseUrl: string) => generateRobotsTxt({
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    allowAll: true,
    disallowPaths: [
      '/api/',
      '/admin/',
      '/cart/',
      '/checkout/',
      '/account/',
      '/_next/'
    ]
  }),

  /**
   * Blog or content site
   */
  blog: (baseUrl: string) => generateRobotsTxt({
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    allowAll: true,
    disallowPaths: ['/api/', '/admin/', '/_next/']
  }),

  /**
   * Development/staging (block all)
   */
  development: (sitemapUrl: string) => generateStrictRobotsTxt(sitemapUrl),

  /**
   * API-only (allow minimal crawling)
   */
  api: (baseUrl: string) => generateRobotsTxt({
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    customRules: [
      {
        userAgent: '*',
        allow: ['/docs/', '/api-docs/'],
        disallow: ['/']
      }
    ]
  })
};

export default {
  generateRobotsTxt,
  generateDefaultRobotsTxt,
  generateStrictRobotsTxt,
  generateNextJSRobots,
  saveRobotsTxt,
  validateRobotsConfig,
  parseRobotsTxt,
  RobotsTemplates
};
