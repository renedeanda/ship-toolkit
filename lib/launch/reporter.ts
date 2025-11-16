/**
 * Launch Reporter - Format and display launch checklist results
 * Generates beautiful console output and reports
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';
import type { LaunchChecklist, ChecklistSection, ChecklistItem, CheckStatus } from './validator.js';

/**
 * Display launch checklist results
 */
export function displayLaunchChecklist(checklist: LaunchChecklist): void {
  logger.section('🚀 Pre-Launch Checklist');

  // Display each section
  checklist.sections.forEach(section => {
    displaySection(section);
  });

  // Display overall score
  logger.newLine();
  logger.section(`📊 Overall Score: ${checklist.overallScore}/100`);

  // Display readiness
  if (checklist.readyToLaunch) {
    logger.box(
      `✅ Ready to Launch!\n\nYour project passes all critical checks.\n\nScore: ${checklist.overallScore}/100`,
      'READY TO LAUNCH'
    );
  } else {
    logger.box(
      `⚠️  Not Ready to Launch\n\nPlease fix critical issues before launching.\n\nScore: ${checklist.overallScore}/100`,
      'NOT READY'
    );
  }

  // Display critical issues
  if (checklist.criticalIssues.length > 0) {
    logger.newLine();
    logger.section('❌ Critical Issues');

    checklist.criticalIssues.forEach(issue => {
      logger.error(`${issue.name}: ${issue.message}`);
      if (issue.fix) {
        logger.info(`  Fix: ${issue.fix}`);
      }
    });
  }

  // Display warnings
  if (checklist.warnings.length > 0) {
    logger.newLine();
    logger.section('⚠️  Warnings');

    checklist.warnings.forEach(warning => {
      logger.warn(`${warning.name}: ${warning.message}`);
      if (warning.fix) {
        logger.info(`  Suggestion: ${warning.fix}`);
      }
    });
  }

  // Display next steps
  logger.newLine();
  displayNextSteps(checklist);
}

/**
 * Display a single section
 */
function displaySection(section: ChecklistSection): void {
  const statusIcon = section.score >= 80 ? '✅' : section.score >= 50 ? '⚠️' : '❌';

  logger.newLine();
  logger.info(`${statusIcon} ${section.name} (${section.items.length}/${section.items.length}) - ${section.score}%`);

  section.items.forEach(item => {
    const icon = getStatusIcon(item.status);
    const message = item.message ? ` - ${item.message}` : '';
    console.log(`   ${icon} ${item.name}${message}`);
  });
}

/**
 * Get icon for status
 */
function getStatusIcon(status: CheckStatus): string {
  const icons: Record<CheckStatus, string> = {
    pass: '✅',
    fail: '❌',
    warning: '⚠️',
    skip: 'ℹ️',
  };

  return icons[status];
}

/**
 * Display next steps
 */
function displayNextSteps(checklist: LaunchChecklist): void {
  logger.section('📋 Next Steps');

  const steps: string[] = [];

  // Add steps based on status
  if (checklist.criticalIssues.length > 0) {
    steps.push('Fix critical issues listed above');

    // Add automated fixes
    const automatedFixes = checklist.criticalIssues
      .filter(i => i.automated && i.fix)
      .map(i => i.fix!);

    const uniqueFixes = [...new Set(automatedFixes)];
    if (uniqueFixes.length > 0) {
      steps.push(`Run automated fixes: ${uniqueFixes.join(', ')}`);
    }
  }

  if (checklist.warnings.length > 0) {
    steps.push('Review and address warnings');
  }

  if (checklist.readyToLaunch) {
    steps.push('Deploy to production: /ship-deploy');
    steps.push('Share your launch: /ship-export');
    steps.push('Monitor analytics and errors');
  } else {
    steps.push('Run /ship-launch again after fixes');
  }

  steps.forEach((step, index) => {
    logger.info(`${index + 1}. ${step}`);
  });

  logger.newLine();
  logger.info('💡 Tip: Run /ship-complete to optimize everything at once');
}

/**
 * Generate HTML report
 */
export async function generateHTMLReport(
  checklist: LaunchChecklist,
  outputPath: string
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Launch Checklist Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .header {
      background: ${checklist.readyToLaunch ? '#10b981' : '#ef4444'};
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .header .score {
      font-size: 3rem;
      font-weight: bold;
      margin: 1rem 0;
    }

    .header .status {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .content {
      padding: 2rem;
    }

    .section {
      margin-bottom: 2rem;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
    }

    .section-header {
      background: #f9fafb;
      padding: 1rem;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h2 {
      font-size: 1.2rem;
      color: #111827;
    }

    .section-score {
      font-weight: bold;
      color: #6b7280;
    }

    .section-items {
      padding: 0;
    }

    .item {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .item:last-child {
      border-bottom: none;
    }

    .item-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
    }

    .item-name {
      font-weight: 500;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .item-message {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .item-fix {
      font-size: 0.85rem;
      color: #3b82f6;
      margin-top: 0.25rem;
    }

    .status-pass {
      background: #f0fdf4;
    }

    .status-warning {
      background: #fffbeb;
    }

    .status-fail {
      background: #fef2f2;
    }

    .status-skip {
      background: #f9fafb;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e5e5e5;
      text-align: center;
    }

    .summary-card h3 {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .summary-card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #111827;
    }

    .timestamp {
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e5e5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Launch Checklist Report</h1>
      <div class="score">${checklist.overallScore}/100</div>
      <div class="status">
        ${checklist.readyToLaunch ? '✅ Ready to Launch!' : '⚠️  Not Ready to Launch'}
      </div>
    </div>

    <div class="content">
      <div class="summary">
        <div class="summary-card">
          <h3>Sections</h3>
          <div class="value">${checklist.sections.length}</div>
        </div>
        <div class="summary-card">
          <h3>Critical Issues</h3>
          <div class="value" style="color: ${checklist.criticalIssues.length > 0 ? '#ef4444' : '#10b981'}">
            ${checklist.criticalIssues.length}
          </div>
        </div>
        <div class="summary-card">
          <h3>Warnings</h3>
          <div class="value" style="color: ${checklist.warnings.length > 0 ? '#f59e0b' : '#10b981'}">
            ${checklist.warnings.length}
          </div>
        </div>
      </div>

      ${checklist.sections.map(section => `
        <div class="section">
          <div class="section-header">
            <h2>${section.name}</h2>
            <span class="section-score">${section.score}%</span>
          </div>
          <div class="section-items">
            ${section.items.map(item => `
              <div class="item status-${item.status}">
                <div class="item-icon">${getStatusIcon(item.status)}</div>
                <div class="item-content">
                  <div class="item-name">${item.name}</div>
                  ${item.message ? `<div class="item-message">${item.message}</div>` : ''}
                  ${item.fix ? `<div class="item-fix">💡 ${item.fix}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <div class="timestamp">
        Generated: ${checklist.timestamp.toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>`;

  await fs.writeFile(outputPath, html, 'utf-8');
  logger.success(`Report saved to ${outputPath}`);
}

/**
 * Generate JSON report
 */
export async function generateJSONReport(
  checklist: LaunchChecklist,
  outputPath: string
): Promise<void> {
  const json = JSON.stringify(checklist, null, 2);
  await fs.writeFile(outputPath, json, 'utf-8');
  logger.success(`JSON report saved to ${outputPath}`);
}

/**
 * Generate markdown summary
 */
export function generateMarkdownSummary(checklist: LaunchChecklist): string {
  const lines: string[] = [];

  lines.push('# Launch Checklist Report\n');
  lines.push(`**Score:** ${checklist.overallScore}/100\n`);
  lines.push(`**Status:** ${checklist.readyToLaunch ? '✅ Ready to Launch' : '⚠️ Not Ready'}\n`);
  lines.push(`**Generated:** ${checklist.timestamp.toLocaleString()}\n`);

  lines.push('\n## Summary\n');
  lines.push(`- **Critical Issues:** ${checklist.criticalIssues.length}`);
  lines.push(`- **Warnings:** ${checklist.warnings.length}`);
  lines.push(`- **Sections:** ${checklist.sections.length}\n`);

  checklist.sections.forEach(section => {
    lines.push(`\n### ${section.name} (${section.score}%)\n`);

    section.items.forEach(item => {
      const icon = getStatusIcon(item.status);
      const message = item.message ? ` - ${item.message}` : '';
      lines.push(`- ${icon} ${item.name}${message}`);

      if (item.fix) {
        lines.push(`  - 💡 ${item.fix}`);
      }
    });
  });

  if (checklist.criticalIssues.length > 0) {
    lines.push('\n## Critical Issues\n');
    checklist.criticalIssues.forEach(issue => {
      lines.push(`- ❌ **${issue.name}**: ${issue.message}`);
      if (issue.fix) {
        lines.push(`  - Fix: ${issue.fix}`);
      }
    });
  }

  return lines.join('\n');
}

/**
 * Display progress bar
 */
export function displayProgressBar(current: number, total: number, label: string): void {
  const percentage = Math.round((current / total) * 100);
  const barLength = 40;
  const filled = Math.round((percentage / 100) * barLength);
  const empty = barLength - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  logger.info(`${label}: [${bar}] ${percentage}%`);
}
