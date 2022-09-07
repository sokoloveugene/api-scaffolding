#! /usr/bin/env node
import fs from 'fs'
import vm from 'vm'
import path from 'path'
import { exec } from 'child_process'
import { ApiInterfaceBuilder } from './interface.builder'

console.log('START')

const parseArgs = () => {
  const input = process.argv[3]
  const output = process.argv[5]
  const isWatch = process.argv[6] === '--watch'

  if (!input || !output) {
    throw new Error('Run command with correct arguments')
  }

  return {
    input: path.join(process.cwd(), input),
    output: path.join(process.cwd(), output),
    isWatch,
  }
}

const { input, output, isWatch } = parseArgs()

const generateTypes = () => {
  delete require.cache[require.resolve(input)]
  const { schema } = require(input)

  const interfaces = new ApiInterfaceBuilder(schema)

  console.log('generating...')
  fs.writeFileSync(output, interfaces.serialized, 'utf8')

  exec(`prettier --write ${output}`, (error) => {
    if (error) {
      console.log('prettier format error')
    }
  })
}

generateTypes()

if (isWatch) {
  fs.watchFile(input, { interval: 5000 }, generateTypes)
}