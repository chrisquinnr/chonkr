#!/usr/bin/env node

const program = require('commander')
const go = require('../lib/chonk-flow')
program
  .arguments('[input]')
  .description('De-chonkify your assets', {
    input: 'starting directory to scan for chonky images',
    output: 'where to temporarily store images'
  })
  .action((input = './') => {
    go(input)
  })

program.parse(process.argv)
