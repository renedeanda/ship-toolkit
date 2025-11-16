import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Ship Toolkit Configuration Management
 */

export interface ShipConfig {
  assets?: {
    outputDir?: string;
    faviconSizes?: number[];
    generatePWA?: boolean;
    imageFormat?: 'png' | 'webp' | 'avif';
    quality?: number;
    style?: 'gradient' | 'solid' | 'pattern' | 'minimal';
  };
  seo?: {
    baseUrl?: string;
    siteName?: string;
    twitterHandle?: string;
    defaultOGImage?: string;
    enableSchemaOrg?: boolean;
    enableSitemap?: boolean;
    sitemapChangefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    sitemapPriority?: number;
  };
  performance?: {
    targetScore?: number;
    imageQuality?: number;
    enableWebP?: boolean;
    enableAVIF?: boolean;
    enableLazyLoading?: boolean;
    enableCompression?: boolean;
    budgets?: {
      maxBundleSize?: number;
      maxImageSize?: number;
      maxLCP?: number;
    };
  };
  deploy?: {
    platform?: 'vercel' | 'netlify' | 'railway' | 'render';
    autoConfirm?: boolean;
  };
}

const DEFAULT_CONFIG: ShipConfig = {
  assets: {
    outputDir: 'public',
    faviconSizes: [16, 32, 48, 64, 128, 256],
    generatePWA: true,
    imageFormat: 'png',
    quality: 90,
    style: 'gradient'
  },
  seo: {
    enableSchemaOrg: true,
    enableSitemap: true,
    sitemapChangefreq: 'daily',
    sitemapPriority: 0.7
  },
  performance: {
    targetScore: 90,
    imageQuality: 85,
    enableWebP: true,
    enableAVIF: false,
    enableLazyLoading: true,
    enableCompression: true,
    budgets: {
      maxBundleSize: 200000,
      maxImageSize: 100000,
      maxLCP: 2000
    }
  }
};

/**
 * Get the config directory path
 */
export function getConfigDir(projectRoot: string): string {
  return join(projectRoot, '.ship-toolkit');
}

/**
 * Get the config file path
 */
export function getConfigPath(projectRoot: string): string {
  return join(getConfigDir(projectRoot), 'config.json');
}

/**
 * Load configuration from .ship-toolkit/config.json
 */
export function loadConfig(projectRoot: string): ShipConfig {
  const configPath = getConfigPath(projectRoot);

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const configData = readFileSync(configPath, 'utf-8');
    const userConfig = JSON.parse(configData);

    // Merge with defaults (deep merge)
    return {
      assets: { ...DEFAULT_CONFIG.assets, ...userConfig.assets },
      seo: { ...DEFAULT_CONFIG.seo, ...userConfig.seo },
      performance: {
        ...DEFAULT_CONFIG.performance,
        ...userConfig.performance,
        budgets: {
          ...DEFAULT_CONFIG.performance?.budgets,
          ...userConfig.performance?.budgets
        }
      },
      deploy: { ...DEFAULT_CONFIG.deploy, ...userConfig.deploy }
    };
  } catch (error) {
    console.error('Error loading config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save configuration to .ship-toolkit/config.json
 */
export function saveConfig(projectRoot: string, config: ShipConfig): void {
  const configDir = getConfigDir(projectRoot);
  const configPath = getConfigPath(projectRoot);

  // Create directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

/**
 * Update specific config values
 */
export function updateConfig(
  projectRoot: string,
  updates: Partial<ShipConfig>
): void {
  const currentConfig = loadConfig(projectRoot);
  const newConfig = {
    ...currentConfig,
    ...updates,
    assets: { ...currentConfig.assets, ...updates.assets },
    seo: { ...currentConfig.seo, ...updates.seo },
    performance: {
      ...currentConfig.performance,
      ...updates.performance,
      budgets: {
        ...currentConfig.performance?.budgets,
        ...updates.performance?.budgets
      }
    },
    deploy: { ...currentConfig.deploy, ...updates.deploy }
  };

  saveConfig(projectRoot, newConfig);
}

/**
 * Initialize config with defaults
 */
export function initConfig(projectRoot: string): void {
  const configPath = getConfigPath(projectRoot);

  if (existsSync(configPath)) {
    console.log('Config already exists');
    return;
  }

  saveConfig(projectRoot, DEFAULT_CONFIG);
}

/**
 * Ensure the .ship-toolkit directory exists
 */
export function ensureShipDirectory(projectRoot: string): string {
  const shipDir = getConfigDir(projectRoot);

  if (!existsSync(shipDir)) {
    mkdirSync(shipDir, { recursive: true });
  }

  return shipDir;
}

export default {
  loadConfig,
  saveConfig,
  updateConfig,
  initConfig,
  getConfigDir,
  getConfigPath,
  ensureShipDirectory,
  DEFAULT_CONFIG
};
