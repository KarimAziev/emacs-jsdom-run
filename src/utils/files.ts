import * as fs from 'fs';
import * as path from 'path';
import { builtinModules } from 'module';

export const expandNodeModules = (rootDir?: string) =>
  rootDir && path.resolve(rootDir, 'node_modules');

export const expandWhenExists = (
  moduleName: string,
  files: (string | undefined)[]
) =>
  files
    .map((dir) => typeof dir === 'string' && path.resolve(dir, moduleName))
    .find((file) => file && fs.existsSync(file));

export const windowRequire = (
  moduleName: string,
  files: (string | undefined)[]
) => {
  const file =
    builtinModules.includes(moduleName) || path.isAbsolute(moduleName)
      ? moduleName
      : expandWhenExists(moduleName, files);
  return file && require(file);
};

export const readFileContent = (file: fs.PathOrFileDescriptor) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    return 'No code';
  }
};
