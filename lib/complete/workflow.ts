/**
 * Workflow State Manager - Track and persist workflow state
 * Allows resuming interrupted workflows and historical tracking
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import type { WorkflowStep, WorkflowResult } from './orchestrator.js';

export interface WorkflowState {
  id: string;
  projectRoot: string;
  startTime: Date;
  lastUpdate: Date;
  status: 'in-progress' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  steps: WorkflowStep[];
  config: any;
}

const STATE_DIR = '.ship-toolkit';
const STATE_FILE = 'workflow-state.json';
const HISTORY_FILE = 'workflow-history.json';

/**
 * Save workflow state
 */
export async function saveWorkflowState(
  projectRoot: string,
  state: WorkflowState
): Promise<void> {
  const stateDir = path.join(projectRoot, STATE_DIR);
  const statePath = path.join(stateDir, STATE_FILE);

  // Ensure directory exists
  if (!existsSync(stateDir)) {
    await fs.mkdir(stateDir, { recursive: true });
  }

  // Save state
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Load workflow state
 */
export async function loadWorkflowState(
  projectRoot: string
): Promise<WorkflowState | null> {
  const statePath = path.join(projectRoot, STATE_DIR, STATE_FILE);

  if (!existsSync(statePath)) {
    return null;
  }

  try {
    const content = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(content);

    // Convert date strings back to Date objects
    state.startTime = new Date(state.startTime);
    state.lastUpdate = new Date(state.lastUpdate);
    state.steps = state.steps.map((step: any) => ({
      ...step,
      startTime: step.startTime ? new Date(step.startTime) : undefined,
      endTime: step.endTime ? new Date(step.endTime) : undefined,
    }));

    return state;
  } catch (error) {
    logger.warn(`Failed to load workflow state: ${error}`);
    return null;
  }
}

/**
 * Clear workflow state
 */
export async function clearWorkflowState(projectRoot: string): Promise<void> {
  const statePath = path.join(projectRoot, STATE_DIR, STATE_FILE);

  if (existsSync(statePath)) {
    await fs.unlink(statePath);
  }
}

/**
 * Save workflow to history
 */
export async function saveToHistory(
  projectRoot: string,
  result: WorkflowResult
): Promise<void> {
  const historyPath = path.join(projectRoot, STATE_DIR, HISTORY_FILE);

  let history: any[] = [];

  // Load existing history
  if (existsSync(historyPath)) {
    try {
      const content = await fs.readFile(historyPath, 'utf-8');
      history = JSON.parse(content);
    } catch {
      history = [];
    }
  }

  // Add new entry
  history.unshift({
    timestamp: new Date(),
    duration: result.totalDuration,
    success: result.overallSuccess,
    summary: result.summary,
    steps: result.steps.map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      duration: s.duration,
    })),
  });

  // Keep only last 10 runs
  history = history.slice(0, 10);

  // Save history
  await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * Load workflow history
 */
export async function loadHistory(projectRoot: string): Promise<any[]> {
  const historyPath = path.join(projectRoot, STATE_DIR, HISTORY_FILE);

  if (!existsSync(historyPath)) {
    return [];
  }

  try {
    const content = await fs.readFile(historyPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Create workflow state
 */
export function createWorkflowState(
  projectRoot: string,
  totalSteps: number,
  config: any
): WorkflowState {
  return {
    id: generateWorkflowId(),
    projectRoot,
    startTime: new Date(),
    lastUpdate: new Date(),
    status: 'in-progress',
    currentStep: 0,
    totalSteps,
    steps: [],
    config,
  };
}

/**
 * Update workflow state
 */
export function updateWorkflowState(
  state: WorkflowState,
  step: WorkflowStep
): WorkflowState {
  // Find existing step or add new one
  const existingIndex = state.steps.findIndex(s => s.id === step.id);

  if (existingIndex >= 0) {
    state.steps[existingIndex] = step;
  } else {
    state.steps.push(step);
  }

  state.lastUpdate = new Date();

  // Update current step
  if (step.status === 'completed' || step.status === 'failed' || step.status === 'skipped') {
    state.currentStep = state.steps.filter(
      s => s.status === 'completed' || s.status === 'failed' || s.status === 'skipped'
    ).length;
  }

  // Update overall status
  if (state.currentStep >= state.totalSteps) {
    const hasFailures = state.steps.some(s => s.status === 'failed');
    state.status = hasFailures ? 'failed' : 'completed';
  }

  return state;
}

/**
 * Generate unique workflow ID
 */
function generateWorkflowId(): string {
  return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if workflow can resume
 */
export function canResumeWorkflow(state: WorkflowState): boolean {
  return (
    state.status === 'in-progress' &&
    state.currentStep < state.totalSteps &&
    Date.now() - state.lastUpdate.getTime() < 24 * 60 * 60 * 1000 // Less than 24 hours old
  );
}

/**
 * Get next step to execute
 */
export function getNextStep(state: WorkflowState): number {
  return state.currentStep;
}

/**
 * Display workflow progress
 */
export function displayProgress(state: WorkflowState): void {
  const percentage = Math.round((state.currentStep / state.totalSteps) * 100);
  const barLength = 40;
  const filled = Math.round((percentage / 100) * barLength);
  const empty = barLength - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  logger.newLine();
  logger.info(`Progress: [${bar}] ${percentage}% (${state.currentStep}/${state.totalSteps})`);
  logger.newLine();
}

/**
 * Format workflow duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Display workflow history
 */
export async function displayHistory(projectRoot: string): Promise<void> {
  const history = await loadHistory(projectRoot);

  if (history.length === 0) {
    logger.info('No workflow history found');
    return;
  }

  logger.section('📊 Workflow History (Last 10 runs)');

  history.forEach((entry, index) => {
    const date = new Date(entry.timestamp);
    const statusIcon = entry.success ? '✅' : '❌';
    const score = entry.summary?.launchScore || 'N/A';

    logger.newLine();
    logger.info(`${index + 1}. ${statusIcon} ${date.toLocaleString()}`);
    logger.info(`   Duration: ${formatDuration(entry.duration)}`);
    logger.info(`   Launch Score: ${score}/100`);

    if (entry.summary) {
      if (entry.summary.assetsGenerated) {
        logger.info(`   Assets: ${entry.summary.assetsGenerated} optimized`);
      }
      if (entry.summary.performanceScore) {
        logger.info(`   Performance: ${entry.summary.performanceScore}/100`);
      }
    }
  });
}

/**
 * Export workflow report
 */
export async function exportWorkflowReport(
  projectRoot: string,
  result: WorkflowResult,
  format: 'json' | 'md' = 'json'
): Promise<string> {
  const stateDir = path.join(projectRoot, STATE_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (!existsSync(stateDir)) {
    await fs.mkdir(stateDir, { recursive: true });
  }

  if (format === 'json') {
    const reportPath = path.join(stateDir, `workflow-report-${timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(result, null, 2), 'utf-8');
    return reportPath;
  } else {
    const reportPath = path.join(stateDir, `workflow-report-${timestamp}.md`);
    const markdown = generateMarkdownReport(result);
    await fs.writeFile(reportPath, markdown, 'utf-8');
    return reportPath;
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(result: WorkflowResult): string {
  const lines: string[] = [];

  lines.push('# Ship Complete - Workflow Report\n');
  lines.push(`**Generated:** ${new Date().toLocaleString()}\n`);
  lines.push(`**Duration:** ${formatDuration(result.totalDuration)}\n`);
  lines.push(`**Status:** ${result.overallSuccess ? '✅ Success' : '❌ Failed'}\n`);

  lines.push('\n## Summary\n');
  lines.push(`- **Assets Optimized:** ${result.summary.assetsGenerated}`);
  lines.push(`- **SEO Score:** ${result.summary.seoScore}/100`);
  lines.push(`- **Performance Score:** ${result.summary.performanceScore}/100`);
  lines.push(`- **Launch Score:** ${result.summary.launchScore}/100`);
  lines.push(`- **Ready to Launch:** ${result.summary.readyToLaunch ? 'Yes ✅' : 'No ⚠️'}\n`);

  lines.push('\n## Steps\n');
  result.steps.forEach(step => {
    const icon = getStepIcon(step.status);
    const duration = step.duration ? `(${(step.duration / 1000).toFixed(1)}s)` : '';
    lines.push(`### ${icon} ${step.name} ${duration}\n`);
    lines.push(`**Description:** ${step.description}\n`);
    lines.push(`**Status:** ${step.status}\n`);

    if (step.error) {
      lines.push(`**Error:** ${step.error}\n`);
    }

    if (step.result) {
      lines.push(`**Result:**\n\`\`\`json\n${JSON.stringify(step.result, null, 2)}\n\`\`\`\n`);
    }
  });

  if (result.launchChecklist) {
    lines.push('\n## Launch Checklist\n');
    lines.push(`**Overall Score:** ${result.launchChecklist.overallScore}/100\n`);
    lines.push(`**Ready to Launch:** ${result.launchChecklist.readyToLaunch ? 'Yes' : 'No'}\n`);
    lines.push(`**Critical Issues:** ${result.launchChecklist.criticalIssues.length}\n`);
    lines.push(`**Warnings:** ${result.launchChecklist.warnings.length}\n`);
  }

  return lines.join('\n');
}

/**
 * Get step icon
 */
function getStepIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: '⏳',
    running: '🔄',
    completed: '✅',
    failed: '❌',
    skipped: 'ℹ️',
  };
  return icons[status] || '❓';
}
