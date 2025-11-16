import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateUrl,
  validateProjectDirectory,
  validateFilePath,
  sanitizeInput,
  validateEmail,
  validatePort,
  validateImageDimensions,
  validateScore,
  validateConfig
} from '../../lib/utils/validation.js';
import { createTestProject, cleanupTestProject } from '../setup.js';

describe('Validation Module Integration Tests', () => {
  describe('validateUrl', () => {
    it('should validate and sanitize valid URLs', () => {
      const result = validateUrl('example.com');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'https://example.com');
    });

    it('should accept URLs with protocol', () => {
      const result = validateUrl('https://example.com');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'https://example.com');
    });

    it('should reject empty URLs', () => {
      const result = validateUrl('');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error);
    });

    it('should reject invalid URLs', () => {
      const result = validateUrl('not a url!@#$');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error);
    });

    it('should handle URLs with paths and query params', () => {
      const result = validateUrl('https://example.com/path?foo=bar');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitized, 'https://example.com/path?foo=bar');
    });
  });

  describe('validateProjectDirectory', () => {
    it('should validate existing directory', async () => {
      const projectPath = await createTestProject('test-dir-validation', {
        'package.json': '{"name":"test"}'
      });

      try {
        const result = validateProjectDirectory(projectPath);
        assert.strictEqual(result.valid, true);
        assert.ok(result.resolved);
      } finally {
        await cleanupTestProject(projectPath);
      }
    });

    it('should reject non-existent directory', () => {
      const result = validateProjectDirectory('/nonexistent/directory/path');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('does not exist'));
    });

    it('should reject empty path', () => {
      const result = validateProjectDirectory('');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error);
    });
  });

  describe('validateFilePath', () => {
    it('should validate existing file', async () => {
      const projectPath = await createTestProject('test-file-validation', {
        'test.txt': 'hello world'
      });

      try {
        const filePath = `${projectPath}/test.txt`;
        const result = validateFilePath(filePath, { mustExist: true });
        assert.strictEqual(result.valid, true);
        assert.ok(result.resolved);
      } finally {
        await cleanupTestProject(projectPath);
      }
    });

    it('should validate file extension', async () => {
      const projectPath = await createTestProject('test-ext-validation', {
        'test.json': '{}'
      });

      try {
        const filePath = `${projectPath}/test.json`;
        const result = validateFilePath(filePath, { 
          mustExist: true, 
          extension: 'json' 
        });
        assert.strictEqual(result.valid, true);
      } finally {
        await cleanupTestProject(projectPath);
      }
    });

    it('should reject wrong extension', async () => {
      const projectPath = await createTestProject('test-wrong-ext', {
        'test.txt': 'text'
      });

      try {
        const filePath = `${projectPath}/test.txt`;
        const result = validateFilePath(filePath, { 
          mustExist: true, 
          extension: 'json' 
        });
        assert.strictEqual(result.valid, false);
        assert.ok(result.error?.includes('extension'));
      } finally {
        await cleanupTestProject(projectPath);
      }
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const result = sanitizeInput('  hello world  ');
      assert.strictEqual(result, 'hello world');
    });

    it('should enforce max length', () => {
      const result = sanitizeInput('hello world', { maxLength: 5 });
      assert.strictEqual(result, 'hello');
    });

    it('should filter allowed characters', () => {
      const result = sanitizeInput('hello123!@#', { 
        allowedCharacters: /[a-z]/
      });
      assert.strictEqual(result, 'hello');
    });

    it('should return empty string for invalid input', () => {
      assert.strictEqual(sanitizeInput(null as any), '');
      assert.strictEqual(sanitizeInput(undefined as any), '');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      assert.strictEqual(result.valid, true);
    });

    it('should reject invalid email', () => {
      const result = validateEmail('not-an-email');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error);
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validatePort', () => {
    it('should validate valid port number', () => {
      const result = validatePort(3000);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.port, 3000);
    });

    it('should validate port as string', () => {
      const result = validatePort('8080');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.port, 8080);
    });

    it('should reject port out of range', () => {
      const result = validatePort(70000);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error);
    });

    it('should reject negative port', () => {
      const result = validatePort(-1);
      assert.strictEqual(result.valid, false);
    });

    it('should reject non-numeric port', () => {
      const result = validatePort('abc');
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validateImageDimensions', () => {
    it('should validate normal dimensions', () => {
      const result = validateImageDimensions(1920, 1080);
      assert.strictEqual(result.valid, true);
    });

    it('should reject zero dimensions', () => {
      const result = validateImageDimensions(0, 1080);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error);
    });

    it('should reject negative dimensions', () => {
      const result = validateImageDimensions(1920, -1);
      assert.strictEqual(result.valid, false);
    });

    it('should reject too large dimensions', () => {
      const result = validateImageDimensions(20000, 20000);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('too large'));
    });

    it('should reject non-number dimensions', () => {
      const result = validateImageDimensions('1920' as any, 1080);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validateScore', () => {
    it('should validate score in range', () => {
      const result = validateScore(85);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.normalized, 85);
    });

    it('should normalize decimal scores', () => {
      const result = validateScore(85.7);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.normalized, 86);
    });

    it('should accept edge values', () => {
      assert.strictEqual(validateScore(0).valid, true);
      assert.strictEqual(validateScore(100).valid, true);
    });

    it('should reject score out of range', () => {
      assert.strictEqual(validateScore(101).valid, false);
      assert.strictEqual(validateScore(-1).valid, false);
    });

    it('should reject NaN', () => {
      const result = validateScore(NaN);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error);
    });

    it('should reject non-number', () => {
      const result = validateScore('85' as any);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validateConfig', () => {
    it('should validate config with all required keys', () => {
      const config = { name: 'test', version: '1.0.0', url: 'example.com' };
      const result = validateConfig(config, ['name', 'version']);
      assert.strictEqual(result.valid, true);
    });

    it('should detect missing keys', () => {
      const config = { name: 'test' };
      const result = validateConfig(config, ['name', 'version', 'url']);
      assert.strictEqual(result.valid, false);
      assert.ok(result.missing);
      assert.strictEqual(result.missing.length, 2);
      assert.ok(result.missing.includes('version'));
      assert.ok(result.missing.includes('url'));
    });

    it('should detect null values as missing', () => {
      const config = { name: 'test', version: null };
      const result = validateConfig(config, ['name', 'version']);
      assert.strictEqual(result.valid, false);
      assert.ok(result.missing?.includes('version'));
    });

    it('should detect undefined values as missing', () => {
      const config = { name: 'test', version: undefined };
      const result = validateConfig(config, ['name', 'version']);
      assert.strictEqual(result.valid, false);
      assert.ok(result.missing?.includes('version'));
    });
  });
});
