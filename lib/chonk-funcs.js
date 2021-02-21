const fs = require('fs')
const chalk = require('chalk')
const { get } = require('http')
const log = console.log

const checkChonk = async (file) => {
  const { size } = await fs.promises.stat(file)
  return size / (1024 * 1024)
}

const deChonkImage = async (path, output) => {
  const { compress } = require('compress-images/promise')
  const before = await checkChonk(path)
  const dir = `${fs.realpathSync(output)}/`
  const result = await compress({
    source: path,
    destination: dir,
    params: {
      statistic: false,
      compress_force: true
    },
    // Here's where we can hook into the underlying engines and adjust
    // compression / quality settings
    enginesSetup: {
      jpg: { engine: 'mozjpeg', command: ['-quality', '60'] },
      png: { engine: 'pngquant', command: ['--quality=20-50', '-o'] }
    }
  })
  if (result) {
    const { statistics } = result
    const data = statistics[0]
    const { path_out_new: newfile, input: oldpath } = data
    const { copyFile, unlink } = require('fs').promises

    try {
      await copyFile(newfile, oldpath)
      const after = await checkChonk(newfile)
      await unlink(newfile)
      return {
        before: before,
        after: after
      }
    } catch (error) {
      console.error(error)
    }
  }
}

const calcChonk = async (totals) => {
  // Yep, stackoverflowed this one
  class calcArray extends Array {
    sum(key) {
      return this.reduce((a, b) => a + (b[key] || 0), 0)
    }
    sub(bef, aft) {
      return bef - aft
    }
  }
  const result = new calcArray(...totals)
  const before = result.sum('before')
  const after = result.sum('after')
  const total = result.sub(before, after)
  log(`You saved ${chalk.bgGreen.white(total.toFixed(3))}mb!`)
}

const isChonk = async (file, quiet = false) => {
  const mb = await checkChonk(file)

  // Here's where we've hardcoded the threshold
  // It's 500kb, which is still probably too high, but we're
  // more interested in catching egregious culprits
  if (mb > 0.5) {
    if (!quiet) {
      const display = require('path').parse(file)
      let box = chalk.grey('■')
      if (mb > 1) {
        box = chalk.yellow('■')
      }
      if (mb > 2) {
        box = chalk.red('■')
      }
      log(`${box} ${mb.toFixed('2')}mb chonk: ${chalk.green(display.base)}`)
    }
    return true
  } else {
    return false
  }
}

const chonk = async (input) => {
  let flag = false

  // We're only interested in traversing directories
  if (fs.lstatSync(input).isDirectory() || input === './') {
    const tmp = require('tmp')
    let totals = []
    const output = tmp.dirSync()
    const getFiles = require('./walk')
    for await (const f of getFiles(input)) {
      const check = await isChonk(f, true)
      if (check) {
        flag = true
        const res = await deChonkImage(f, output.name)
        if (res) {
          totals.push(res)
        }
      }
    }
    return totals
  }
  if (!flag) log('Nothing to de-chonk!')
}

const listChonk = async (input) => {
  let flag = false
  if (fs.lstatSync(input).isDirectory() || input === './') {
    const getFiles = require('./walk')
    for await (const f of getFiles(input)) {
      const check = await isChonk(f)
      if (check) {
        flag = true
      }
    }
    if (!flag) {
      log('Nothing to de-chonk!')
    }
    return flag
  }
}
module.exports = {
  chonk,
  listChonk,
  calcChonk
}
