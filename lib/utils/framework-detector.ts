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
}

/**
 * Detect the web framework used in a project
 */
export async function detectFramework(projectRoot: string): Promise<FrameworkDetectionResult> {
  const packageJsonPath = join(projectRoot, 'package.json');

  // Default result for static HTML
  let result: FrameworkDetectionResult = {
    framework: 'static-html',
    hasAppDir: false,
    hasPagesDir: false,
    publicDir: 'public',
    outputDir: 'public'
  };

  // Check if package.json exists
  if (!existsSync(packageJsonPath)) {
    return result;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check for Next.js
    if (deps.next) {
      const hasAppDir = existsSync(join(projectRoot, 'app'));
      const hasPagesDir = existsSync(join(projectRoot, 'pages'));

      result = {
        framework: hasAppDir ? 'next-app' : 'next-pages',
        version: deps.next,
        hasAppDir,
        hasPagesDir,
        publicDir: 'public',
        outputDir: '.next',
        layoutFile: hasAppDir ? join('app', 'layout.tsx') : undefined,
        configFile: 'next.config.js'
      };

      // Check for both .js and .ts variants
      if (!existsSync(join(projectRoot, 'next.config.js')) &&
          existsSync(join(projectRoot, 'next.config.mjs'))) {
        result.configFile = 'next.config.mjs';
      }
    }
    // Check for Vite + React
    else if (deps.vite && deps.react) {
      result = {
        framework: 'react-vite',
        version: deps.vite,
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'dist',
        configFile: 'vite.config.ts'
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
        outputDir: 'build'
      };
    }
    // Check for Vue
    else if (deps.vue) {
      result = {
        framework: 'vue',
        version: deps.vue,
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'dist',
        configFile: 'vite.config.ts'
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
        configFile: 'svelte.config.js'
      };
    }
    // Check for Astro
    else if (deps.astro) {
      result = {
        framework: 'astro',
        version: deps.astro,
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'dist',
        configFile: 'astro.config.mjs'
      };
    }
    // Check for vanilla React (no bundler detected)
    else if (deps.react) {
      result = {
        framework: 'unknown',
        hasAppDir: false,
        hasPagesDir: false,
        publicDir: 'public',
        outputDir: 'build'
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
