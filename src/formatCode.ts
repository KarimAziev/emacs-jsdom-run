export const formatCode = (code: string) => {
  /* eslint-disable-next-line @typescript-eslint/no-var-requires */
  const prettier = require('prettier/standalone');
  /* eslint-disable-next-line @typescript-eslint/no-var-requires */
  const parserBabel = require('prettier/parser-babel');
  const result = prettier.format(`const result=${code}`, {
    parser: 'babel',
    plugins: [parserBabel],
    arrowParens: 'always',
    bracketSameLine: true,
    bracketSpacing: true,
    embeddedLanguageFormatting: 'auto',
    htmlWhitespaceSensitivity: 'strict',
    insertPragma: false,
    jsxSingleQuote: false,
    printWidth: 80,
    proseWrap: 'preserve',
    quoteProps: 'as-needed',
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    useTabs: false,
  });
  return result.replace(/^const[\s]result[\s]=[\s]/g, '');
};
