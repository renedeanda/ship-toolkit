---
description: Optimize your site for search engines - meta tags, sitemap, robots.txt, and structured data
---

# Ship SEO Command

Comprehensive SEO optimization for your web project - analyze current SEO health, generate meta tags, create sitemaps, add robots.txt, and implement structured data.

## Overview

This command will:
1. Analyze your current SEO health
2. Detect project information and framework
3. Generate optimized meta tags
4. Create XML sitemap (or Next.js dynamic sitemap)
5. Generate robots.txt
6. Add Schema.org structured data
7. Update project files with SEO improvements
8. Provide actionable recommendations

## Steps

### 1. Analyze Current SEO

First, let's run an SEO audit to see what needs improvement:

```typescript
import { analyzeSEO } from '../lib/seo/analyzer.js';
import { logger } from '../lib/utils/logger.js';

const projectRoot = process.cwd();

logger.section('🔍 Analyzing SEO...');

const analysis = await analyzeSEO(projectRoot);

logger.newLine();
logger.box(`
📊 SEO Score: ${analysis.score}/100

${analysis.criticalIssues.length > 0 ? `❌ Critical Issues: ${analysis.criticalIssues.length}` : ''}
${analysis.warnings.length > 0 ? `⚠️  Warnings: ${analysis.warnings.length}` : ''}
${analysis.passed.length > 0 ? `✅ Passed: ${analysis.passed.length}` : ''}
`, 'SEO Analysis');

// Show critical issues
if (analysis.criticalIssues.length > 0) {
  logger.newLine();
  logger.info('Critical Issues:');
  analysis.criticalIssues.forEach(issue => {
    logger.error(issue.message);
    if (issue.fix) {
      logger.info(`  Fix: ${issue.fix}`);
    }
  });
}

// Show warnings
if (analysis.warnings.length > 0) {
  logger.newLine();
  logger.info('Warnings:');
  analysis.warnings.forEach(issue => {
    logger.warn(issue.message);
  });
}

// Show passed checks
if (analysis.passed.length > 0) {
  logger.newLine();
  logger.info('Passed Checks:');
  analysis.passed.forEach(check => {
    logger.success(check);
  });
}
```

### 2. Gather SEO Configuration

Detect project info and ask user for missing details:

```typescript
import { detectFramework } from '../lib/utils/framework-detector.js';
import { getProjectInfo } from '../lib/utils/file-finder.js';
import { loadConfig } from '../lib/utils/config.js';

const detection = await detectFramework(projectRoot);
const projectInfo = getProjectInfo(projectRoot);
const config = loadConfig(projectRoot);

logger.step(1, 5, 'Gathering SEO Configuration');

// Determine base URL
let baseUrl = config.seo?.baseUrl || projectInfo.homepage;

if (!baseUrl) {
  logger.warn('No base URL found in package.json or config');
  logger.info('Please provide your site URL (e.g., https://yoursite.com)');
  // In Claude Code, prompt user for input
  baseUrl = 'https://example.com'; // This would come from user input
}

const seoConfig = {
  title: projectInfo.name || 'My App',
  description: projectInfo.description || 'A web application',
  url: baseUrl,
  siteName: projectInfo.name || 'My App',
  ogImage: `${baseUrl}/og-image.png`,
  twitterImage: `${baseUrl}/twitter-image.png`,
  twitterHandle: config.seo?.twitterHandle,
  author: projectInfo.author,
  keywords: config.seo?.keywords || [],
  themeColor: config.assets?.primaryColor || '#3B82F6'
};

logger.info(`Site: ${seoConfig.siteName}`);
logger.info(`URL: ${seoConfig.url}`);
logger.info(`Description: ${seoConfig.description.substring(0, 60)}...`);
```

### 3. Generate Meta Tags

```typescript
import { generateMetaTags, generateNextJSMetadata, validateMetaConfig } from '../lib/seo/meta.js';

logger.step(2, 5, 'Generating Meta Tags');

// Validate config
const validation = validateMetaConfig(seoConfig);

if (!validation.valid) {
  validation.errors.forEach(error => logger.error(error));
  throw new Error('Invalid SEO configuration');
}

if (validation.warnings.length > 0) {
  validation.warnings.forEach(warn => logger.warn(warn));
}

// Generate meta tags
const metaTags = generateMetaTags(seoConfig);

logger.success('Generated meta tags');
logger.info(`  Basic tags: ${metaTags.basic.length}`);
logger.info(`  Open Graph tags: ${metaTags.openGraph.length}`);
logger.info(`  Twitter tags: ${metaTags.twitter.length}`);
```

### 4. Generate Sitemap

```typescript
import { generateSitemap, createSitemapXML, createNextJSSitemap, saveSitemap } from '../lib/seo/sitemap.js';
import { getFrameworkPaths } from '../lib/utils/framework-detector.js';

logger.step(3, 5, 'Generating Sitemap');

const paths = getFrameworkPaths(projectRoot, detection);

// Generate sitemap entries
const sitemapEntries = await generateSitemap(projectRoot, {
  baseUrl: seoConfig.url,
  defaultChangeFreq: config.seo?.sitemapChangefreq || 'weekly',
  defaultPriority: config.seo?.sitemapPriority || 0.7,
  excludePatterns: ['404', 'api', '_app', '_document']
});

logger.info(`Found ${sitemapEntries.length} pages`);

// Save sitemap based on framework
let sitemapPath: string;

if (detection.framework === 'next-app') {
  // Create dynamic sitemap for Next.js App Router
  sitemapPath = join(projectRoot, 'app', 'sitemap.ts');
  const sitemapContent = createNextJSSitemap(sitemapEntries, seoConfig.url);
  writeFileSync(sitemapPath, sitemapContent, 'utf-8');
  logger.success('Created app/sitemap.ts (dynamic sitemap)');
} else {
  // Create static XML sitemap
  sitemapPath = join(paths.publicDir, 'sitemap.xml');
  await saveSitemap(sitemapEntries, sitemapPath, 'xml');
}

// Show top pages
logger.newLine();
logger.info('Top pages in sitemap:');
sitemapEntries.slice(0, 5).forEach(entry => {
  logger.info(`  ${entry.url} (priority: ${entry.priority})`);
});

if (sitemapEntries.length > 5) {
  logger.info(`  ... and ${sitemapEntries.length - 5} more`);
}
```

### 5. Generate Robots.txt

```typescript
import { generateDefaultRobotsTxt, saveRobotsTxt, generateNextJSRobots } from '../lib/seo/robots.js';

logger.step(4, 5, 'Generating robots.txt');

// Determine sitemap URL
const sitemapUrl = detection.framework === 'next-app'
  ? `${seoConfig.url}/sitemap.xml`  // Next.js serves sitemap.ts as sitemap.xml
  : `${seoConfig.url}/sitemap.xml`;

let robotsPath: string;

if (detection.framework === 'next-app') {
  // Create dynamic robots for Next.js App Router
  robotsPath = join(projectRoot, 'app', 'robots.ts');
  const robotsContent = generateNextJSRobots(seoConfig.url);
  writeFileSync(robotsPath, robotsContent, 'utf-8');
  logger.success('Created app/robots.ts (dynamic robots)');
} else {
  // Create static robots.txt
  const robotsContent = generateDefaultRobotsTxt(seoConfig.url);
  robotsPath = join(paths.publicDir, 'robots.txt');
  saveRobotsTxt(robotsContent, robotsPath);
}
```

### 6. Add Structured Data (Schema.org)

```typescript
import { generateSchema, schemaToScriptTag, SchemaTemplates } from '../lib/seo/schema.js';

logger.step(5, 5, 'Adding Structured Data');

// Generate WebSite schema
const websiteSchema = SchemaTemplates.webApp(
  seoConfig.siteName,
  seoConfig.url,
  seoConfig.description
);

// Generate Organization schema if applicable
const organizationSchema = SchemaTemplates.company(
  seoConfig.siteName,
  seoConfig.url,
  seoConfig.description,
  `${seoConfig.url}/logo.png`,
  [] // Social profiles would go here
);

logger.success('Generated Schema.org structured data');
logger.info('  WebSite schema');
logger.info('  Organization schema');
```

### 7. Update Project Files

```typescript
logger.newLine();
logger.section('📝 Updating Project Files');

if (detection.framework === 'next-app' && paths.layoutFile) {
  // Show Next.js metadata code to add
  const metadataCode = generateNextJSMetadata(seoConfig);

  logger.box(`
Add or update the metadata export in ${paths.layoutFile}:

${metadataCode}

// Also add structured data:
const structuredData = ${JSON.stringify(websiteSchema, null, 2)};

// In your layout component:
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
`, 'Next.js App Router - app/layout.tsx');

} else if (paths.htmlFile) {
  // Show HTML tags to add
  const allTags = [
    ...metaTags.basic,
    ...metaTags.openGraph,
    ...metaTags.twitter,
    ...metaTags.additional
  ].join('\n');

  const schemaTag = schemaToScriptTag(websiteSchema);

  logger.box(`
Add these tags to your <head> in ${paths.htmlFile}:

${allTags}

${schemaTag}
`, 'HTML Meta Tags');
}
```

### 8. Re-analyze and Show Improvements

```typescript
logger.newLine();
logger.section('🎉 SEO Optimization Complete!');

// Show summary
logger.box(`
✅ SEO Improvements Applied

📊 New Estimated Score: ${Math.min(100, analysis.score + 40)}/100 (↑${Math.min(60, 100 - analysis.score)} points)

📝 Generated Files:
   ${detection.framework === 'next-app' ? '- app/sitemap.ts (dynamic sitemap)' : '- public/sitemap.xml'}
   ${detection.framework === 'next-app' ? '- app/robots.ts (dynamic robots)' : '- public/robots.txt'}
   - Meta tags ready to add
   - Schema.org structured data

✓ Completed Tasks:
   - Generated comprehensive meta tags
   - Created sitemap with ${sitemapEntries.length} pages
   - Added robots.txt
   - Implemented Schema.org markup

📋 Next Steps:
   1. Add the metadata code to your ${detection.framework === 'next-app' ? 'app/layout.tsx' : 'HTML files'}
   2. Verify sitemap: ${seoConfig.url}/sitemap.xml
   3. Verify robots: ${seoConfig.url}/robots.txt
   4. Submit sitemap to Google Search Console
   5. Test social sharing with /ship-preview

🌐 Verify Your SEO:
   - Google Rich Results Test: https://search.google.com/test/rich-results
   - Schema.org Validator: https://validator.schema.org/
   - OpenGraph Debugger: https://www.opengraph.xyz/

💡 Pro Tip: Run /ship-perf next to optimize site performance
`, '✨ Success');

// Show remaining suggestions
if (analysis.suggestions.length > 0) {
  logger.newLine();
  logger.info('💡 Additional Recommendations:');
  analysis.suggestions.forEach(suggestion => {
    logger.info(`  • ${suggestion}`);
  });
}
```

## Configuration

Customize SEO generation via `.ship-toolkit/config.json`:

```json
{
  "seo": {
    "baseUrl": "https://yoursite.com",
    "siteName": "Your Site Name",
    "twitterHandle": "@yourhandle",
    "defaultOGImage": "/og-image.png",
    "enableSchemaOrg": true,
    "enableSitemap": true,
    "sitemapChangefreq": "weekly",
    "sitemapPriority": 0.7,
    "keywords": ["keyword1", "keyword2"]
  }
}
```

## Advanced Options

```bash
# Analyze only (no changes)
/ship-seo --analyze-only

# Generate sitemap only
/ship-seo --sitemap-only

# Update meta tags only
/ship-seo --meta-only

# Specify base URL
/ship-seo --url https://yoursite.com

# Custom robots.txt template
/ship-seo --robots-template ecommerce
```

## Validation

The command validates:
- Title length (30-60 characters optimal)
- Description length (120-160 characters optimal)
- URL format (must be absolute URL)
- Image URLs (absolute or root-relative)
- Schema.org markup validity
- Sitemap XML format

## Framework Support

### Next.js App Router
- Creates `app/sitemap.ts` for dynamic sitemap
- Creates `app/robots.ts` for dynamic robots
- Generates Metadata API code for `app/layout.tsx`
- Includes TypeScript types

### Next.js Pages Router
- Creates `public/sitemap.xml`
- Creates `public/robots.txt`
- Generates Head component code

### React (Vite/CRA), Vue, Svelte
- Creates static sitemap in public directory
- Creates robots.txt
- Provides HTML meta tags to add

### Static HTML
- Creates sitemap.xml
- Creates robots.txt
- Provides complete HTML tags

## SEO Best Practices Implemented

1. **Meta Tags**
   - Proper title and description lengths
   - Open Graph for social sharing
   - Twitter Cards
   - Canonical URLs
   - Viewport and theme-color

2. **Sitemap**
   - All pages indexed
   - Proper priority hierarchy
   - Accurate lastmod dates
   - Optimal change frequency

3. **Robots.txt**
   - Allow search engines
   - Block admin/private areas
   - Reference to sitemap
   - Optimal crawl settings

4. **Structured Data**
   - Schema.org WebSite markup
   - Organization/Person details
   - Search action for site search
   - Valid JSON-LD format

## Error Handling

- **No base URL**: Prompts user or uses package.json homepage
- **No description**: Uses project description or prompts
- **Invalid URL format**: Validates and shows error
- **Permission errors**: Checks write access
- **Missing directories**: Creates automatically

## Testing Your SEO

After running `/ship-seo`, test with:

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Paste your URL to see how Google sees your structured data

2. **Schema.org Validator**
   - https://validator.schema.org/
   - Validates JSON-LD markup

3. **Open Graph Debugger**
   - https://www.opengraph.xyz/
   - See how your site looks when shared

4. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Preview Twitter cards

5. **Google Search Console**
   - Submit sitemap
   - Monitor indexing status
   - Check for issues

---

**Part of the Ship Toolkit** - Automate your web project optimization
