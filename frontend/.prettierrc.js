module.exports = {
  // 基本格式
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',

  // JavaScript
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // HTML
  htmlWhitespaceSensitivity: 'css',

  // 其他
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',

  // 文件覆蓋
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yaml',
      options: {
        printWidth: 80,
      },
    },
  ],
};
