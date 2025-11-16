import chalk from 'chalk';
import ora, { Ora } from 'ora';
import boxen from 'boxen';

/**
 * Pretty console output utilities for ship toolkit
 */

export const logger = {
  /**
   * Log info message (cyan)
   */
  info(message: string): void {
    console.log(chalk.cyan(`ℹ ${message}`));
  },

  /**
   * Log success message (green)
   */
  success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  },

  /**
   * Log warning message (yellow)
   */
  warn(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
  },

  /**
   * Log error message (red)
   */
  error(message: string): void {
    console.log(chalk.red(`❌ ${message}`));
  },

  /**
   * Log debug message (gray) - only in debug mode
   */
  debug(message: string): void {
    if (process.env.DEBUG === 'true') {
      console.log(chalk.gray(`🔍 ${message}`));
    }
  },

  /**
   * Create a spinner for long-running tasks
   */
  spinner(text: string): Ora {
    return ora({
      text,
      color: 'cyan',
      spinner: 'dots'
    });
  },

  /**
   * Display a section header
   */
  section(title: string): void {
    console.log('\n' + chalk.bold.cyan(`\n${title}\n`));
  },

  /**
   * Display a boxed message
   */
  box(message: string, title?: string): void {
    console.log(boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      title: title,
      titleAlignment: 'center'
    }));
  },

  /**
   * Display metrics in a nice format
   */
  metrics(label: string, value: string | number, unit?: string): void {
    const formattedValue = unit ? `${value} ${unit}` : value;
    console.log(`   ${chalk.gray(label)}: ${chalk.bold.green(formattedValue)}`);
  },

  /**
   * Display a progress step
   */
  step(current: number, total: number, description: string): void {
    console.log(chalk.cyan(`\nStep ${current}/${total}: ${chalk.bold(description)}`));
  },

  /**
   * Display before/after comparison
   */
  comparison(label: string, before: number, after: number, unit?: string): void {
    const improvement = before - after;
    const percentage = ((improvement / before) * 100).toFixed(0);
    const arrow = improvement > 0 ? '↓' : '↑';
    const color = improvement > 0 ? chalk.green : chalk.red;

    const beforeStr = unit ? `${before} ${unit}` : before;
    const afterStr = unit ? `${after} ${unit}` : after;

    console.log(
      `   ${chalk.gray(label)}: ${beforeStr} → ${color(afterStr)} ` +
      `${color(`(${arrow} ${Math.abs(parseFloat(percentage))}%)`)}`
    );
  },

  /**
   * Display a list of items with checkmarks
   */
  list(items: Array<{ label: string; status: 'success' | 'warning' | 'error' | 'info' }>): void {
    items.forEach(item => {
      const icon = {
        success: chalk.green('✓'),
        warning: chalk.yellow('⚠️'),
        error: chalk.red('❌'),
        info: chalk.cyan('ℹ')
      }[item.status];

      console.log(`   ${icon} ${item.label}`);
    });
  },

  /**
   * Clear the console
   */
  clear(): void {
    console.clear();
  },

  /**
   * Add a blank line
   */
  newLine(): void {
    console.log();
  },

  /**
   * Format an error for display
   */
  formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  },

  /**
   * Log validation error with details
   */
  validationError(field: string, message: string, suggestion?: string): void {
    console.log(chalk.red(`❌ ${field}: ${message}`));
    if (suggestion) {
      console.log(chalk.gray(`   💡 Suggestion: ${suggestion}`));
    }
  },

  /**
   * Display a file path in a readable way
   */
  file(path: string): string {
    return chalk.cyan.underline(path);
  },

  /**
   * Display command in a code block style
   */
  command(cmd: string): string {
    return chalk.bgBlack.white(` ${cmd} `);
  }
};

export default logger;
