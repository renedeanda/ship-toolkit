/**
 * Deployment Module - Export all deployment utilities
 */

// Platform Detection
export {
  detectPlatform,
  hasVercelConfig,
  hasNetlifyConfig,
  createVercelConfig,
  createNetlifyConfig,
  getRecommendedPlatform,
  validatePlatformConfig,
  getPlatformBuildCommand,
  getPlatformUrlPattern,
  type Platform,
  type PlatformConfig,
} from './detector.js';

// Vercel Deployment
export {
  isVercelCLIInstalled,
  installVercelCLI,
  checkVercelAuth,
  loginToVercel,
  deployToVercel,
  createVercelProject,
  setEnvironmentVariables,
  getDeploymentLogs,
  listDeployments,
  rollbackDeployment,
  getProjectUrl,
  runPreDeploymentChecks,
  buildProject,
  addCustomDomain,
  removeDeployment,
  getVercelCLIVersion,
  checkDeploymentStatus,
  type DeployResult,
  type VercelProject,
  type EnvironmentVariable,
} from './vercel.js';

// Netlify Deployment
export {
  isNetlifyCLIInstalled,
  installNetlifyCLI,
  checkNetlifyAuth,
  loginToNetlify,
  deployToNetlify,
  buildNetlifyProject,
  initNetlifySite,
  linkNetlifySite,
  setNetlifyEnv,
  getSiteInfo,
  listNetlifyDeployments,
  addNetlifyDomain,
  getNetlifyCLIVersion,
  openNetlifyDashboard,
  runNetlifyPreDeploymentChecks,
  type NetlifyDeployResult,
} from './netlify.js';
