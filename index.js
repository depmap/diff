const fs = require('fs')
const path = require('path')
const process = require('process')

module.exports = (file, opts) => {
  file = path.join(process.cwd(), file)
  let meta = path.parse(file)
  // ignore '_'
  if (meta.base.indexOf('_') === 0) return

  // TODO check if opts.load[meta.ext.substring(1)] exists
  // if not, check if it wasn't properly named by iterating over
  // opts.load[iterator].meta.ext
  let type = meta.ext.substring(1)
  let loader = opts.load[type]

  console.log(`compiling ${meta.name}${meta.ext}`)
  let data = loader.compile.file(file, opts[type])
  let targetExt = loader.meta.outExt
  let targetDir = ''
  if (!fs.existsSync(opts.output)) fs.mkdirSync(opts.output)
  if (loader.meta.outDir && loader.meta.outDir !== '') {
    targetDir = path.join(opts.output, targetExt)
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir)
  }
  let target = path.join(targetDir,`${meta.name}.${targetExt}`)
  fs.writeFileSync(target, data)
  console.log(`  - done: ${target}`)
}
