const cli = require('./cli');
const main = require('./main');

cli.readUrlFromArgs(main.run);
