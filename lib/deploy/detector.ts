/**
 * Platform Detector - Detect deployment platform configuration
 * Supports Vercel, Netlify, Railway, Render, and GitHub Pages
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';

export type Platform =
  | 'vercel'
  | 'netlify'
  | 'railway'
  | 'render'
  | 'github-pages'
  | 'unknown';

export interface PlatformConfig {
  platform: Platform;
  configFile?: string;
  detected: boolean;
  buildCommand?: string;
  outputDir?: string;
  envVars?: Record<string, string>;
}

/**
 * Detect which deployment platform is configured
 */
export async function detectPlatform(projectRoot: string): Promise<PlatformConfig> {
  logger.info('🔍 Detecting deployment platform...');

  // Check for Vercel
  if (await hasVercelConfig(projectRoot)) {
    logger.success('Detected: Vercel');
    return {
      platform: 'vercel',
      configFile: 'vercel.json',
      detected: true,
      buildCommand: 'npm run build',
      outputDir: await getVercelOutputDir(projectRoot),
    };
  }

  // Check for Netlify
  if (await hasNetlifyConfig(projectRoot)) {
    logger.success('Detected: Netlify');
    return {
      platform: 'netlify',
      configFile: 'netlify.toml',
      detected: true,
      buildCommand: 'npm run build',
      outputDir: await getNetlifyOutputDir(projectRoot),
    };
  }

  // Check for Railway
  if (await hasRailwayConfig(projectRoot)) {
    logger.success('Detected: Railway');
    return {
      platform: 'railway',
      configFile: 'railway.json',
      detected: true,
    };
  }

  // Check for Render
  if (await hasRenderConfig(projectRoot)) {
    logger.success('Detected: Render');
    return {
      platform: 'render',
      configFile: 'render.yaml',
      detected: true,
    };
  }

  // Check for GitHub Pages
  if (await hasGitHubPagesConfig(projectRoot)) {
    logger.success('Detected: GitHub Pages');
    return {
      platform: 'github-pages',
      detected: true,
      buildCommand: 'npm run build',
    };
  }

  logger.warn('No deployment platform detected');
  return {
    platform: 'unknown',
    detected: false,
  };
}

/**
 * Check if Vercel is configured
 */
export async function hasVercelConfig(projectRoot: string): Promise<boolean> {
  const vercelJson = path.join(projectRoot, 'vercel.json');
  const nowJson = path.join(projectRoot, 'now.json'); // Legacy
  const vercelDir = path.join(projectRoot, '.vercel');

  return (
    existsSync(vercelJson) ||
    existsSync(nowJson) ||
    existsSync(vercelDir)
  );
}

/**
 * Check if Netlify is configured
 */
export async function hasNetlifyConfig(projectRoot: string): Promise<boolean> {
  const netlifyToml = path.join(projectRoot, 'netlify.toml');
  const netlifyDir = path.join(projectRoot, '.netlify');
  const redirects = path.join(projectRoot, '_redirects');

  return (
    existsSync(netlifyToml) ||
    existsSync(netlifyDir) ||
    existsSync(redirects)
  );
}

/**
 * Check if Railway is configured
 */
async function hasRailwayConfig(projectRoot: string): Promise<boolean> {
  const railwayJson = path.join(projectRoot, 'railway.json');
  const railwayToml = path.join(projectRoot, 'railway.toml');

  return existsSync(railwayJson) || existsSync(railwayToml);
}

/**
 * Check if Render is configured
 */
async function hasRenderConfig(projectRoot: string): Promise<boolean> {
  const renderYaml = path.join(projectRoot, 'render.yaml');
  return existsSync(renderYaml);
}

/**
 * Check if GitHub Pages is configured
 */
async function hasGitHubPagesConfig(projectRoot: string): Promise<boolean> {
  const workflowsDir = path.join(projectRoot, '.github', 'workflows');

  if (!existsSync(workflowsDir)) {
    return false;
  }

  try {
    const files = await fs.readdir(workflowsDir);

    // Check if any workflow file mentions pages deployment
    for (const file of files) {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        const content = await fs.readFile(path.join(workflowsDir, file), 'utf-8');
        if (content.includes('github-pages') || content.includes('pages-build-deployment')) {
          return true;
        }
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Get Vercel output directory
 */
async function getVercelOutputDir(projectRoot: string): Promise<string> {
  const vercelJson = path.join(projectRoot, 'vercel.json');

  if (existsSync(vercelJson)) {
    try {
      const config = JSON.parse(await fs.readFile(vercelJson, 'utf-8'));
      return config.buildCommand?.outputDirectory || '.next';
    } catch {
      return '.next';
    }
  }

  // Check package.json for framework detection
  const packageJson = path.join(projectRoot, 'package.json');
  if (existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(await fs.readFile(packageJson, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.next) return '.next';
      if (deps.vite) return 'dist';
      if (deps['react-scripts']) return 'build';
    } catch {
      // Fall through
    }
  }

  return 'dist';
}

/**
 * Get Netlify output directory
 */
async function getNetlifyOutputDir(projectRoot: string): Promise<string> {
  const netlifyToml = path.join(projectRoot, 'netlify.toml');

  if (existsSync(netlifyToml)) {
    try {
      const content = await fs.readFile(netlifyToml, 'utf-8');
      const publishMatch = content.match(/publish\s*=\s*"([^"]+)"/);
      if (publishMatch) {
        return publishMatch[1];
      }
    } catch {
      return 'dist';
    }
  }

  return 'dist';
}

/**
 * Create Vercel config if it doesn't exist
 */
export async function createVercelConfig(projectRoot: string): Promise<void> {
  const vercelJson = path.join(projectRoot, 'vercel.json');

  if (existsSync(vercelJson)) {
    logger.info('vercel.json already exists');
    return;
  }

  const config = {
    buildCommand: 'npm run build',
    outputDirectory: '.next',
    framework: 'nextjs',
    rewrites: [
      { source: '/(.*)', destination: '/' }
    ]
  };

  await fs.writeFile(vercelJson, JSON.stringify(config, null, 2), 'utf-8');
  logger.success('Created vercel.json');
}

/**
 * Create Netlify config if it doesn't exist
 */
export async function createNetlifyConfig(projectRoot: string): Promise<void> {
  const netlifyToml = path.join(projectRoot, 'netlify.toml');

  if (existsSync(netlifyToml)) {
    logger.info('netlify.toml already exists');
    return;
  }

  const config = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

  await fs.writeFile(netlifyToml, config, 'utf-8');
  logger.success('Created netlify.toml');
}

/**
 * Get recommended platform based on project type
 */
export async function getRecommendedPlatform(projectRoot: string): Promise<Platform> {
  const packageJson = path.join(projectRoot, 'package.json');

  if (!existsSync(packageJson)) {
    return 'netlify'; // Good for static sites
  }

  try {
    const pkg = JSON.parse(await fs.readFile(packageJson, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Next.js works best on Vercel
    if (deps.next) {
      return 'vercel';
    }

    // For other frameworks, both work well
    return 'vercel'; // Default recommendation
  } catch {
    return 'netlify';
  }
}

/**
 * Validate platform configuration
 */
export async function validatePlatformConfig(
  projectRoot: string,
  platform: Platform
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  switch (platform) {
    case 'vercel':
      // Check for build script
      const pkgPath = path.join(projectRoot, 'package.json');
      if (existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
          if (!pkg.scripts?.build) {
            errors.push('Missing "build" script in package.json');
          }
        } catch {
          errors.push('Could not read package.json');
        }
      }
      break;

    case 'netlify':
      // Similar checks for Netlify
      break;

    default:
      errors.push(`Platform ${platform} not yet supported for validation`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get platform-specific build command
 */
export function getPlatformBuildCommand(platform: Platform): string {
  const commands: Record<Platform, string> = {
    'vercel': 'npm run build',
    'netlify': 'npm run build',
    'railway': 'npm run build',
    'render': 'npm run build',
    'github-pages': 'npm run build',
    'unknown': 'npm run build',
  };

  return commands[platform];
}

/**
 * Get platform deployment URL pattern
 */
export function getPlatformUrlPattern(platform: Platform, projectName: string): string {
  const patterns: Record<Platform, string> = {
    'vercel': `https://${projectName}.vercel.app`,
    'netlify': `https://${projectName}.netlify.app`,
    'railway': `https://${projectName}.railway.app`,
    'render': `https://${projectName}.onrender.com`,
    'github-pages': `https://username.github.io/${projectName}`,
    'unknown': 'URL will be provided after deployment',
  };

  return patterns[platform];
}
