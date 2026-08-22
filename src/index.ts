import type { Context } from 'koishi'
import { h, Schema } from 'koishi'
import enUS from './locales/en-US.yml'
import zhCN from './locales/zh-CN.yml'

export const name = 'fmtutils'

export interface Config {
  markdown: boolean
  tex: boolean
  code: boolean
  table: boolean
}

export const Config: Schema<Config> = Schema.object({
  markdown: Schema.boolean().default(true).description('启用 markdown 指令。'),
  tex: Schema.boolean().default(true).description('启用 TeX 指令。'),
  code: Schema.boolean().default(true).description('启用代码块指令。'),
  table: Schema.boolean().default(true).description('启用表格指令。'),
})

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('en-US', enUS)
  ctx.i18n.define('zh-CN', zhCN)

  config.markdown && ctx.command('markdown <message:text>')
    .action((_, message) => h('markdown', h.text(message)))

  config.tex && ctx.command('tex <message:text>')
    .action((_, message) => h('markdown', `$$\n`, h.text(message), `\n$$`))

  config.code && ctx.command('code <message:text>')
    .option('lang', '-l <lang:string>')
    .action(({ options }, message) =>
      h('markdown', `\`\`\`${options?.lang || ''}\n`, h.text(message), `\n\`\`\``))

  config.table && ctx.command('table <message:text>')
    .option('virtual', '-v')
    .option('transpose', '-T')
    .action(({ options }, message) => {
      let cells = message.split('\n').map(line => line.split(' '))
      const maxLength = Math.max(...cells.map(row => row.length))
      const columnCount = options?.transpose ? cells.length : maxLength
      if (options?.transpose)
        cells = Array.from({ length: maxLength }, (_, i) => cells.map(row => row[i]))

      options?.virtual && cells.unshift([])
      const lines = cells.map(row =>
        `|${Array.from(
          { length: columnCount },
          (_, index) => h.text(row[index]),
        ).join('|')}|`)
      lines.splice(1, 0, `${'|-'.repeat(columnCount)}|`)

      return h('markdown', lines.join('\n'))
    })
}
