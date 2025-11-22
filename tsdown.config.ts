import { defineConfig } from 'tsdown'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import pkg from './package.json' with { type: 'json' }

function getUserscriptHeaders(version: string): string {
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
// ==/UserScript==
`
}

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'iife', // UserScript 需要立即执行函数格式
  clean: true,
  platform: 'browser',
  target: 'es2020', // 现代浏览器
  minify: true,
  hooks: {
    "build:done": async (ctx) => {
      const outputFile = join(ctx.options.outDir, 'index.iife.js')
      const content = await readFile(outputFile, 'utf-8')
      
      const headers = getUserscriptHeaders(pkg.version)
      const newContent = headers + content
      
      await writeFile(outputFile, newContent, 'utf-8')
    }
  }
})
