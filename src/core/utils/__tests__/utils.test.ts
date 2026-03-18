import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

import {
  directoryExists,
  fileExists,
  ensureDir,
  writeFile,
  readFile,
  removeDir,
  removeFile,
  listDirs,
  listFiles,
  copyFile,
  isDirectory,
  isFile,
  getFileStats,
} from '../file-system.js';

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'jinn-utils-'));
}

describe('File System Utilities', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // --------------------------------------------------------------------------
  // directoryExists
  // --------------------------------------------------------------------------

  describe('directoryExists', () => {
    it('returns true for an existing directory', async () => {
      expect(await directoryExists(tmpDir)).toBe(true);
    });

    it('returns false for a nonexistent path', async () => {
      expect(await directoryExists(path.join(tmpDir, 'nope'))).toBe(false);
    });

    it('returns false when path is a file, not a directory', async () => {
      const f = path.join(tmpDir, 'file.txt');
      await fs.writeFile(f, 'content', 'utf-8');
      expect(await directoryExists(f)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // fileExists
  // --------------------------------------------------------------------------

  describe('fileExists', () => {
    it('returns true for an existing file', async () => {
      const f = path.join(tmpDir, 'exists.txt');
      await fs.writeFile(f, 'hello', 'utf-8');
      expect(await fileExists(f)).toBe(true);
    });

    it('returns false for a nonexistent path', async () => {
      expect(await fileExists(path.join(tmpDir, 'ghost.txt'))).toBe(false);
    });

    it('returns false when path is a directory, not a file', async () => {
      expect(await fileExists(tmpDir)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // ensureDir
  // --------------------------------------------------------------------------

  describe('ensureDir', () => {
    it('creates a nested directory structure', async () => {
      const nested = path.join(tmpDir, 'a', 'b', 'c');
      await ensureDir(nested);
      expect(await directoryExists(nested)).toBe(true);
    });

    it('is idempotent — calling twice does not throw', async () => {
      const dir = path.join(tmpDir, 'idempotent');
      await ensureDir(dir);
      await expect(ensureDir(dir)).resolves.toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // writeFile / readFile
  // --------------------------------------------------------------------------

  describe('writeFile', () => {
    it('creates parent directories automatically', async () => {
      const f = path.join(tmpDir, 'deep', 'nested', 'file.txt');
      await writeFile(f, 'hello');
      expect(await fileExists(f)).toBe(true);
    });

    it('overwrites existing file', async () => {
      const f = path.join(tmpDir, 'overwrite.txt');
      await writeFile(f, 'first');
      await writeFile(f, 'second');
      const content = await fs.readFile(f, 'utf-8');
      expect(content).toBe('second');
    });
  });

  describe('readFile', () => {
    it('returns the content that was written', async () => {
      const f = path.join(tmpDir, 'read.txt');
      await writeFile(f, 'the content');
      expect(await readFile(f)).toBe('the content');
    });

    it('throws for a nonexistent file', async () => {
      await expect(readFile(path.join(tmpDir, 'missing.txt'))).rejects.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // removeDir / removeFile
  // --------------------------------------------------------------------------

  describe('removeDir', () => {
    it('removes a directory and its contents', async () => {
      const dir = path.join(tmpDir, 'to-remove');
      await ensureDir(dir);
      await writeFile(path.join(dir, 'file.txt'), 'content');
      await removeDir(dir);
      expect(await directoryExists(dir)).toBe(false);
    });

    it('does not throw for nonexistent directory', async () => {
      await expect(removeDir(path.join(tmpDir, 'nope'))).resolves.toBeUndefined();
    });
  });

  describe('removeFile', () => {
    it('removes an existing file', async () => {
      const f = path.join(tmpDir, 'delete-me.txt');
      await writeFile(f, 'bye');
      await removeFile(f);
      expect(await fileExists(f)).toBe(false);
    });

    it('throws for a nonexistent file', async () => {
      await expect(removeFile(path.join(tmpDir, 'missing.txt'))).rejects.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // listDirs / listFiles
  // --------------------------------------------------------------------------

  describe('listDirs', () => {
    it('returns only directory names', async () => {
      await ensureDir(path.join(tmpDir, 'dir-a'));
      await ensureDir(path.join(tmpDir, 'dir-b'));
      await writeFile(path.join(tmpDir, 'file.txt'), 'x');
      const dirs = await listDirs(tmpDir);
      expect(dirs).toContain('dir-a');
      expect(dirs).toContain('dir-b');
      expect(dirs).not.toContain('file.txt');
    });

    it('returns empty array for empty directory', async () => {
      const empty = path.join(tmpDir, 'empty');
      await ensureDir(empty);
      expect(await listDirs(empty)).toHaveLength(0);
    });

    it('returns empty array for nonexistent path', async () => {
      expect(await listDirs(path.join(tmpDir, 'nope'))).toEqual([]);
    });
  });

  describe('listFiles', () => {
    it('returns only file names', async () => {
      await writeFile(path.join(tmpDir, 'a.txt'), 'a');
      await writeFile(path.join(tmpDir, 'b.txt'), 'b');
      await ensureDir(path.join(tmpDir, 'subdir'));
      const files = await listFiles(tmpDir);
      expect(files).toContain('a.txt');
      expect(files).toContain('b.txt');
      expect(files).not.toContain('subdir');
    });

    it('returns empty array for empty directory', async () => {
      const empty = path.join(tmpDir, 'empty2');
      await ensureDir(empty);
      expect(await listFiles(empty)).toHaveLength(0);
    });

    it('returns empty array for nonexistent path', async () => {
      expect(await listFiles(path.join(tmpDir, 'nope'))).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // copyFile
  // --------------------------------------------------------------------------

  describe('copyFile', () => {
    it('copies file content to destination', async () => {
      const src = path.join(tmpDir, 'src.txt');
      const dest = path.join(tmpDir, 'copy', 'dest.txt');
      await writeFile(src, 'copied content');
      await copyFile(src, dest);
      expect(await readFile(dest)).toBe('copied content');
    });

    it('creates destination parent directories', async () => {
      const src = path.join(tmpDir, 'orig.txt');
      const dest = path.join(tmpDir, 'deep', 'path', 'copy.txt');
      await writeFile(src, 'data');
      await copyFile(src, dest);
      expect(await fileExists(dest)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // isDirectory / isFile
  // --------------------------------------------------------------------------

  describe('isDirectory', () => {
    it('returns true for a directory', async () => {
      expect(await isDirectory(tmpDir)).toBe(true);
    });

    it('returns false for a file', async () => {
      const f = path.join(tmpDir, 'f.txt');
      await writeFile(f, 'x');
      expect(await isDirectory(f)).toBe(false);
    });

    it('returns false for nonexistent path', async () => {
      expect(await isDirectory(path.join(tmpDir, 'nope'))).toBe(false);
    });
  });

  describe('isFile', () => {
    it('returns true for a file', async () => {
      const f = path.join(tmpDir, 'isfile.txt');
      await writeFile(f, 'x');
      expect(await isFile(f)).toBe(true);
    });

    it('returns false for a directory', async () => {
      expect(await isFile(tmpDir)).toBe(false);
    });

    it('returns false for nonexistent path', async () => {
      expect(await isFile(path.join(tmpDir, 'nope'))).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // getFileStats
  // --------------------------------------------------------------------------

  describe('getFileStats', () => {
    it('returns a Stats object for an existing file', async () => {
      const f = path.join(tmpDir, 'stats.txt');
      await writeFile(f, 'stat me');
      const stats = await getFileStats(f);
      expect(stats).not.toBeNull();
      expect(stats!.isFile()).toBe(true);
    });

    it('returns null for a nonexistent path', async () => {
      const stats = await getFileStats(path.join(tmpDir, 'ghost'));
      expect(stats).toBeNull();
    });
  });
});
