const Fs = require('fs');
const CleanCSS = require('clean-css');
const Builder = require('./builder');

/**
 * Builds CSS files.
 * @extends {Builder}
 */
class CssBuilder extends Builder {

    /**
     * Constructor
     * @param {object} options 
     * @param {string} options.name
     * @param {string} [options.version]
     * @param {string|string[]} options.input
     * @param {string} options.output
     * @return {CssBuilder}
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
        let result = new CleanCSS().minify(input);
        Fs.writeFileSync(this.output, result.styles);
    }
}

module.exports = CssBuilder;