/**
 * Ship Complete Orchestrator - Run the complete ship workflow
 * Executes all ship commands in sequence with progress tracking
 */

import { logger } from '../utils/logger.js';
import { optimizeImages, analyzeImages } from '../perf/images.js';
import { runLaunchChecklist, type LaunchChecklist } from '../launch/validator.js';
import { displayLaunchChecklist, generateHTMLReport } from '../launch/reporter.js';
import { detectFramework } from '../utils/framework-detector.js';
import path from 'path';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  result?: any;
}

export interface WorkflowConfig {
  skipAssets?: boolean;
  skipSEO?: boolean;
  skipPerf?: boolean;
  skipDeploy?: boolean;
  autoFix?: boolean;
  targetScore?: number;
  production?: boolean;
}

export interface WorkflowResult {
  steps: WorkflowStep[];
  overallSuccess: boolean;
  totalDuration: number;
  launchChecklist?: LaunchChecklist;
  deploymentUrl?: string;
  summary: {
    assetsGenerated: number;
    seoScore: number;
    performanceScore: number;
    launchScore: number;
    readyToLaunch: boolean;
  };
}

const DEFAULT_CONFIG: WorkflowConfig = {
  skipAssets: false,
  skipSEO: false,
  skipPerf: false,
  skipDeploy: true, // Don't deploy by default
  autoFix: true,
  targetScore: 90,
  production: false,
};

/**
 * Run complete ship workflow
 */
export async function runCompleteWorkflow(
  projectRoot: string,
  config: WorkflowConfig = {}
): Promise<WorkflowResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();

  logger.section('🚀 Running Complete Ship Workflow');
  logger.info('Automating your final steps to production\n');

  const steps: WorkflowStep[] = [];

  // Step 1: Asset Generation
  if (!finalConfig.skipAssets) {
    const assetStep = await runAssetGeneration(projectRoot);
    steps.push(assetStep);
  }

  // Step 2: SEO Optimization
  if (!finalConfig.skipSEO) {
    const seoStep = await runSEOOptimization(projectRoot);
    steps.push(seoStep);
  }

  // Step 3: Performance Optimization
  if (!finalConfig.skipPerf) {
    const perfStep = await runPerformanceOptimization(projectRoot, finalConfig);
    steps.push(perfStep);
  }

  // Step 4: Launch Checklist
  const checklistStep = await runLaunchChecklistValidation(projectRoot);
  steps.push(checklistStep);

  const launchChecklist = checklistStep.result as LaunchChecklist;

  // Step 5: Deployment (optional)
  let deploymentUrl: string | undefined;
  if (!finalConfig.skipDeploy && launchChecklist?.readyToLaunch) {
    const deployStep = await runDeployment(projectRoot, finalConfig.production || false);
    steps.push(deployStep);
    deploymentUrl = deployStep.result?.url;
  }

  // Calculate results
  const totalDuration = Date.now() - startTime;
  const overallSuccess = steps.every(s => s.status === 'completed' || s.status === 'skipped');

  const summary = {
    assetsGenerated: steps[0]?.result?.assetsGenerated || 0,
    seoScore: steps[1]?.result?.seoScore || 0,
    performanceScore: steps[2]?.result?.performanceScore || 0,
    launchScore: launchChecklist?.overallScore || 0,
    readyToLaunch: launchChecklist?.readyToLaunch || false,
  };

  const result: WorkflowResult = {
    steps,
    overallSuccess,
    totalDuration,
    launchChecklist,
    deploymentUrl,
    summary,
  };

  // Display final summary
  displayWorkflowSummary(result);

  return result;
}

/**
 * Step 1: Asset Generation
 */
async function runAssetGeneration(projectRoot: string): Promise<WorkflowStep> {
  const step: WorkflowStep = {
    id: 'assets',
    name: 'Asset Generation',
    description: 'Generate favicons, OG images, and PWA icons',
    status: 'running',
    startTime: new Date(),
  };

  logger.step(1, 5, 'Asset Generation');

  try {
    // Check if assets already exist
    const analysis = await analyzeImages(projectRoot);

    if (analysis.totalImages > 0) {
      logger.info('Assets already generated, optimizing...');
      const results = await optimizeImages(projectRoot, {
        quality: 85,
        format: 'webp',
      });

      step.status = 'completed';
      step.result = {
        assetsGenerated: results.length,
        totalSavings: results.reduce((sum, r) => sum + r.savings, 0),
      };

      logger.success(`✓ Assets optimized (${results.length} images)`);
    } else {
      logger.warn('No assets found - run /ship-assets to generate');
      step.status = 'skipped';
      step.result = { assetsGenerated: 0 };
    }
  } catch (error) {
    logger.error(`Asset generation failed: ${error}`);
    step.status = 'failed';
    step.error = String(error);
  }

  step.endTime = new Date();
  step.duration = step.endTime.getTime() - step.startTime!.getTime();

  return step;
}

/**
 * Step 2: SEO Optimization
 */
async function runSEOOptimization(projectRoot: string): Promise<WorkflowStep> {
  const step: WorkflowStep = {
    id: 'seo',
    name: 'SEO Optimization',
    description: 'Optimize meta tags, sitemap, and robots.txt',
    status: 'running',
    startTime: new Date(),
  };

  logger.step(2, 5, 'SEO Optimization');

  try {
    // Check for existing SEO files
    const detection = await detectFramework(projectRoot);
    let seoScore = 0;
    let itemsFound = 0;

    // Check sitemap
    const sitemapExists = detection.framework === 'next-app'
      ? await checkFileExists(path.join(projectRoot, 'app/sitemap.ts'))
      : await checkFileExists(path.join(projectRoot, 'public/sitemap.xml'));

    if (sitemapExists) {
      itemsFound++;
      seoScore += 25;
    }

    // Check robots.txt
    const robotsExists = await checkFileExists(path.join(projectRoot, 'public/robots.txt'));
    if (robotsExists) {
      itemsFound++;
      seoScore += 25;
    }

    // Check manifest
    const manifestExists = await checkFileExists(path.join(projectRoot, 'public/manifest.json'));
    if (manifestExists) {
      itemsFound++;
      seoScore += 25;
    }

    // Check meta tags (simplified)
    if (detection.framework === 'next-app') {
      const layoutExists = await checkFileExists(path.join(projectRoot, 'app/layout.tsx'));
      if (layoutExists) {
        itemsFound++;
        seoScore += 25;
      }
    }

    step.status = 'completed';
    step.result = {
      seoScore,
      itemsFound,
      itemsTotal: 4,
    };

    logger.success(`✓ SEO checked (${itemsFound}/4 items configured)`);
  } catch (error) {
    logger.error(`SEO optimization failed: ${error}`);
    step.status = 'failed';
    step.error = String(error);
  }

  step.endTime = new Date();
  step.duration = step.endTime.getTime() - step.startTime!.getTime();

  return step;
}

/**
 * Step 3: Performance Optimization
 */
async function runPerformanceOptimization(
  projectRoot: string,
  config: WorkflowConfig
): Promise<WorkflowStep> {
  const step: WorkflowStep = {
    id: 'performance',
    name: 'Performance Optimization',
    description: 'Optimize images, bundle, and configuration',
    status: 'running',
    startTime: new Date(),
  };

  logger.step(3, 5, 'Performance Optimization');

  try {
    // Optimize images
    const imageResults = await optimizeImages(projectRoot, {
      quality: 85,
      format: 'webp',
      removeExif: true,
    });

    const bytesSaved = imageResults.reduce((sum, r) => sum + r.savings, 0);

    // Estimate performance score based on optimizations
    let performanceScore = 70; // Base score

    if (imageResults.length > 0) {
      performanceScore += 10; // Images optimized
    }

    if (bytesSaved > 1000000) { // > 1MB saved
      performanceScore += 10; // Significant savings
    }

    step.status = 'completed';
    step.result = {
      performanceScore,
      imagesOptimized: imageResults.length,
      bytesSaved,
    };

    logger.success(`✓ Performance optimized (${imageResults.length} images, ${formatBytes(bytesSaved)} saved)`);
  } catch (error) {
    logger.error(`Performance optimization failed: ${error}`);
    step.status = 'failed';
    step.error = String(error);
  }

  step.endTime = new Date();
  step.duration = step.endTime.getTime() - step.startTime!.getTime();

  return step;
}

/**
 * Step 4: Launch Checklist Validation
 */
async function runLaunchChecklistValidation(projectRoot: string): Promise<WorkflowStep> {
  const step: WorkflowStep = {
    id: 'launch-checklist',
    name: 'Launch Checklist',
    description: 'Validate project readiness for launch',
    status: 'running',
    startTime: new Date(),
  };

  logger.step(4, 5, 'Launch Checklist');

  try {
    const checklist = await runLaunchChecklist(projectRoot);

    step.status = 'completed';
    step.result = checklist;

    const statusIcon = checklist.readyToLaunch ? '✅' : '⚠️';
    logger.info(`${statusIcon} Launch score: ${checklist.overallScore}/100`);

    if (checklist.readyToLaunch) {
      logger.success('✓ Ready to launch!');
    } else {
      logger.warn(`⚠ Not ready (${checklist.criticalIssues.length} critical issues)`);
    }
  } catch (error) {
    logger.error(`Launch checklist failed: ${error}`);
    step.status = 'failed';
    step.error = String(error);
  }

  step.endTime = new Date();
  step.duration = step.endTime.getTime() - step.startTime!.getTime();

  return step;
}

/**
 * Step 5: Deployment
 */
async function runDeployment(projectRoot: string, production: boolean): Promise<WorkflowStep> {
  const step: WorkflowStep = {
    id: 'deployment',
    name: 'Deployment',
    description: production ? 'Deploy to production' : 'Deploy to preview',
    status: 'running',
    startTime: new Date(),
  };

  logger.step(5, 5, 'Deployment');

  try {
    // This would integrate with the actual deployment modules
    logger.info('Deployment integration would run here');
    logger.info('Use /ship-deploy to deploy manually');

    step.status = 'skipped';
    step.result = {
      url: 'https://your-app.vercel.app',
      skipped: true,
    };

    logger.info('✓ Deployment skipped (run /ship-deploy to deploy)');
  } catch (error) {
    logger.error(`Deployment failed: ${error}`);
    step.status = 'failed';
    step.error = String(error);
  }

  step.endTime = new Date();
  step.duration = step.endTime.getTime() - step.startTime!.getTime();

  return step;
}

/**
 * Display workflow summary
 */
function displayWorkflowSummary(result: WorkflowResult): void {
  logger.newLine();
  logger.section('✨ Workflow Complete!');

  // Display step results
  logger.newLine();
  logger.info('📊 Step Results:');
  result.steps.forEach(step => {
    const icon = getStepIcon(step.status);
    const duration = step.duration ? `(${(step.duration / 1000).toFixed(1)}s)` : '';
    logger.info(`   ${icon} ${step.name} ${duration}`);
  });

  // Display summary metrics
  logger.newLine();
  logger.section('📈 Summary');

  if (result.summary.assetsGenerated > 0) {
    logger.metrics('Assets Optimized', result.summary.assetsGenerated, 'images');
  }

  if (result.summary.seoScore > 0) {
    logger.metrics('SEO Score', result.summary.seoScore, '/100');
  }

  if (result.summary.performanceScore > 0) {
    logger.metrics('Performance Score', result.summary.performanceScore, '/100');
  }

  logger.metrics('Launch Score', result.summary.launchScore, '/100');
  logger.metrics('Total Time', (result.totalDuration / 1000).toFixed(1), 'seconds');

  // Launch readiness
  logger.newLine();
  if (result.summary.readyToLaunch) {
    logger.box(
      `🎉 Your project is ready to launch!\n\n` +
      `Launch Score: ${result.summary.launchScore}/100\n` +
      `Next: Run /ship-deploy to go live`,
      '✅ READY TO LAUNCH'
    );
  } else {
    logger.box(
      `⚠️ Almost ready!\n\n` +
      `Launch Score: ${result.summary.launchScore}/100\n` +
      `Fix critical issues, then run /ship-launch`,
      '⚠️ NOT QUITE READY'
    );
  }

  // Next steps
  logger.newLine();
  logger.section('📋 Next Steps');

  if (result.summary.readyToLaunch) {
    logger.info('1. Review the launch checklist above');
    logger.info('2. Deploy to production: /ship-deploy');
    logger.info('3. Share your launch: /ship-export');
    logger.info('4. Monitor analytics and errors');
  } else {
    logger.info('1. Review critical issues: /ship-launch');
    logger.info('2. Run individual fixes as needed');
    logger.info('3. Re-run /ship-complete');
  }

  logger.newLine();
  logger.info('💡 Tip: Save the detailed report for your records');
}

/**
 * Get icon for step status
 */
function getStepIcon(status: WorkflowStep['status']): string {
  const icons = {
    pending: '⏳',
    running: '🔄',
    completed: '✅',
    failed: '❌',
    skipped: 'ℹ️',
  };
  return icons[status];
}

/**
 * Check if file exists
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format bytes to human-readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Quick complete workflow (minimal output)
 */
export async function quickComplete(projectRoot: string): Promise<boolean> {
  logger.info('🚀 Running quick optimization...\n');

  const result = await runCompleteWorkflow(projectRoot, {
    skipDeploy: true,
    autoFix: true,
  });

  return result.summary.readyToLaunch;
}
