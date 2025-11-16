import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const TEST_TIMEOUT = 60000;

export async function createTestProject(name: string, files: Record<string, string>): Promise<string> {
  const testDir = join(process.cwd(), 'tests', 'temp', name);
  
  // Clean up if exists
  if (existsSync(testDir)) {
    await rm(testDir, { recursive: true, force: true });
  }
  
  await mkdir(testDir, { recursive: true });
  
  // Create files
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(testDir, filePath);
    const dir = join(fullPath, '..');
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, content);
  }
  
  return testDir;
}

export async function cleanupTestProject(projectPath: string): Promise<void> {
  if (existsSync(projectPath)) {
    await rm(projectPath, { recursive: true, force: true });
  }
}

export function mockLogger() {
  const logs: string[] = [];
  return {
    info: (msg: string) => logs.push(`INFO: ${msg}`),
    success: (msg: string) => logs.push(`SUCCESS: ${msg}`),
    warn: (msg: string) => logs.push(`WARN: ${msg}`),
    error: (msg: string) => logs.push(`ERROR: ${msg}`),
    logs
  };
}
