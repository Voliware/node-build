const FileBuilder = require('./fileBuilder');
const MinifyTransform = require('@voliware/node-minify-transform');

/**
 * Builds HTML files.
 * HTML files must be concatted before minifying.
 * @extends {FileBuilder}
 */
class HtmlBuilder extends FileBuilder {
    
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
     * @returns {JsBuilder}
     */
    constructor(options){
        super(options);
        return this;
    }

    /**
     * Minify
     * @returns {MinifyTransform}
     */
    minify(){
        return new MinifyTransform("html");
    }
}

module.exports = HtmlBuilder;