/**
 * Performance Module - Export all performance utilities
 */

// Analyzer
export {
  analyzePerformance,
  quickPerformanceCheck,
  getPerformanceRating,
  assessCoreWebVitals,
  formatMetrics,
  calculateTimeSavings,
  calculateByteSavings,
  type PerformanceMetrics,
  type Opportunity,
  type Diagnostic,
  type PerformanceAnalysis,
  type LighthouseOptions,
} from './analyzer.js';

// Images
export {
  optimizeImages,
  optimizeImage,
  convertToWebP,
  convertToAVIF,
  generateResponsiveImages,
  analyzeImages,
  addLazyLoading,
  convertToNextImage,
  type ImageOptimization,
  type OptimizationOptions,
  type ImageAnalysis,
} from './images.js';

// Bundle
export {
  analyzeBundle,
  findUnusedDependencies,
  suggestCodeSplitting,
  getDependencySizes,
  type FileSize,
  type Duplicate,
  type BundleAnalysis,
  type DependencyInfo,
} from './bundle.js';

// Optimizer
export {
  applyOptimizations,
  optimizeNextJsConfig,
  optimizeViteConfig,
  optimizeWithComparison,
  addSecurityHeaders,
  estimateImprovements,
  type OptimizationOptions as OptimizerOptions,
  type OptimizationResult,
} from './optimizer.js';
