const tree = require('treeify')

module.exports = (deps, file, opts) => {
	console.log(tree.asTree(deps))
}
