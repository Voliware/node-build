const FileBuilder = require('./fileBuilder');
const MinifyTransform = require('@voliware/node-minify-transform');

/**
 * Builds CSS files.
 * @extends {FileBuilder}
 */
class CssBuilder extends FileBuilder {

    /**
     * Constructor
     * @param {Object} options 
     * @param {String} options.name
     * @param {String} [options.version]
     * @param {String|String[]} options.input
     * @param {String} options.output
     * @param {Boolean} [options.minify=true]
     * @param {Boolean} [options.gzip=false]
     * @param {Boolean} [options.logger=true]
     * @returns {CssBuilder}
     */
    constructor(options){
        super(options);
        return this;
    }

    /**
     * Minify the file
     * @returns {MinifyTransform}
     */
    minify(){
        return new MinifyTransform("css");
    }
}

module.exports = CssBuilder;