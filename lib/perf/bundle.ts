/**
 * Bundle Analyzer - Analyze bundle size and dependencies
 * Find large dependencies, duplicates, and optimization opportunities
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { detectFramework } from '../utils/framework-detector.js';

export interface FileSize {
  path: string;
  size: number;
  gzipSize?: number;
  percentage: number;
}

export interface Duplicate {
  name: string;
  versions: string[];
  count: number;
  totalSize: number;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize?: number;
  largestFiles: FileSize[];
  duplicates: Duplicate[];
  suggestions: string[];
  filesByType: Record<string, number>;
}

export interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  isDevDependency: boolean;
}

/**
 * Analyze bundle size and composition
 */
export async function analyzeBundle(projectRoot: string): Promise<BundleAnalysis> {
  logger.info('📦 Analyzing bundle...');

  const detection = await detectFramework(projectRoot);
  let bundlePath = '';

  // Determine bundle location based on framework
  if (detection.framework === 'next-app' || detection.framework === 'next-pages') {
    bundlePath = path.join(projectRoot, '.next');
  } else if (detection.framework === 'react-vite' || detection.framework === 'vue') {
    bundlePath = path.join(projectRoot, 'dist');
  } else {
    bundlePath = path.join(projectRoot, 'build');
  }

  try {
    await fs.access(bundlePath);
  } catch {
    logger.warn('No build output found. Run build first.');
    return {
      totalSize: 0,
      largestFiles: [],
      duplicates: [],
      suggestions: ['Run a production build first'],
      filesByType: {},
    };
  }

  // Get all files in bundle
  const files = await glob('**/*', {
    cwd: bundlePath,
    absolute: true,
    nodir: true,
    ignore: ['**/*.map', '**/cache/**'],
  });

  let totalSize = 0;
  const fileSizes: FileSize[] = [];
  const filesByType: Record<string, number> = {};

  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      const size = stats.size;
      totalSize += size;

      const ext = path.extname(file);
      filesByType[ext] = (filesByType[ext] || 0) + size;

      fileSizes.push({
        path: path.relative(projectRoot, file),
        size,
        percentage: 0, // Will calculate after we have totalSize
      });
    } catch (error) {
      // Skip files we can't read
    }
  }

  // Calculate percentages
  fileSizes.forEach(f => {
    f.percentage = totalSize > 0 ? (f.size / totalSize) * 100 : 0;
  });

  // Sort by size and get top 10
  const largestFiles = fileSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  // Find duplicates (simplified - would need actual dependency analysis)
  const duplicates = await findDuplicateDependencies(projectRoot);

  // Generate suggestions
  const suggestions = await generateBundleSuggestions(
    projectRoot,
    largestFiles,
    filesByType,
    totalSize
  );

  logger.success(`Bundle analysis complete. Total size: ${formatBytes(totalSize)}`);

  return {
    totalSize,
    largestFiles,
    duplicates,
    suggestions,
    filesByType,
  };
}

/**
 * Find duplicate dependencies
 */
async function findDuplicateDependencies(projectRoot: string): Promise<Duplicate[]> {
  try {
    const lockfilePath = path.join(projectRoot, 'package-lock.json');
    const lockContent = await fs.readFile(lockfilePath, 'utf-8');
    const lockData = JSON.parse(lockContent);

    const packageVersions = new Map<string, Set<string>>();

    // Parse lock file for duplicate versions
    if (lockData.packages) {
      for (const [pkgPath, pkgInfo] of Object.entries(lockData.packages as any)) {
        if (pkgPath === '') continue;

        const parts = pkgPath.split('node_modules/');
        const pkgName = parts[parts.length - 1];

        if (!packageVersions.has(pkgName)) {
          packageVersions.set(pkgName, new Set());
        }

        const packageInfo = pkgInfo as any;
        if (packageInfo.version) {
          packageVersions.get(pkgName)!.add(packageInfo.version);
        }
      }
    }

    // Find duplicates
    const duplicates: Duplicate[] = [];

    for (const [name, versions] of packageVersions.entries()) {
      if (versions.size > 1) {
        duplicates.push({
          name,
          versions: Array.from(versions),
          count: versions.size,
          totalSize: 0, // Would need actual size calculation
        });
      }
    }

    return duplicates.sort((a, b) => b.count - a.count).slice(0, 10);
  } catch (error) {
    logger.warn('Could not analyze dependencies for duplicates');
    return [];
  }
}

/**
 * Generate bundle optimization suggestions
 */
async function generateBundleSuggestions(
  projectRoot: string,
  largestFiles: FileSize[],
  filesByType: Record<string, number>,
  totalSize: number
): Promise<string[]> {
  const suggestions: string[] = [];

  // Check total bundle size
  const totalMB = totalSize / (1024 * 1024);
  if (totalMB > 1) {
    suggestions.push(`Bundle is ${totalMB.toFixed(1)} MB - consider code splitting`);
  }

  // Check for large JS files
  const jsSize = (filesByType['.js'] || 0) + (filesByType['.mjs'] || 0);
  const jsMB = jsSize / (1024 * 1024);
  if (jsMB > 0.5) {
    suggestions.push(`JavaScript bundle is ${jsMB.toFixed(1)} MB - enable tree-shaking and minification`);
  }

  // Check for large individual files
  const largeFiles = largestFiles.filter(f => f.size > 100 * 1024);
  if (largeFiles.length > 0) {
    suggestions.push(`Found ${largeFiles.length} files over 100 KB - consider code splitting`);
  }

  // Check for CSS size
  const cssSize = filesByType['.css'] || 0;
  if (cssSize > 50 * 1024) {
    suggestions.push(`CSS is ${formatBytes(cssSize)} - consider removing unused CSS`);
  }

  // Check for uncompressed assets
  const hasGzip = await checkGzipSupport(projectRoot);
  if (!hasGzip) {
    suggestions.push('Enable gzip/brotli compression for faster transfers');
  }

  // Framework-specific suggestions
  const detection = await detectFramework(projectRoot);

  if (detection.framework === 'next-app' || detection.framework === 'next-pages') {
    suggestions.push('Use Next.js dynamic imports for code splitting');
    suggestions.push('Enable SWC minification in next.config.js');
  } else if (detection.framework === 'react-vite' || detection.framework === 'vue') {
    suggestions.push('Use Vite\'s code splitting with dynamic imports');
    suggestions.push('Enable build.rollupOptions.output.manualChunks');
  }

  return suggestions;
}

/**
 * Check if gzip compression is enabled
 */
async function checkGzipSupport(projectRoot: string): Promise<boolean> {
  const detection = await detectFramework(projectRoot);

  if (detection.framework === 'next-app' || detection.framework === 'next-pages') {
    try {
      const configPath = path.join(projectRoot, 'next.config.js');
      const configContent = await fs.readFile(configPath, 'utf-8');
      return configContent.includes('compress: true');
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Find unused dependencies
 */
export async function findUnusedDependencies(projectRoot: string): Promise<string[]> {
  logger.info('🔍 Finding unused dependencies...');

  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    const pkgContent = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    // Get all source files
    const sourceFiles = await glob('**/*.{js,jsx,ts,tsx}', {
      cwd: projectRoot,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/build/**'],
    });

    // Check which dependencies are imported
    const usedDeps = new Set<string>();

    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');

        // Find all imports (simplified)
        const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const imported = match[1];

          // Extract package name (handle scoped packages)
          let pkgName = imported;
          if (imported.startsWith('@')) {
            pkgName = imported.split('/').slice(0, 2).join('/');
          } else {
            pkgName = imported.split('/')[0];
          }

          if (allDeps[pkgName]) {
            usedDeps.add(pkgName);
          }
        }
      } catch {
        // Skip files we can't read
      }
    }

    // Find unused
    const unused: string[] = [];
    for (const dep of Object.keys(allDeps)) {
      if (!usedDeps.has(dep)) {
        // Some packages are used indirectly or in configs
        const commonIndirect = ['typescript', 'eslint', 'prettier', '@types/', 'jest'];
        if (!commonIndirect.some(prefix => dep.startsWith(prefix))) {
          unused.push(dep);
        }
      }
    }

    if (unused.length > 0) {
      logger.warn(`Found ${unused.length} potentially unused dependencies`);
    } else {
      logger.success('No obviously unused dependencies found');
    }

    return unused;
  } catch (error) {
    logger.error(`Failed to analyze dependencies: ${error}`);
    return [];
  }
}

/**
 * Suggest code splitting opportunities
 */
export async function suggestCodeSplitting(projectRoot: string): Promise<string[]> {
  logger.info('🔍 Analyzing code splitting opportunities...');

  const suggestions: string[] = [];
  const detection = await detectFramework(projectRoot);

  // Find large components
  const componentFiles = await glob('**/*.{jsx,tsx}', {
    cwd: projectRoot,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  });

  const largeComponents: Array<{ file: string; size: number }> = [];

  for (const file of componentFiles) {
    try {
      const stats = await fs.stat(file);
      if (stats.size > 10 * 1024) { // > 10 KB
        largeComponents.push({
          file: path.relative(projectRoot, file),
          size: stats.size,
        });
      }
    } catch {
      // Skip
    }
  }

  if (largeComponents.length > 0) {
    suggestions.push(`Found ${largeComponents.length} large components that could be lazy-loaded`);

    if (detection.framework === 'next-app' || detection.framework === 'next-pages') {
      suggestions.push('Use next/dynamic for lazy loading: import dynamic from "next/dynamic"');
      suggestions.push('Example: const MyComponent = dynamic(() => import("./MyComponent"))');
    } else {
      suggestions.push('Use React.lazy for lazy loading: const MyComponent = React.lazy(() => import("./MyComponent"))');
    }
  }

  // Check for route-based splitting
  const hasRoutes = await glob('**/routes/**/*.{jsx,tsx}', {
    cwd: projectRoot,
  });

  if (hasRoutes.length > 5) {
    suggestions.push('Consider route-based code splitting for better initial load time');
  }

  return suggestions;
}

/**
 * Get dependency sizes
 */
export async function getDependencySizes(projectRoot: string): Promise<DependencyInfo[]> {
  const nodeModules = path.join(projectRoot, 'node_modules');

  try {
    await fs.access(nodeModules);
  } catch {
    return [];
  }

  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));

  const deps: DependencyInfo[] = [];

  for (const [name, version] of Object.entries({ ...pkg.dependencies } as Record<string, string>)) {
    const depPath = path.join(nodeModules, name);

    try {
      const size = await getDirectorySize(depPath);
      deps.push({
        name,
        version,
        size,
        isDevDependency: false,
      });
    } catch {
      // Skip if can't read
    }
  }

  return deps.sort((a, b) => b.size - a.size);
}

/**
 * Get total size of a directory
 */
async function getDirectorySize(dirPath: string): Promise<number> {
  let size = 0;

  try {
    const files = await glob('**/*', {
      cwd: dirPath,
      absolute: true,
      nodir: true,
    });

    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        size += stats.size;
      } catch {
        // Skip
      }
    }
  } catch {
    // Skip
  }

  return size;
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
