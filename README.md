# js-packer

This is a simple port of [/packer/](http://dean.edwards.name/packer/) by Dean Edwards to node.js.

## Installation

If you use [npm](https://github.com/isaacs/npm):

    npm i js-packer


## Usage


    $ js-packer -h
    Usage: js-packer [options] <InputFile ...> <OutputFile ...>
    
    Options:
      -V, --version       output the version number
      -e, --encoding <n>  Encoding Level 10-95 default 62; more than 62 will appear unconventional characters
      -f, --fast          fast decode
      -s, --special       special characters
      -h, --help          output usage information