const fs = require('fs')
const path = require('path')
const process = require('process')

module.exports = (file, opts) => {
  file = path.join(process.cwd(), file)
  let meta = path.parse(file)

  // TODO check if opts.load[meta.ext.substring(1)] exists
  // if not, check if it wasn't properly named by iterating over
  // opts.load[iterator].meta.ext
  let loader = opts.load[meta.ext.substring(1)]

  console.log('compiling', file)
  let data = loader.compile.file(file)
  let targetExt = loader.meta.outExt
  if (!fs.existsSync(opts.output)) fs.mkdirSync(opts.output)
  let target = path.join(opts.output, `${meta.name}.${targetExt}`)
  fs.writeFileSync(target, data)
}
