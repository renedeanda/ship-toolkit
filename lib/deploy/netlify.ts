/**
 * Netlify Deployment - Deploy to Netlify platform
 * Handles authentication and deployment via Netlify CLI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

export interface NetlifyDeployResult {
  url: string;
  deployId?: string;
  status: 'success' | 'failed';
  logs?: string[];
  error?: string;
}

/**
 * Check if Netlify CLI is installed
 */
export async function isNetlifyCLIInstalled(): Promise<boolean> {
  try {
    await execAsync('netlify --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Install Netlify CLI
 */
export async function installNetlifyCLI(): Promise<void> {
  logger.info('Installing Netlify CLI...');

  try {
    await execAsync('npm install -g netlify-cli');
    logger.success('Netlify CLI installed successfully');
  } catch (error) {
    throw new Error(`Failed to install Netlify CLI: ${error}`);
  }
}

/**
 * Check if user is logged in to Netlify
 */
export async function checkNetlifyAuth(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('netlify status');
    return stdout.includes('Logged in');
  } catch {
    return false;
  }
}

/**
 * Login to Netlify
 */
export async function loginToNetlify(): Promise<void> {
  logger.info('Please login to Netlify...');
  logger.info('A browser window will open for authentication');

  try {
    await execAsync('netlify login');
    logger.success('Successfully logged in to Netlify');
  } catch (error) {
    throw new Error(`Netlify login failed: ${error}`);
  }
}

/**
 * Deploy to Netlify
 */
export async function deployToNetlify(
  projectRoot: string,
  production: boolean = true
): Promise<NetlifyDeployResult> {
  logger.info('🚀 Deploying to Netlify...');

  // Check if CLI is installed
  if (!(await isNetlifyCLIInstalled())) {
    logger.warn('Netlify CLI not installed');
    await installNetlifyCLI();
  }

  // Check authentication
  if (!(await checkNetlifyAuth())) {
    await loginToNetlify();
  }

  try {
    // Get output directory
    const outputDir = await getOutputDirectory(projectRoot);

    // Build the deployment command
    const deployCommand = production
      ? `netlify deploy --prod --dir ${outputDir}`
      : `netlify deploy --dir ${outputDir}`;

    logger.info(`Running: ${deployCommand}`);

    // Execute deployment
    const { stdout, stderr } = await execAsync(deployCommand, {
      cwd: projectRoot,
      maxBuffer: 10 * 1024 * 1024,
    });

    // Extract deployment URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+\.netlify\.app/);
    const url = urlMatch ? urlMatch[0] : '';

    if (!url) {
      throw new Error('Could not extract deployment URL from Netlify output');
    }

    logger.success(`Deployment successful!`);
    logger.success(`Live URL: ${url}`);

    return {
      url,
      status: 'success',
      logs: stdout.split('\n'),
    };
  } catch (error: any) {
    logger.error(`Deployment failed: ${error.message}`);

    return {
      url: '',
      status: 'failed',
      error: error.message,
      logs: error.stdout ? error.stdout.split('\n') : [],
    };
  }
}

/**
 * Get output directory for Netlify deployment
 */
async function getOutputDirectory(projectRoot: string): Promise<string> {
  // Check netlify.toml
  const netlifyToml = path.join(projectRoot, 'netlify.toml');

  if (existsSync(netlifyToml)) {
    try {
      const content = await fs.readFile(netlifyToml, 'utf-8');
      const publishMatch = content.match(/publish\s*=\s*"([^"]+)"/);

      if (publishMatch) {
        return publishMatch[1];
      }
    } catch {
      // Fall through to default detection
    }
  }

  // Check package.json for framework hints
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
 * Build project before deployment
 */
export async function buildNetlifyProject(projectRoot: string): Promise<boolean> {
  logger.info('Building project...');

  try {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: projectRoot,
      maxBuffer: 10 * 1024 * 1024,
    });

    logger.success('Build successful');

    // Log warnings
    if (stderr) {
      const warnings = stderr.split('\n').filter(line =>
        line.toLowerCase().includes('warn')
      );

      warnings.forEach(warning => logger.warn(warning));
    }

    return true;
  } catch (error: any) {
    logger.error('Build failed');

    if (error.stdout) {
      logger.error(error.stdout);
    }

    if (error.stderr) {
      logger.error(error.stderr);
    }

    return false;
  }
}

/**
 * Initialize Netlify site
 */
export async function initNetlifySite(projectRoot: string): Promise<void> {
  logger.info('Initializing Netlify site...');

  try {
    await execAsync('netlify init', {
      cwd: projectRoot,
    });

    logger.success('Netlify site initialized');
  } catch (error) {
    throw new Error(`Failed to initialize Netlify site: ${error}`);
  }
}

/**
 * Link to existing Netlify site
 */
export async function linkNetlifySite(
  projectRoot: string,
  siteId: string
): Promise<void> {
  logger.info(`Linking to Netlify site: ${siteId}`);

  try {
    await execAsync(`netlify link --id ${siteId}`, {
      cwd: projectRoot,
    });

    logger.success('Site linked successfully');
  } catch (error) {
    throw new Error(`Failed to link site: ${error}`);
  }
}

/**
 * Set environment variables
 */
export async function setNetlifyEnv(
  projectRoot: string,
  key: string,
  value: string
): Promise<void> {
  logger.info(`Setting environment variable: ${key}`);

  try {
    await execAsync(`netlify env:set ${key} "${value}"`, {
      cwd: projectRoot,
    });

    logger.success(`Environment variable ${key} set`);
  } catch (error) {
    throw new Error(`Failed to set environment variable: ${error}`);
  }
}

/**
 * Get site info
 */
export async function getSiteInfo(projectRoot: string): Promise<any> {
  try {
    const { stdout } = await execAsync('netlify status --json', {
      cwd: projectRoot,
    });

    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

/**
 * List deployments
 */
export async function listNetlifyDeployments(
  projectRoot: string
): Promise<Array<{ id: string; url: string; state: string }>> {
  try {
    const { stdout } = await execAsync('netlify deploy --json', {
      cwd: projectRoot,
    });

    const data = JSON.parse(stdout);
    return data.deployments || [];
  } catch {
    return [];
  }
}

/**
 * Add custom domain
 */
export async function addNetlifyDomain(
  projectRoot: string,
  domain: string
): Promise<void> {
  logger.info(`Adding custom domain: ${domain}`);

  try {
    await execAsync(`netlify domains:add ${domain}`, {
      cwd: projectRoot,
    });

    logger.success(`Domain ${domain} added`);
    logger.info('Configure your DNS records as instructed');
  } catch (error) {
    throw new Error(`Failed to add domain: ${error}`);
  }
}

/**
 * Get Netlify CLI version
 */
export async function getNetlifyCLIVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync('netlify --version');
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Open Netlify dashboard
 */
export async function openNetlifyDashboard(projectRoot: string): Promise<void> {
  logger.info('Opening Netlify dashboard...');

  try {
    await execAsync('netlify open', {
      cwd: projectRoot,
    });
  } catch (error) {
    logger.warn('Could not open dashboard');
  }
}

/**
 * Run pre-deployment checks
 */
export async function runNetlifyPreDeploymentChecks(
  projectRoot: string
): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check if package.json exists
  if (!existsSync(path.join(projectRoot, 'package.json'))) {
    errors.push('package.json not found');
  }

  // Check if build output directory exists
  const outputDir = await getOutputDirectory(projectRoot);
  if (!existsSync(path.join(projectRoot, outputDir))) {
    errors.push(`Output directory ${outputDir} not found - run build first`);
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}
