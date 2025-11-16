import { describe, it } from 'node:test';
import assert from 'node:assert';
import { detectFramework } from '../../lib/utils/framework-detector.js';
import { createTestProject, cleanupTestProject } from '../setup.js';

describe('Framework Detection Integration Tests', () => {
  it('should detect Next.js App Router', async () => {
    const projectPath = await createTestProject('test-next-app', {
      'package.json': JSON.stringify({
        dependencies: { next: '14.0.0', react: '^18.0.0' }
      }),
      'app/layout.tsx': 'export default function Layout() {}',
      'app/page.tsx': 'export default function Page() {}'
    });

    try {
      const result = await detectFramework(projectPath);
      assert.strictEqual(result.framework, 'next-app');
      assert.ok(result.confidence > 0.8);
    } finally {
      await cleanupTestProject(projectPath);
    }
  });

  it('should detect Next.js Pages Router', async () => {
    const projectPath = await createTestProject('test-next-pages', {
      'package.json': JSON.stringify({
        dependencies: { next: '13.0.0', react: '^18.0.0' }
      }),
      'pages/index.tsx': 'export default function Home() {}',
      'pages/_app.tsx': 'export default function App() {}'
    });

    try {
      const result = await detectFramework(projectPath);
      assert.strictEqual(result.framework, 'next-pages');
    } finally {
      await cleanupTestProject(projectPath);
    }
  });

  it('should detect Vite React', async () => {
    const projectPath = await createTestProject('test-vite', {
      'package.json': JSON.stringify({
        dependencies: { react: '^18.0.0' },
        devDependencies: { vite: '^5.0.0' }
      }),
      'vite.config.ts': 'export default {}'
    });

    try {
      const result = await detectFramework(projectPath);
      assert.strictEqual(result.framework, 'vite');
    } finally {
      await cleanupTestProject(projectPath);
    }
  });

  it('should handle missing package.json gracefully', async () => {
    const projectPath = await createTestProject('test-no-package', {
      'index.html': '<html></html>'
    });

    try {
      const result = await detectFramework(projectPath);
      assert.strictEqual(result.framework, 'static');
    } finally {
      await cleanupTestProject(projectPath);
    }
  });

  it('should handle invalid package.json gracefully', async () => {
    const projectPath = await createTestProject('test-invalid-package', {
      'package.json': 'not valid json {{'
    });

    try {
      const result = await detectFramework(projectPath);
      assert.strictEqual(result.framework, 'static');
    } finally {
      await cleanupTestProject(projectPath);
    }
  });
});
