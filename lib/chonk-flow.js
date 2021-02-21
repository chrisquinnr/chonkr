module.exports = async (input) => {
  const inquirer = require('inquirer')
  const { chonk, listChonk, calcChonk } = require('./chonk-funcs')

  const qns = [
    {
      type: 'confirm',
      name: 'chonkops',
      message: 'Compress files?'
    }
  ]
  const list = await listChonk(input)
  inquirer
    .prompt(qns)
    .then(async (answer) => {
      if (answer.chonkops === 'yes') {
        return chonk(input)
      }
    })
    .then((totals) => {
      if (totals) {
        calcChonk(totals)
      }
    })
}
