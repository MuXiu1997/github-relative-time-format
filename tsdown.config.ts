import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'tsdown'

function getUserscriptHeaders(version: string, requires: string[]): string {
  return `// ==UserScript==
// @name              GitHub Relative Time Format
// @name:zh-CN        GitHub 时间格式化
// @namespace         https://greasyfork.org/zh-CN/scripts/480032-github-relative-time-format
// @version           ${version}
// @description       replacing GitHub relative timestamps(<relative-time>) with customizable date and time formats
// @description:zh-CN 用自定义的日期时间格式替换 GitHub 时间显示（<relative-time>）
// @author            MuXiu1997 (https://github.com/MuXiu1997)
// @license           MIT
// @homepageURL       https://github.com/MuXiu1997/github-relative-time-format
// @supportURL        https://github.com/MuXiu1997/github-relative-time-format
// @match             https://github.com/**
// @icon              https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant             GM_getValue
// @grant             GM_setValue
// @grant             GM_registerMenuCommand
// @grant             GM_unregisterMenuCommand
${requires.map(u => `// @require           ${u}`).join('\n')}
// ==/UserScript==
`
}

const requires = [
  {
    name: 'dayjs',
    url: (version: string) => `https://cdn.jsdelivr.net/npm/dayjs@${version}/dayjs.min.js`,
    global: 'dayjs',
  },
  {
    name: 'ts-debounce',
    url: (version: string) => `https://cdn.jsdelivr.net/npm/ts-debounce@${version}/dist/src/index.umd.js`,
    global: 'tsDebounce',
  },
]

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'iife', // UserScript requires IIFE (Immediately Invoked Function Expression) format
  clean: true,
  platform: 'browser',
  target: 'es2015',
  minify: false,
  external: requires.map(r => r.name),
  noExternal: /.*/,
  outputOptions: {
    entryFileNames: 'index.js',
    globals: requires.reduce((acc, r) => {
      acc[r.name] = r.global
      return acc
    }, {} as Record<string, string>),
  },
  hooks: {
    'build:done': async (ctx) => {
      const outDir = ctx.options.outDir
      const pkg = ctx.options.pkg ?? {}
      const version = pkg.version ?? 'unknown'
      const dependencies = pkg.dependencies ?? {}
      const outputFile = join(outDir, 'index.js')
      const content = await readFile(outputFile, 'utf-8')

      const headers = getUserscriptHeaders(version, requires.map(r => r.url(dependencies[r.name])))
      const newContent = headers + content

      await writeFile(outputFile, newContent, 'utf-8')
    },
  },
})
