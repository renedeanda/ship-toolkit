import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type Framework =
  | 'next-app'      // Next.js App Router
  | 'next-pages'    // Next.js Pages Router
  | 'react-vite'    // React + Vite
  | 'react-cra'     // Create React App
  | 'vue'           // Vue.js
  | 'svelte'        // SvelteKit
  | 'astro'         // Astro
  | 'static-html'   // Static HTML
  | 'unknown';

export interface FrameworkDetectionResult {
  framework: Framework;
  version?: string;
  hasAppDir: boolean;
  hasPagesDir: boolean;
  publicDir: string;
  outputDir: string;
  layoutFile?: string;
  configFile?: string;
  confidence: number; // 0-1 score of detection confidence
  typescript: boolean; // Whether TypeScript is detected
}

/**
 * Detect the web framework used in a project
 */
export async function detectFramework(projectRoot: string): Promise<FrameworkDetectionResult> {
  const packageJsonPath = join(projectRoot, 'package.json');

  // Check for TypeScript
  const hasTypeScript = existsSync(join(projectRoot, 'tsconfig.json'));

  // Default result for static HTML
  let result: FrameworkDetectionResult = {
    framework: 'static-html',
    hasAppDir: false,
    hasPagesDir: false,
    publicDir: 'public',
    outputDir: 'public',
    confidence: 0.5,
    typescript: hasTypeScript
  };

  // Check if package.json exists
  if (!existsSync(packageJsonPath)) {
    // Try to detect from directory structure anyway
    if (existsSync(join(projectRoot, 'index.html'))) {
      result.confidence = 0.7;
    }
    return result;
  }

  let packageJson: any;
  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(content);
  } catch (error) {
    // Invalid or malformed package.json - return static HTML with low confidence
    console.error(`Failed to parse package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.confidence = 0.3;
    return result;
  }

  try {
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };

    // Check for Next.js
    if (deps.next) {
      const hasAppDir = existsSync(join(projectRoot, 'app'));
      const hasPagesDir = existsSync(join(projectRoot, 'pages'));

      // Determine confidence based on presence of expected directories
      let confidence = 0.9;
      if (!hasAppDir && !hasPagesDir) {
        confidence = 0.6; // Next.js installed but no routes yet
      }

      // Find config file
      let configFile = 'next.config.js';
      for (const variant of ['next.config.js', 'next.config.mjs', 'next.config.ts']) {
        if (existsSync(join(projectRoot, variant))) {
          configFile = variant;
          break;
        }
      }

      result = {
        framework: hasAppDir ? 'next-app' : 'next-pages',
        version: deps.next,
        hasAppDir,
        hasPagesDir,
        publicDir: 'public',
        outputDir: '.next',
        layoutFile: hasAppDir ? join('app', 'layout.tsx') : undefined,
        configFile,
        confidence,
        typescript: hasTypeScript
      };
    }
    // Check for Vite + React
    else if (deps.vite && deps.react) {
      const hasViteConfig = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'].some(f =>
        existsSync(join(projectRoot, f))
      );

      result = {
        framework: 'react-vite',
        version: deps.vite,
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'dist',
        configFile: 'vite.config.ts',
        confidence: hasViteConfig ? 0.95 : 0.85,
        typescript: hasTypeScript
      };
    }
    // Check for Create React App
    else if (deps['react-scripts']) {
      result = {
        framework: 'react-cra',
        version: deps['react-scripts'],
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'build',
        confidence: 0.95,
        typescript: hasTypeScript
      };
    }
    // Check for Vue
    else if (deps.vue) {
      const hasViteConfig = ['vite.config.ts', 'vite.config.js'].some(f =>
        existsSync(join(projectRoot, f))
      );

      result = {
        framework: 'vue',
        version: deps.vue,
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'dist',
        configFile: 'vite.config.ts',
        confidence: hasViteConfig ? 0.9 : 0.75,
        typescript: hasTypeScript
      };
    }
    // Check for SvelteKit
    else if (deps['@sveltejs/kit']) {
      result = {
        framework: 'svelte',
        version: deps['@sveltejs/kit'],
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'static',
        outputDir: 'build',
        configFile: 'svelte.config.js',
        confidence: 0.95,
        typescript: hasTypeScript
      };
    }
    // Check for Astro
    else if (deps.astro) {
      const hasAstroConfig = ['astro.config.mjs', 'astro.config.js', 'astro.config.ts'].some(f =>
        existsSync(join(projectRoot, f))
      );

      result = {
        framework: 'astro',
        version: deps.astro,
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'dist',
        configFile: 'astro.config.mjs',
        confidence: hasAstroConfig ? 0.95 : 0.85,
        typescript: hasTypeScript
      };
    }
    // Check for vanilla React (no bundler detected)
    else if (deps.react) {
      result = {
        framework: 'unknown',
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'build',
        confidence: 0.5,
        typescript: hasTypeScript
      };
    }
  } catch (error) {
    console.error('Error detecting framework:', error);
  }

  return result;
}

/**
 * Get framework-specific recommendations
 */
export function getFrameworkRecommendations(framework: Framework): {
  assetLocation: string;
  metaTagsApproach: string;
  sitemapLocation: string;
} {
  const recommendations = {
    'next-app': {
      assetLocation: 'public/',
      metaTagsApproach: 'Update app/layout.tsx with metadata export',
      sitemapLocation: 'Create app/sitemap.ts for dynamic sitemap'
    },
    'next-pages': {
      assetLocation: 'public/',
      metaTagsApproach: 'Update pages/_app.tsx or _document.tsx with Head tags',
      sitemapLocation: 'Create public/sitemap.xml'
    },
    'react-vite': {
      assetLocation: 'public/',
      metaTagsApproach: 'Update index.html <head> section',
      sitemapLocation: 'Create public/sitemap.xml'
    },
    'react-cra': {
      assetLocation: 'public/',
      metaTagsApproach: 'Update public/index.html <head> section',
      sitemapLocation: 'Create public/sitemap.xml'
    },
    'vue': {
      assetLocation: 'public/',
      metaTagsApproach: 'Update index.html or use vue-meta',
      sitemapLocation: 'Create public/sitemap.xml'
    },
    'svelte': {
      assetLocation: 'static/',
      metaTagsApproach: 'Update src/app.html <head> section',
      sitemapLocation: 'Create static/sitemap.xml'
    },
    'astro': {
      assetLocation: 'public/',
      metaTagsApproach: 'Update layout components with SEO component',
      sitemapLocation: 'Use @astrojs/sitemap integration'
    },
    'static-html': {
      assetLocation: 'assets/ or root',
      metaTagsApproach: 'Update index.html <head> section',
      sitemapLocation: 'Create sitemap.xml in root'
    },
    'unknown': {
      assetLocation: 'public/',
      metaTagsApproach: 'Manual configuration needed',
      sitemapLocation: 'Create sitemap.xml'
    }
  };

  return recommendations[framework];
}

/**
 * Get the appropriate file paths for a given framework
 */
export function getFrameworkPaths(
  projectRoot: string,
  detection: FrameworkDetectionResult
): {
  publicDir: string;
  assetsDir: string;
  layoutFile?: string;
  htmlFile?: string;
} {
  const publicDir = join(projectRoot, detection.publicDir);
  const assetsDir = publicDir;

  let layoutFile: string | undefined;
  let htmlFile: string | undefined;

  switch (detection.framework) {
    case 'next-app':
      layoutFile = join(projectRoot, 'app', 'layout.tsx');
      if (!existsSync(layoutFile)) {
        layoutFile = join(projectRoot, 'app', 'layout.jsx');
      }
      break;
    case 'next-pages':
      layoutFile = join(projectRoot, 'pages', '_app.tsx');
      if (!existsSync(layoutFile)) {
        layoutFile = join(projectRoot, 'pages', '_app.jsx');
      }
      break;
    case 'react-vite':
    case 'vue':
    case 'astro':
      htmlFile = join(projectRoot, 'index.html');
      break;
    case 'react-cra':
      htmlFile = join(projectRoot, 'public', 'index.html');
      break;
    case 'svelte':
      htmlFile = join(projectRoot, 'src', 'app.html');
      break;
    case 'static-html':
      htmlFile = join(projectRoot, 'index.html');
      break;
  }

  return {
    publicDir,
    assetsDir,
    layoutFile,
    htmlFile
  };
}

export default {
  detectFramework,
  getFrameworkRecommendations,
  getFrameworkPaths
};
