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
  let after
  const dir = `${fs.realpathSync(output)}/`
  const result = await compress({
    source: path,
    destination: dir,
    params: {
      statistic: false,
      compress_force: true
    },
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
      // log(`Before: ${before.toFixed(3)}, After: ${after.toFixed(3)}`)
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
  if (mb > 0.1) {
    if (!quiet) {
      log(`■■■■ ${chalk.green(file)} is too chonky: ${mb.toFixed('2')}mb`)
    }
    return true
  } else {
    return false
  }
}

const chonk = async (input) => {
  let flag = false
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
  let count = 0
  if (fs.lstatSync(input).isDirectory() || input === './') {
    const getFiles = require('./walk')
    for await (const f of getFiles(input)) {
      const check = await isChonk(f)
      if (check) {
        count++
        flag = true
      }
    }
    if (!flag) log('Nothing to de-chonk!')
  }
  return count
}
module.exports = {
  chonk,
  listChonk,
  calcChonk
}
