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
  const go = await listChonk(input)
  if (go) {
    inquirer
      .prompt(qns)
      .then(async (answer) => {
        if (answer.chonkops) {
          return chonk(input)
        }
      })
      .then((totals) => {
        if (totals) {
          calcChonk(totals)
        }
      })
  } else {
    console.log(
      ` 
        /\\_/\\
       ( o.o )
        > ^ <
             `
    )
  }
}
