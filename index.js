const fs = require('fs')
const path = require('path')
const process = require('process')
const framer = require('code-frame')

module.exports = (item, opts, depmap) => {
  let file = item.context.filepath
  let meta = path.parse(file)

  // ignore '_'
  if (meta.base.indexOf('_') === 0) return

  // TODO check if opts.load[meta.ext] exists
  // if not, check if it wasn't properly named by iterating over
  // opts.load[iterator].meta.ext
  let type = meta.ext
  let loader = opts.load[type]
  if (!loader) { // find loader via meta.ext
    for (let l in opts.load) {
      let load = opts.load[l]
      possibleExts = Array.isArray(load.meta.ext) ? load.meta.ext : [load.meta.ext]
      let pos = possibleExts.indexOf(type)
      if (pos > -1 && possibleExts[pos] === type) {
        loader = load
      }
    }
  }

  if (item.context.key) {
    // handle when data doesn't exist
    let locals = loader.map[rawName].data
    if (loader.map[rawName].onUpdate) loader.map[rawName].onUpdate(locals)
  } else if (loader) {
    console.log(`compiling ${meta.name}${meta.ext}`)
    let data = ''
    let compileErr = null
    try {
      data = loader.compile.file(file, opts[type])
    } catch (err) {
      // die or log
      compileErr = err
      console.error(err.filename, err.msg)
      console.warn(framer(fs.readFileSync(file).toString(), err.line, err.column))
    }

    if (!compileErr) {
      let targetExt = loader.meta.outExt ? loader.meta.outExt : meta.ext
      let targetDir = opts.output

      if (!fs.existsSync(opts.output)) fs.mkdirSync(opts.output)
      if (loader.meta.outDir && loader.meta.outDir !== '') {
        targetDir = path.join(opts.output, loader.meta.outDir)
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir)
      }

      let target = path.join(targetDir,`${meta.name}${targetExt}`)
      if (!data) data = fs.readFileSync(file) // if data is null, just copy
      if (target) fs.writeFileSync(target, data)
      console.log(`  - done: ${target}`)
    }
  } else
    // TODO move file to build
    console.log(`Warning: No loader found for ${meta.name}${meta.ext}, ignoring`)
}
