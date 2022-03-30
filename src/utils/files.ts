import * as fs from 'fs';
import * as path from 'path';
import { builtinModules } from 'module';

export const expandNodeModules = (rootDir?: string) =>
  rootDir && path.resolve(rootDir, 'node_modules');

function isRelative(file: string) {
  return /^\.\.?\//.test(file);
}

export const expandWhenExists = (moduleName: string, files: string[]) =>
  files
    .map((dir) => typeof dir === 'string' && path.resolve(dir, moduleName))
    .find((file) => file && fs.existsSync(file));

function expandRelative(moduleName: string, dirname: string) {
  const file = path.resolve(dirname, moduleName);
  if (fs.existsSync(file)) {
    return file;
  } else {
    return [`${file}.js`, `${file}.json`].find((f: string) => fs.existsSync(f));
  }
}

export const createRequire = (files: string[], dirname?: string) => {
  function myRequire(moduleName: string) {
    const file = isRelative(moduleName)
      ? expandRelative(moduleName, dirname || __dirname)
      : builtinModules.includes(moduleName) || path.isAbsolute(moduleName)
      ? moduleName
      : expandWhenExists(moduleName, files);

    return require(file || moduleName);
  }
  return myRequire;
};

export const readFileContent = (file: fs.PathOrFileDescriptor) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    return 'No code';
  }
};
