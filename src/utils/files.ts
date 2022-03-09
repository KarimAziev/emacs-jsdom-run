import * as fs from 'fs';
import * as path from 'path';

export const expandNodeModules = (rootDir?: string) =>
  rootDir && path.resolve(rootDir, 'node_modules');

const builtins = require('repl')._builtinLibs;

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
    builtins.includes(moduleName) || path.isAbsolute(moduleName)
      ? moduleName
      : expandWhenExists(moduleName, files);
  return file && require(file);
};
