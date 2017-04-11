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
  if (!loader) { // find loader via meta.ext
    for (let l in opts.load) {
      let load = opts.load[l]
      let pos = load.meta.ext.indexOf(type)
      if (pos > -1) loader = load
    }
  }

  console.log(`compiling ${meta.name}${meta.ext}`)
  let data = loader.compile.file(file, opts[type])
  let targetExt = loader.meta.outExt ? loader.meta.outExt : meta.ext.substring(1)
  let targetDir = opts.output
  if (!fs.existsSync(opts.output)) fs.mkdirSync(opts.output)
  if (loader.meta.outDir && loader.meta.outDir !== '') {
    targetDir = path.join(opts.output, loader.meta.outDir)
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir)
  }
  let target = path.join(targetDir,`${meta.name}.${targetExt}`)
  if (!data) data = fs.readFileSync(file) // if data is null, just copy
  if (target) fs.writeFileSync(target, data)
  console.log(`  - done: ${target}`)
}
