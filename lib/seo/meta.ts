import { logger } from '../utils/logger.js';

/**
 * Meta tag generation for SEO optimization
 */

export interface MetaConfig {
  title: string;
  description: string;
  url: string;
  siteName: string;
  ogImage: string;
  twitterImage?: string;
  twitterHandle?: string;
  keywords?: string[];
  author?: string;
  themeColor?: string;
  language?: string;
  robots?: string;
}

export interface MetaTags {
  basic: string[];
  openGraph: string[];
  twitter: string[];
  additional: string[];
}

/**
 * Generate complete meta tag set
 */
export function generateMetaTags(config: MetaConfig): MetaTags {
  const tags: MetaTags = {
    basic: [],
    openGraph: [],
    twitter: [],
    additional: []
  };

  // Basic meta tags
  tags.basic.push(`<meta charset="UTF-8" />`);
  tags.basic.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`);
  tags.basic.push(`<meta name="description" content="${escapeHtml(config.description)}" />`);

  if (config.keywords && config.keywords.length > 0) {
    tags.basic.push(`<meta name="keywords" content="${config.keywords.join(', ')}" />`);
  }

  if (config.author) {
    tags.basic.push(`<meta name="author" content="${escapeHtml(config.author)}" />`);
  }

  if (config.robots) {
    tags.basic.push(`<meta name="robots" content="${config.robots}" />`);
  } else {
    tags.basic.push(`<meta name="robots" content="index, follow" />`);
  }

  // Theme color
  if (config.themeColor) {
    tags.basic.push(`<meta name="theme-color" content="${config.themeColor}" />`);
  }

  // Language
  if (config.language) {
    tags.additional.push(`<meta http-equiv="content-language" content="${config.language}" />`);
  }

  // Open Graph tags
  tags.openGraph.push(`<meta property="og:type" content="website" />`);
  tags.openGraph.push(`<meta property="og:url" content="${config.url}" />`);
  tags.openGraph.push(`<meta property="og:title" content="${escapeHtml(config.title)}" />`);
  tags.openGraph.push(`<meta property="og:description" content="${escapeHtml(config.description)}" />`);
  tags.openGraph.push(`<meta property="og:image" content="${config.ogImage}" />`);
  tags.openGraph.push(`<meta property="og:site_name" content="${escapeHtml(config.siteName)}" />`);
  tags.openGraph.push(`<meta property="og:locale" content="${config.language || 'en_US'}" />`);

  // Twitter Card tags
  tags.twitter.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.twitter.push(`<meta name="twitter:url" content="${config.url}" />`);
  tags.twitter.push(`<meta name="twitter:title" content="${escapeHtml(config.title)}" />`);
  tags.twitter.push(`<meta name="twitter:description" content="${escapeHtml(config.description)}" />`);
  tags.twitter.push(`<meta name="twitter:image" content="${config.twitterImage || config.ogImage}" />`);

  if (config.twitterHandle) {
    tags.twitter.push(`<meta name="twitter:site" content="${config.twitterHandle}" />`);
    tags.twitter.push(`<meta name="twitter:creator" content="${config.twitterHandle}" />`);
  }

  // Canonical URL
  tags.additional.push(`<link rel="canonical" href="${config.url}" />`);

  return tags;
}

/**
 * Generate HTML string with all meta tags
 */
export function generateMetaHTML(config: MetaConfig): string {
  const tags = generateMetaTags(config);

  const allTags = [
    ...tags.basic,
    ...tags.openGraph,
    ...tags.twitter,
    ...tags.additional
  ];

  return allTags.join('\n');
}

/**
 * Generate Next.js metadata object (for App Router)
 */
export function generateNextJSMetadata(config: MetaConfig): string {
  const metadata = `export const metadata: Metadata = {
  title: '${escapeJs(config.title)}',
  description: '${escapeJs(config.description)}',
  metadataBase: new URL('${config.url}'),
  ${config.keywords ? `keywords: [${config.keywords.map(k => `'${escapeJs(k)}'`).join(', ')}],` : ''}
  ${config.author ? `authors: [{ name: '${escapeJs(config.author)}' }],` : ''}
  ${config.author ? `creator: '${escapeJs(config.author)}',` : ''}
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    url: '${config.url}',
    title: '${escapeJs(config.title)}',
    description: '${escapeJs(config.description)}',
    siteName: '${escapeJs(config.siteName)}',
    images: [
      {
        url: '${config.ogImage}',
        width: 1200,
        height: 630,
        alt: '${escapeJs(config.title)}',
      },
    ],
    locale: '${config.language || 'en_US'}',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${escapeJs(config.title)}',
    description: '${escapeJs(config.description)}',
    ${config.twitterHandle ? `creator: '${config.twitterHandle}',` : ''}
    images: ['${config.twitterImage || config.ogImage}'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ${config.themeColor ? `themeColor: '${config.themeColor}',` : ''}
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};`;

  return metadata;
}

/**
 * Generate Next.js metadata for Pages Router
 */
export function generateNextJSPageMetadata(config: MetaConfig): string {
  return `<Head>
  <title>${escapeHtml(config.title)}</title>
  <meta name="description" content="${escapeHtml(config.description)}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${config.keywords ? `<meta name="keywords" content="${config.keywords.join(', ')}" />` : ''}

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${config.url}" />
  <meta property="og:title" content="${escapeHtml(config.title)}" />
  <meta property="og:description" content="${escapeHtml(config.description)}" />
  <meta property="og:image" content="${config.ogImage}" />
  <meta property="og:site_name" content="${escapeHtml(config.siteName)}" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(config.title)}" />
  <meta name="twitter:description" content="${escapeHtml(config.description)}" />
  <meta name="twitter:image" content="${config.twitterImage || config.ogImage}" />
  ${config.twitterHandle ? `<meta name="twitter:creator" content="${config.twitterHandle}" />` : ''}

  <link rel="canonical" href="${config.url}" />
  ${config.themeColor ? `<meta name="theme-color" content="${config.themeColor}" />` : ''}
</Head>`;
}

/**
 * Validate meta config
 */
export function validateMetaConfig(config: MetaConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!config.title || config.title.length === 0) {
    errors.push('Title is required');
  }

  if (!config.description || config.description.length === 0) {
    errors.push('Description is required');
  }

  if (!config.url || config.url.length === 0) {
    errors.push('URL is required');
  }

  // Length validation
  if (config.title && config.title.length > 60) {
    warnings.push('Title is longer than 60 characters - may be truncated in search results');
  }

  if (config.title && config.title.length < 30) {
    warnings.push('Title is shorter than 30 characters - consider making it more descriptive');
  }

  if (config.description && config.description.length > 160) {
    warnings.push('Description is longer than 160 characters - may be truncated');
  }

  if (config.description && config.description.length < 120) {
    warnings.push('Description is shorter than 120 characters - consider making it more descriptive');
  }

  // URL validation
  if (config.url && !isValidUrl(config.url)) {
    errors.push('URL must be a valid absolute URL (e.g., https://example.com)');
  }

  // Image URL validation
  if (config.ogImage && !isValidUrl(config.ogImage) && !config.ogImage.startsWith('/')) {
    warnings.push('OG image should be an absolute URL or start with /');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Escape HTML entities
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
 * Escape JavaScript strings
 */
function escapeJs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Validate URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate meta tags for specific page
 */
export function generatePageMetaTags(
  pageTitle: string,
  pageDescription: string,
  baseConfig: MetaConfig
): MetaTags {
  return generateMetaTags({
    ...baseConfig,
    title: pageTitle,
    description: pageDescription
  });
}

export default {
  generateMetaTags,
  generateMetaHTML,
  generateNextJSMetadata,
  generateNextJSPageMetadata,
  validateMetaConfig,
  generatePageMetaTags
};
