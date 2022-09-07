#! /usr/bin/env npx ts-node
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { ApiInterfaceBuilder } from './interface.builder'

const COLORS = {
  info: '\x1b[33m%s\x1b[0m',
  error: '\x1b[31m',
}

const logger = (type: keyof typeof COLORS = 'info', message: string) => {
  console.log(COLORS[type], message)
}

const info = (message: string) => logger('info', message)
const error = (message: string) => logger('error', message)

const parseArgs = () => {
  const input = process.argv[3]
  const output = process.argv[5]
  const isWatch = process.argv[6] === '--watch'

  if (!input || !output) {
    error('input and output arguments are not valid')
    process.exit(1)
  }

  return {
    input: path.join(process.cwd(), input),
    output: path.join(process.cwd(), output),
    isWatch,
  }
}

const { input, output, isWatch } = parseArgs()

info(`Script started ${isWatch ? 'in watch mode' : ''}`)

const generateTypes = () => {
  delete require.cache[require.resolve(input)]
  info('Start loading schema from ' + input)
  const { schema } = require(input)

  info('Generate interfaces')
  const interfaces = new ApiInterfaceBuilder(schema)

  info('Write to file ' + output)
  fs.writeFileSync(output, interfaces.serialized, 'utf8')

  info('Format with prettier')
  exec(`prettier --write ${output}`, (err) => {
    if (err) {
      error('Prettier format error')
    }
  })
}

generateTypes()

if (isWatch) {
  fs.watchFile(input, { interval: 5000 }, generateTypes)
}
