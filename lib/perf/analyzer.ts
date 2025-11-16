/**
 * Performance Analyzer - Uses Lighthouse for performance analysis
 * Analyzes Core Web Vitals, performance metrics, and optimization opportunities
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { logger } from '../utils/logger.js';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  tti: number; // Time to Interactive (ms)
  tbt: number; // Total Blocking Time (ms)
  cls: number; // Cumulative Layout Shift
  si: number;  // Speed Index
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  savings: number; // milliseconds or bytes
  savingsType: 'ms' | 'bytes';
  fixable: boolean;
  displayValue?: string;
}

export interface Diagnostic {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  details?: any;
}

export interface PerformanceAnalysis {
  score: number; // 0-100
  metrics: PerformanceMetrics;
  opportunities: Opportunity[];
  diagnostics: Diagnostic[];
  passedAudits: string[];
  warnings: string[];
}

export interface LighthouseOptions {
  port?: number;
  output?: 'json' | 'html';
  onlyCategories?: string[];
  formFactor?: 'mobile' | 'desktop';
  throttling?: boolean;
}

/**
 * Run Lighthouse performance analysis on a URL
 */
export async function analyzePerformance(
  url: string,
  options: LighthouseOptions = {}
): Promise<PerformanceAnalysis> {
  logger.info('🔍 Running Lighthouse performance analysis...');

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  try {
    const opts = {
      logLevel: 'error' as const,
      output: 'json' as const,
      onlyCategories: ['performance'],
      port: chrome.port,
      formFactor: options.formFactor || 'mobile',
      throttling: {
        rttMs: options.throttling !== false ? 40 : 0,
        throughputKbps: options.throttling !== false ? 10 * 1024 : 0,
        cpuSlowdownMultiplier: options.throttling !== false ? 1 : 1,
      }
    };

    const runnerResult = await lighthouse(url, opts);
    if (!runnerResult) {
      throw new Error('Lighthouse failed to return results');
    }

    const lhr = runnerResult.lhr;

    // Extract performance metrics
    const metrics: PerformanceMetrics = {
      fcp: lhr.audits['first-contentful-paint']?.numericValue || 0,
      lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
      tti: lhr.audits['interactive']?.numericValue || 0,
      tbt: lhr.audits['total-blocking-time']?.numericValue || 0,
      cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
      si: lhr.audits['speed-index']?.numericValue || 0,
    };

    // Extract opportunities
    const opportunities: Opportunity[] = [];
    const opportunityAudits = [
      'unminified-css',
      'unminified-javascript',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-responsive-images',
      'offscreen-images',
      'render-blocking-resources',
      'uses-text-compression',
      'uses-rel-preconnect',
      'server-response-time',
      'redirects',
      'uses-http2',
      'efficient-animated-content',
      'duplicated-javascript',
      'legacy-javascript',
      'total-byte-weight',
    ];

    for (const auditId of opportunityAudits) {
      const audit = lhr.audits[auditId];
      if (audit && audit.score !== null && audit.score < 1) {
        opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          savings: audit.numericValue || 0,
          savingsType: audit.numericUnit === 'millisecond' ? 'ms' : 'bytes',
          fixable: isFixableOpportunity(auditId),
          displayValue: audit.displayValue,
        });
      }
    }

    // Sort opportunities by impact
    opportunities.sort((a, b) => b.savings - a.savings);

    // Extract diagnostics
    const diagnostics: Diagnostic[] = [];
    const diagnosticAudits = [
      'mainthread-work-breakdown',
      'bootup-time',
      'third-party-summary',
      'largest-contentful-paint-element',
      'layout-shift-elements',
      'long-tasks',
      'non-composited-animations',
      'unsized-images',
    ];

    for (const auditId of diagnosticAudits) {
      const audit = lhr.audits[auditId];
      if (audit && audit.score !== null && audit.score < 1) {
        diagnostics.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          details: audit.details,
        });
      }
    }

    // Extract passed audits and warnings
    const passedAudits: string[] = [];
    const warnings: string[] = [];

    Object.entries(lhr.audits).forEach(([id, audit]) => {
      if (audit.score === 1) {
        passedAudits.push(audit.title);
      } else if (audit.score !== null && audit.score > 0.5 && audit.score < 1) {
        warnings.push(audit.title);
      }
    });

    const score = Math.round((lhr.categories.performance?.score || 0) * 100);

    logger.success(`Performance analysis complete! Score: ${score}/100`);

    return {
      score,
      metrics,
      opportunities,
      diagnostics,
      passedAudits,
      warnings,
    };

  } catch (error) {
    logger.error(`Failed to run Lighthouse analysis: ${error}`);
    throw error;
  } finally {
    await chrome.kill();
  }
}

/**
 * Determine if an opportunity can be auto-fixed
 */
function isFixableOpportunity(auditId: string): boolean {
  const fixableAudits = [
    'modern-image-formats',
    'uses-optimized-images',
    'uses-responsive-images',
    'offscreen-images',
    'uses-text-compression',
    'unminified-css',
    'unminified-javascript',
    'unused-css-rules',
  ];
  return fixableAudits.includes(auditId);
}

/**
 * Run quick performance check on local dev server
 */
export async function quickPerformanceCheck(
  port: number = 3000
): Promise<PerformanceAnalysis> {
  const url = `http://localhost:${port}`;
  logger.info(`Running performance check on ${url}`);

  return analyzePerformance(url, {
    throttling: false, // No throttling for local dev
    formFactor: 'desktop',
  });
}

/**
 * Get human-readable performance rating
 */
export function getPerformanceRating(score: number): string {
  if (score >= 90) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Get Core Web Vitals assessment
 */
export function assessCoreWebVitals(metrics: PerformanceMetrics): {
  fcp: 'good' | 'needs-improvement' | 'poor';
  lcp: 'good' | 'needs-improvement' | 'poor';
  cls: 'good' | 'needs-improvement' | 'poor';
  tbt: 'good' | 'needs-improvement' | 'poor';
} {
  return {
    fcp: metrics.fcp <= 1800 ? 'good' : metrics.fcp <= 3000 ? 'needs-improvement' : 'poor',
    lcp: metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor',
    cls: metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor',
    tbt: metrics.tbt <= 200 ? 'good' : metrics.tbt <= 600 ? 'needs-improvement' : 'poor',
  };
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: PerformanceMetrics): Record<string, string> {
  return {
    'First Contentful Paint': `${(metrics.fcp / 1000).toFixed(1)}s`,
    'Largest Contentful Paint': `${(metrics.lcp / 1000).toFixed(1)}s`,
    'Time to Interactive': `${(metrics.tti / 1000).toFixed(1)}s`,
    'Total Blocking Time': `${metrics.tbt.toFixed(0)}ms`,
    'Cumulative Layout Shift': metrics.cls.toFixed(2),
    'Speed Index': `${(metrics.si / 1000).toFixed(1)}s`,
  };
}

/**
 * Calculate potential time savings
 */
export function calculateTimeSavings(opportunities: Opportunity[]): number {
  return opportunities
    .filter(opp => opp.savingsType === 'ms')
    .reduce((total, opp) => total + opp.savings, 0);
}

/**
 * Calculate potential byte savings
 */
export function calculateByteSavings(opportunities: Opportunity[]): number {
  return opportunities
    .filter(opp => opp.savingsType === 'bytes')
    .reduce((total, opp) => total + opp.savings, 0);
}
