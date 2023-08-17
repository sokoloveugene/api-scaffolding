#!/usr/bin/env node
const fsp = require('node:fs/promises')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const ts = require('typescript')
const factory = ts.factory

const ASTtoString = (ast) => {
  return ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printNode(ts.EmitHint.Unspecified, ast)
}

const findSchema = (node) => {
  if (ts.isVariableDeclaration(node)) {
    const name = node.name.escapedText
    if (name === 'schema') {
      return node.initializer
    }
  }
  return node.forEachChild(findSchema)
}

const createPropertySignature = ({ name, type }) => {
  return factory.createPropertySignature(
    /* modifiers */ undefined,
    /* name */ factory.createIdentifier(name),
    /* questionToken */ undefined,
    /* type */ factory.createIdentifier(type)
  )
}

const createMethodSignature = ({ name, optional, params, hasPayload }) => {
  const createProperty = ({ name, type, optional }) => {
    return factory.createPropertySignature(
      /* modifiers */ undefined,
      /* name */ factory.createIdentifier(name),
      /* questionToken */ optional
        ? factory.createToken(ts.SyntaxKind.QuestionToken)
        : undefined,
      /* type */ type
    )
  }

  const parameter = factory.createParameterDeclaration(
    /* modifiers */ undefined,
    /* dotDotDotToken */ undefined,
    /* name */ factory.createIdentifier('params'),
    /* questionToken */ optional
      ? factory.createToken(ts.SyntaxKind.QuestionToken)
      : undefined,
    /* type */ factory.createTypeLiteralNode(
      [
        ...Object.entries(params).map(([name, type]) =>
          createProperty({ name, type: factory.createKeywordTypeNode(type) })
        ),
        createProperty({
          name: 'config',
          type: factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
          optional: true,
        }),
        hasPayload
          ? createProperty({
              name: 'payload',
              type: factory.createTypeReferenceNode(
                factory.createIdentifier('P')
              ),
            })
          : undefined,
      ].filter(Boolean)
    )
  )

  const returnType = factory.createTypeReferenceNode(
    factory.createIdentifier('Promise'),
    [factory.createTypeReferenceNode(factory.createIdentifier('R'), undefined)]
  )
  return factory.createPropertySignature(
    /* modifiers */ undefined,
    /* name */ factory.createIdentifier(name),
    /* questionToken */ undefined,
    /* type */ factory.createFunctionTypeNode(
      [
        factory.createTypeParameterDeclaration(
          undefined,
          factory.createIdentifier('R'),
          undefined,
          undefined
        ),
        hasPayload
          ? factory.createTypeParameterDeclaration(
              undefined,
              factory.createIdentifier('P'),
              undefined,
              factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
            )
          : undefined,
      ].filter(Boolean),
      [parameter],
      returnType
    )
  )
}

const createInterface = ({ name, members }) => {
  return factory.createInterfaceDeclaration(
    /* modifiers */ [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    /* name */ factory.createIdentifier(name),
    /* typeParameters */ undefined,
    /* heritageClauses */ undefined,
    /* members */ members
  )
}

const stringToType = (key) =>
  ({
    number: ts.SyntaxKind.NumberKeyword,
    string: ts.SyntaxKind.StringKeyword,
    boolean: ts.SyntaxKind.BooleanKeyword,
    any: ts.SyntaxKind.AnyKeyword,
    unknown: ts.SyntaxKind.UnknownKeyword,
  }[key.trim().toLowerCase()])

const PARSING_TIMEOUT = 1000
const EXECUTION_TIMEOUT = 5000
const WATCH_INTERVAL = 2000
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const Red = '\x1b[31m'
const Green = '\x1b[32m'
const error = (message) => console.log(Red, message)
const log = (message) => console.log(Green, message)
const time = () => `[${new Date().toLocaleString()}]`

const query = (method, [url]) => ({
  method,
  url,
  get isQuery() {
    return true
  },
  get hasPayload() {
    return ['POST', 'PUT', 'PATCH'].includes(this.method)
  },
})

const isQuery = (val) => val?.isQuery

const parseArgs = () => {
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value = true] = arg.split('=')
    acc[key] = value
    return acc
  }, {})

  const input = args['-i'] ?? args['--input']
  const output = args['-o'] ?? args['--output']

  if (!input) {
    error('Required parameter is missing\n -i=file/path OR --input=file/path')
    process.exit(1)
  }

  if (!output) {
    error('Required parameter is missing\n -o=file/path OR --output=file/path')
    process.exit(1)
  }

  return {
    input: path.join(process.cwd(), input),
    output: path.join(process.cwd(), output),
    isWatch: (args['-w'] ?? args['--watch']) || false,
    rootName: args['-n'] ?? args['--name'],
  }
}

class Interface {
  name = undefined
  properties = []
  methods = []

  setName(name) {
    this.name = name
  }

  addProperty({ name, type }) {
    this.properties.push({ name, type })
  }

  addMethod({ name, optional, params = {}, hasPayload = false }) {
    this.methods.push({ name, optional, params, hasPayload })
  }

  generate() {
    return createInterface({
      name: this.name,
      members: [
        ...this.properties.map(createPropertySignature),
        ...this.methods.map(createMethodSignature),
      ],
    })
  }
}

class ApiInterfaceBuilder {
  constructor(schema, rootName) {
    this.results = []
    this.getInterface([], rootName, schema)
  }

  getInterface(parents, name, schema) {
    const instance = new Interface()
    const currentName = this.getInterfaceName(parents, name)
    instance.setName(currentName)

    for (const [field, value] of Object.entries(schema)) {
      if (isQuery(value)) {
        const { optional, params } = this.parseQuery(value)
        instance.addMethod({
          name: field,
          hasPayload: value.hasPayload,
          params,
          optional,
        })
        continue
      }
      const nextName = this.getInterfaceName([...parents, name], field)
      instance.addProperty({ name: field, type: nextName })
      this.getInterface([...parents, name], field, value)
    }

    this.results.push(ASTtoString(instance.generate()))
  }

  parseQuery(query) {
    const interpolations = [...query.url.matchAll(/{{(.*?)}}/g)].reduce(
      (acc, match, index) => (index === 0 ? acc : [...acc, match[1]]),
      []
    )
    const params = {}
    for (const interpolation of interpolations) {
      const [name, type = 'unknown'] = interpolation.split(/\??:/)
      params[name] = stringToType(type)
    }
    return { optional: interpolations.length === 0, params }
  }

  getInterfaceName(parents, serviceName) {
    return [...parents, serviceName].filter(Boolean).join('_')
  }
}

const { input, output, isWatch, rootName = 'RootApi' } = parseArgs()

const generate = async () => {
  const schema = await fsp
    .readFile(input, 'utf-8')
    .then((src) => ts.createSourceFile('x.ts', src, ts.ScriptTarget.Latest))
    .then(findSchema)
    .then(ASTtoString)
    .catch(() => null)

  if (schema === null) {
    return error(`${time()} Schema parse error`)
  }

  try {
    const src = `({${METHODS}}) => (${schema})`.replace(/\${.*?}/g, '')
    const script = new vm.Script(src, { timeout: PARSING_TIMEOUT })
    const sandbox = vm.createContext()
    const fn = script.runInNewContext(sandbox, { timeout: EXECUTION_TIMEOUT })
    const api = Object.fromEntries(
      METHODS.map((method) => [method, query.bind(null, method)])
    )
    const interfaces = new ApiInterfaceBuilder(fn(api), rootName)
    await fsp
      .writeFile(output, interfaces.results.join('\n\n'), 'utf-8')
      .then(() => log(`${time()} Saved`))
      .catch(() => error(`${time()} Can not write to file ${output}`))
  } catch {
    error(`${time()} Schema is not valid`)
  }
}

if (isWatch) {
  log('- Watch mode')
  fs.watchFile(input, { interval: WATCH_INTERVAL }, generate)
}

log(`- From: ${input}`)
log(`- To: ${output}`)
log(`- Interface name: ${rootName}`)

generate()
