const Fs = require('fs');
const Uglify = require('uglify-es');
const Builder = require('./builder');

/**
 * Builds JS files.
 * @extends {Builder}
 */
class JsBuilder extends Builder {

    /**
     * Constructor
     * @param {object} options 
     * @param {string} options.name
     * @param {string} [options.version]
     * @param {string|string[]} options.input
     * @param {string} options.output
     * @return {JsBuilder}
     */
    constructor(options){
        super(options);
        return this;
    }

    /**
     * Concat, minify, and write the output file.
     */
    minify(){
        let input = this.concat(this.input);
        let result = Uglify.minify(input.toString());
        Fs.writeFileSync(this.output, result.code);
    }
}

module.exports = JsBuilder;