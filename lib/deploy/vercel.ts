/**
 * Vercel Deployment - Deploy to Vercel platform
 * Handles authentication, project creation, and deployment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

export interface DeployResult {
  url: string;
  deploymentId?: string;
  status: 'success' | 'failed' | 'pending';
  logs?: string[];
  error?: string;
}

export interface VercelProject {
  id: string;
  name: string;
  url: string;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  target: ('production' | 'preview' | 'development')[];
}

/**
 * Check if Vercel CLI is installed
 */
export async function isVercelCLIInstalled(): Promise<boolean> {
  try {
    await execAsync('vercel --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Install Vercel CLI
 */
export async function installVercelCLI(): Promise<void> {
  logger.info('Installing Vercel CLI...');

  try {
    await execAsync('npm install -g vercel');
    logger.success('Vercel CLI installed successfully');
  } catch (error) {
    throw new Error(`Failed to install Vercel CLI: ${error}`);
  }
}

/**
 * Check if user is logged in to Vercel
 */
export async function checkVercelAuth(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('vercel whoami');
    const username = stdout.trim();

    if (username && username !== '') {
      logger.success(`Logged in as: ${username}`);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Login to Vercel
 */
export async function loginToVercel(): Promise<void> {
  logger.info('Please login to Vercel...');
  logger.info('A browser window will open for authentication');

  try {
    await execAsync('vercel login');
    logger.success('Successfully logged in to Vercel');
  } catch (error) {
    throw new Error(`Vercel login failed: ${error}`);
  }
}

/**
 * Deploy to Vercel
 */
export async function deployToVercel(
  projectRoot: string,
  production: boolean = true
): Promise<DeployResult> {
  logger.info('🚀 Deploying to Vercel...');

  // Check if CLI is installed
  if (!(await isVercelCLIInstalled())) {
    logger.warn('Vercel CLI not installed');
    await installVercelCLI();
  }

  // Check authentication
  if (!(await checkVercelAuth())) {
    await loginToVercel();
  }

  try {
    // Build the deployment command
    const deployCommand = production
      ? 'vercel --prod --yes'
      : 'vercel --yes';

    logger.info(`Running: ${deployCommand}`);

    // Execute deployment
    const { stdout, stderr } = await execAsync(deployCommand, {
      cwd: projectRoot,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Extract deployment URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : '';

    if (!url) {
      throw new Error('Could not extract deployment URL from Vercel output');
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
 * Create Vercel project
 */
export async function createVercelProject(
  projectRoot: string,
  projectName: string
): Promise<VercelProject> {
  logger.info(`Creating Vercel project: ${projectName}`);

  try {
    // Link the project
    const { stdout } = await execAsync(
      `vercel link --yes --project ${projectName}`,
      { cwd: projectRoot }
    );

    return {
      id: '', // Would need to parse from Vercel API
      name: projectName,
      url: `https://${projectName}.vercel.app`,
    };
  } catch (error) {
    throw new Error(`Failed to create Vercel project: ${error}`);
  }
}

/**
 * Set environment variables in Vercel
 */
export async function setEnvironmentVariables(
  projectRoot: string,
  variables: EnvironmentVariable[]
): Promise<void> {
  logger.info('Setting environment variables...');

  for (const variable of variables) {
    try {
      const targets = variable.target.join(',');
      const command = `vercel env add ${variable.key} ${targets}`;

      await execAsync(command, {
        cwd: projectRoot,
        env: {
          ...process.env,
          VERCEL_ENV_VALUE: variable.value,
        },
      });

      logger.success(`Set ${variable.key} for ${targets}`);
    } catch (error) {
      logger.warn(`Failed to set ${variable.key}: ${error}`);
    }
  }
}

/**
 * Get deployment logs
 */
export async function getDeploymentLogs(deploymentUrl: string): Promise<string[]> {
  try {
    const { stdout } = await execAsync(`vercel logs ${deploymentUrl}`);
    return stdout.split('\n');
  } catch (error) {
    logger.warn('Could not fetch deployment logs');
    return [];
  }
}

/**
 * List deployments for a project
 */
export async function listDeployments(
  projectRoot: string
): Promise<Array<{ url: string; created: string; state: string }>> {
  try {
    const { stdout } = await execAsync('vercel ls --json', {
      cwd: projectRoot,
    });

    const deployments = JSON.parse(stdout);
    return deployments.map((d: any) => ({
      url: d.url,
      created: d.created,
      state: d.state,
    }));
  } catch (error) {
    logger.warn('Could not list deployments');
    return [];
  }
}

/**
 * Rollback to previous deployment
 */
export async function rollbackDeployment(
  projectRoot: string,
  deploymentUrl: string
): Promise<void> {
  logger.info(`Rolling back to ${deploymentUrl}...`);

  try {
    await execAsync(`vercel promote ${deploymentUrl} --yes`, {
      cwd: projectRoot,
    });

    logger.success('Rollback successful');
  } catch (error) {
    throw new Error(`Rollback failed: ${error}`);
  }
}

/**
 * Get project URL from Vercel
 */
export async function getProjectUrl(projectRoot: string): Promise<string | null> {
  const vercelDir = path.join(projectRoot, '.vercel');
  const projectJson = path.join(vercelDir, 'project.json');

  if (!existsSync(projectJson)) {
    return null;
  }

  try {
    const content = await fs.readFile(projectJson, 'utf-8');
    const data = JSON.parse(content);
    return data.projectId ? `https://${data.projectId}.vercel.app` : null;
  } catch {
    return null;
  }
}

/**
 * Run pre-deployment checks
 */
export async function runPreDeploymentChecks(
  projectRoot: string
): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check if package.json exists
  if (!existsSync(path.join(projectRoot, 'package.json'))) {
    errors.push('package.json not found');
  }

  // Check if build script exists
  try {
    const pkg = JSON.parse(
      await fs.readFile(path.join(projectRoot, 'package.json'), 'utf-8')
    );

    if (!pkg.scripts?.build) {
      errors.push('No build script found in package.json');
    }
  } catch {
    errors.push('Could not read package.json');
  }

  // Check if node_modules exists
  if (!existsSync(path.join(projectRoot, 'node_modules'))) {
    errors.push('node_modules not found - run npm install');
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

/**
 * Build project before deployment
 */
export async function buildProject(projectRoot: string): Promise<boolean> {
  logger.info('Building project...');

  try {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: projectRoot,
      maxBuffer: 10 * 1024 * 1024,
    });

    logger.success('Build successful');

    // Log any warnings
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
 * Configure custom domain
 */
export async function addCustomDomain(
  projectRoot: string,
  domain: string
): Promise<void> {
  logger.info(`Adding custom domain: ${domain}`);

  try {
    await execAsync(`vercel domains add ${domain}`, {
      cwd: projectRoot,
    });

    logger.success(`Domain ${domain} added successfully`);
    logger.info('Configure your DNS records as instructed by Vercel');
  } catch (error) {
    throw new Error(`Failed to add domain: ${error}`);
  }
}

/**
 * Remove deployment
 */
export async function removeDeployment(deploymentUrl: string): Promise<void> {
  logger.info(`Removing deployment: ${deploymentUrl}`);

  try {
    await execAsync(`vercel rm ${deploymentUrl} --yes`);
    logger.success('Deployment removed');
  } catch (error) {
    throw new Error(`Failed to remove deployment: ${error}`);
  }
}

/**
 * Get Vercel CLI version
 */
export async function getVercelCLIVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync('vercel --version');
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Check deployment status
 */
export async function checkDeploymentStatus(
  deploymentUrl: string
): Promise<'ready' | 'building' | 'error' | 'queued'> {
  try {
    const { stdout } = await execAsync(`vercel inspect ${deploymentUrl} --json`);
    const data = JSON.parse(stdout);
    return data.readyState || 'unknown';
  } catch {
    return 'error';
  }
}
