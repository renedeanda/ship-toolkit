import { glob } from 'glob';
import { existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import fg from 'fast-glob';

/**
 * Utility functions for finding and searching files
 */

/**
 * Find all image files in a directory
 */
export async function findImages(directory: string): Promise<string[]> {
  const patterns = ['**/*.{png,jpg,jpeg,gif,svg,webp,ico}'];
  const ignore = ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'out/**'];

  return await fg(patterns, {
    cwd: directory,
    ignore,
    absolute: true
  });
}

/**
 * Find logo files (common naming patterns)
 */
export async function findLogo(projectRoot: string): Promise<string | null> {
  const logoPatterns = [
    'logo.{png,jpg,jpeg,svg}',
    'icon.{png,jpg,jpeg,svg}',
    '**/logo.{png,jpg,jpeg,svg}',
    '**/icon.{png,jpg,jpeg,svg}',
    'public/logo.{png,jpg,jpeg,svg}',
    'public/icon.{png,jpg,jpeg,svg}',
    'assets/logo.{png,jpg,jpeg,svg}',
    'src/assets/logo.{png,jpg,jpeg,svg}'
  ];

  const ignore = ['node_modules/**', 'dist/**', 'build/**', '.next/**'];

  for (const pattern of logoPatterns) {
    const matches = await fg(pattern, {
      cwd: projectRoot,
      ignore,
      absolute: true,
      caseSensitiveMatch: false
    });

    if (matches.length > 0) {
      return matches[0];
    }
  }

  return null;
}

/**
 * Find HTML files in a project
 */
export async function findHtmlFiles(projectRoot: string): Promise<string[]> {
  const patterns = ['**/*.html'];
  const ignore = [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.next/**',
    'out/**',
    'coverage/**'
  ];

  return await fg(patterns, {
    cwd: projectRoot,
    ignore,
    absolute: true
  });
}

/**
 * Find all pages/routes in a project based on framework conventions
 */
export async function findPages(
  projectRoot: string,
  framework: string
): Promise<string[]> {
  let patterns: string[] = [];
  let ignore = ['node_modules/**', 'dist/**', 'build/**', '.next/**'];

  switch (framework) {
    case 'next-app':
      patterns = ['app/**/page.{tsx,jsx,ts,js}'];
      break;
    case 'next-pages':
      patterns = ['pages/**/*.{tsx,jsx,ts,js}'];
      ignore.push('pages/_app.*', 'pages/_document.*', 'pages/api/**');
      break;
    case 'react-vite':
    case 'react-cra':
      patterns = ['src/pages/**/*.{tsx,jsx,ts,js}', 'src/routes/**/*.{tsx,jsx,ts,js}'];
      break;
    case 'vue':
      patterns = ['src/pages/**/*.vue', 'src/views/**/*.vue'];
      break;
    case 'svelte':
      patterns = ['src/routes/**/*.svelte'];
      break;
    case 'astro':
      patterns = ['src/pages/**/*.astro'];
      break;
    case 'static-html':
      patterns = ['**/*.html'];
      break;
  }

  if (patterns.length === 0) {
    return [];
  }

  return await fg(patterns, {
    cwd: projectRoot,
    ignore,
    absolute: true
  });
}

/**
 * Find configuration files
 */
export async function findConfigFiles(projectRoot: string): Promise<{
  package?: string;
  tsconfig?: string;
  nextConfig?: string;
  viteConfig?: string;
  tailwindConfig?: string;
  eslintConfig?: string;
}> {
  const configs: Record<string, string | undefined> = {};

  const configPatterns = {
    package: 'package.json',
    tsconfig: 'tsconfig.json',
    nextConfig: 'next.config.{js,mjs,ts}',
    viteConfig: 'vite.config.{js,ts}',
    tailwindConfig: 'tailwind.config.{js,ts}',
    eslintConfig: '.eslintrc.{js,json,yml}'
  };

  for (const [key, pattern] of Object.entries(configPatterns)) {
    const matches = await fg(pattern, {
      cwd: projectRoot,
      absolute: true,
      deep: 1
    });

    if (matches.length > 0) {
      configs[key] = matches[0];
    }
  }

  return configs;
}

/**
 * Check if a file exists (helper)
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Get file size in bytes
 */
export function getFileSize(filePath: string): number {
  if (!existsSync(filePath)) {
    return 0;
  }

  const stats = statSync(filePath);
  return stats.size;
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get the project name from package.json
 */
export function getProjectName(projectRoot: string): string | null {
  const packageJsonPath = join(projectRoot, 'package.json');

  if (!existsSync(packageJsonPath)) {
    // Fallback to directory name
    return basename(projectRoot);
  }

  try {
    const packageJson = JSON.parse(
      require('fs').readFileSync(packageJsonPath, 'utf-8')
    );
    return packageJson.name || basename(projectRoot);
  } catch {
    return basename(projectRoot);
  }
}

/**
 * Get project info from package.json
 */
export function getProjectInfo(projectRoot: string): {
  name: string;
  description?: string;
  version?: string;
  homepage?: string;
  author?: string;
  repository?: string;
} {
  const packageJsonPath = join(projectRoot, 'package.json');

  const defaultInfo = {
    name: basename(projectRoot)
  };

  if (!existsSync(packageJsonPath)) {
    return defaultInfo;
  }

  try {
    const packageJson = JSON.parse(
      require('fs').readFileSync(packageJsonPath, 'utf-8')
    );

    return {
      name: packageJson.name || basename(projectRoot),
      description: packageJson.description,
      version: packageJson.version,
      homepage: packageJson.homepage,
      author: typeof packageJson.author === 'string'
        ? packageJson.author
        : packageJson.author?.name,
      repository: typeof packageJson.repository === 'string'
        ? packageJson.repository
        : packageJson.repository?.url
    };
  } catch {
    return defaultInfo;
  }
}

export default {
  findImages,
  findLogo,
  findHtmlFiles,
  findPages,
  findConfigFiles,
  fileExists,
  getFileSize,
  formatFileSize,
  getProjectName,
  getProjectInfo
};
