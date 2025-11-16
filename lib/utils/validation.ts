import { existsSync, statSync } from 'fs';
import { isAbsolute, resolve } from 'path';

/**
 * Validation utilities for ship-toolkit
 */

/**
 * Validate and sanitize a URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required and must be a string' };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Add protocol if missing
  let sanitized = trimmed;
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = `https://${sanitized}`;
  }

  try {
    const parsed = new URL(sanitized);

    // Check for valid hostname
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return { valid: false, error: 'Invalid hostname' };
    }

    // Check for localhost/internal URLs in production
    const isLocal = parsed.hostname === 'localhost' ||
                    parsed.hostname === '127.0.0.1' ||
                    parsed.hostname.endsWith('.local');

    if (isLocal && process.env.NODE_ENV === 'production') {
      return {
        valid: false,
        error: 'Localhost URLs cannot be used in production'
      };
    }

    return { valid: true, sanitized };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid URL format: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate a project directory exists and is accessible
 */
export function validateProjectDirectory(path: string): {
  valid: boolean;
  error?: string;
  resolved?: string;
} {
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'Path is required and must be a string' };
  }

  const trimmed = path.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Path cannot be empty' };
  }

  try {
    const resolved = isAbsolute(trimmed) ? trimmed : resolve(process.cwd(), trimmed);

    if (!existsSync(resolved)) {
      return {
        valid: false,
        error: `Directory does not exist: ${resolved}`
      };
    }

    const stats = statSync(resolved);

    if (!stats.isDirectory()) {
      return {
        valid: false,
        error: `Path is not a directory: ${resolved}`
      };
    }

    return { valid: true, resolved };
  } catch (err) {
    return {
      valid: false,
      error: `Cannot access directory: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate a file path (can be relative or absolute)
 */
export function validateFilePath(path: string, options?: {
  mustExist?: boolean;
  extension?: string;
}): { valid: boolean; error?: string; resolved?: string } {
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'File path is required and must be a string' };
  }

  const trimmed = path.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'File path cannot be empty' };
  }

  try {
    const resolved = isAbsolute(trimmed) ? trimmed : resolve(process.cwd(), trimmed);

    if (options?.mustExist && !existsSync(resolved)) {
      return {
        valid: false,
        error: `File does not exist: ${resolved}`
      };
    }

    if (options?.mustExist) {
      const stats = statSync(resolved);
      if (!stats.isFile()) {
        return {
          valid: false,
          error: `Path is not a file: ${resolved}`
        };
      }
    }

    if (options?.extension) {
      const ext = options.extension.startsWith('.') ? options.extension : `.${options.extension}`;
      if (!resolved.endsWith(ext)) {
        return {
          valid: false,
          error: `File must have ${ext} extension`
        };
      }
    }

    return { valid: true, resolved };
  } catch (err) {
    return {
      valid: false,
      error: `Cannot validate file path: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string, options?: {
  maxLength?: number;
  allowedCharacters?: RegExp;
}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Apply max length
  if (options?.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  // Filter allowed characters if specified
  if (options?.allowedCharacters) {
    sanitized = sanitized.split('').filter(char =>
      options.allowedCharacters!.test(char)
    ).join('');
  }

  return sanitized;
}

/**
 * Validate an email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  // Basic email regex - not perfect but good enough
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate port number
 */
export function validatePort(port: number | string): { valid: boolean; error?: string; port?: number } {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum)) {
    return { valid: false, error: 'Port must be a number' };
  }

  if (portNum < 1 || portNum > 65535) {
    return { valid: false, error: 'Port must be between 1 and 65535' };
  }

  return { valid: true, port: portNum };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(width: number, height: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof width !== 'number' || typeof height !== 'number') {
    return { valid: false, error: 'Width and height must be numbers' };
  }

  if (width <= 0 || height <= 0) {
    return { valid: false, error: 'Width and height must be positive numbers' };
  }

  if (width > 10000 || height > 10000) {
    return { valid: false, error: 'Image dimensions are too large (max: 10000x10000)' };
  }

  return { valid: true };
}

/**
 * Validate score (0-100)
 */
export function validateScore(score: number): { valid: boolean; error?: string; normalized?: number } {
  if (typeof score !== 'number') {
    return { valid: false, error: 'Score must be a number' };
  }

  if (isNaN(score)) {
    return { valid: false, error: 'Score cannot be NaN' };
  }

  if (score < 0 || score > 100) {
    return { valid: false, error: 'Score must be between 0 and 100' };
  }

  return { valid: true, normalized: Math.round(score) };
}

/**
 * Validate configuration object has required keys
 */
export function validateConfig<T extends Record<string, any>>(
  config: T,
  requiredKeys: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  const missing: string[] = [];

  for (const key of requiredKeys) {
    if (!(key in config) || config[key] === undefined || config[key] === null) {
      missing.push(key as string);
    }
  }

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

export default {
  validateUrl,
  validateProjectDirectory,
  validateFilePath,
  sanitizeInput,
  validateEmail,
  validatePort,
  validateImageDimensions,
  validateScore,
  validateConfig
};
