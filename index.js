const Build = require('./lib/build');
const Builder = require('./lib/builder');
const FileBuilder = require('./lib/fileBuilder');
const FileCopier = require('./lib/fileCopier');
const FileMover = require('./lib/fileMover');
const Modifier = require('@voliware/node-data-transform').Modifier;

module.exports = {
    Build,
    Builder,
    FileBuilder,
    FileCopier,
    FileMover,
    Modifier
};