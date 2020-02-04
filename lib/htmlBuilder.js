const Fs = require('fs');
// const HtmlMinifyStream = require('html-minify-stream');
const FileBuilder = require('./fileBuilder');

/**
 * Builds HTML files.
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
     * @returns {Promise}
     */
    minify(){
        // return HtmlMinifyStream({
        //     collapseWhitespace: true,
        //     removeOptionalTags: true
        // });
        // let temp_file = `${this.output}.tmp`;
        // return new Promise((resolve, reject) => {
        //     let readable = Fs.createReadStream(this.output);
        //     let writable = Fs.createWriteStream(temp_file);
        //     readable.pipe(HtmlMinifyStream({
        //         collapseWhitespace: true,
        //         removeOptionalTags: true
        //       }))
        //         .pipe(writable)
        //         .on('finish', async () => {
        //             await this.replaceFile(this.output, temp_file);
        //             resolve();
        //         })
        //         .on('error', () => {
        //             reject();
        //         });
        // })
    }

    /**
     * Build the file
     */
    async build(){
        await super.build();
        await this.minify();
        return this;
    }
}

module.exports = HtmlBuilder;