import { type Config } from 'prettier'
import { options, parsers, printers } from 'prettier-plugin-tailwindcss'

const config: Config = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  arrowParens: 'always',
  bracketSpacing: true,
  singleAttributePerLine: true,
  endOfLine: 'crlf',
  semi: false,
  trailingComma: 'none',
  useTabs: false,
  tailwindAttributes: ['className'],
  plugins: [parsers]
}

export default config
