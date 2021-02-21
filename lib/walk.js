module.exports = async function* getFiles(dir) {
  const { resolve, extname } = require('path')
  const { readdir } = require('fs').promises

  const dirents = await readdir(dir, { withFileTypes: true })
  const types = ['.jpg', '.jpeg', '.png']
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      if (types.includes(extname(res))) yield res
    }
  }
}
