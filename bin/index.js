#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const colors = require('colors');
const packer = require('../lib/packer');
program
  .version('0.1.0')
  .usage('[options] <InputFile ...> <OutputFile ...>')
  .option('-e, --encoding <n>', 'Encoding Level 10-95 default 62; more than 62 will appear unconventional characters', parseInt)
  .option('-f, --fast', 'fast decode')
  .option('-s, --special', 'special characters')
  .parse(process.argv);

if (!program.args || program.args.length < 1) {
  program.outputHelp(text => colors.red(text));
  return;
}
fs.exists(program.args[0], function (exists) {
  if (!exists) {
    console.error(colors.red("file not exist"));
    return;
  }
  let encoding = program.encoding;
  let fast = program.fast || false;
  let special = program.special || false;
  let output = program.args[1];
  let inScript = fs.readFileSync(program.args[0]).toString();
  if (typeof  encoding === "undefined" || isNaN(encoding)) {
    encoding = 62;
  }
  if (typeof output === "undefined") {
    output = program.args[0].replace(/((.*[\/\\])?[^.\/\\]*)(\.[^.]*)*$/, '$1.min.js')
  }

  let outScript = packer(inScript, encoding, fast, special);
  fs.writeFileSync(output, outScript);
  console.log("InputFile: %j", program.args[0]);
  console.log("OutputFile: %j", output);
  console.log("Level: %j; inSize: %j - outSize %j;", encoding, inScript.length, outScript.length);
});
