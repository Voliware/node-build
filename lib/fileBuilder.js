const Stream = require('stream');
const Fs = require('fs');
const {promisify} = require('util');
const unlink = promisify(Fs.unlink);
const rename = promisify(Fs.rename);
const Builder = require('./builder');
const DataTransform = require('@voliware/node-data-transform').DataTransform;
const MinifyTransform = require('@voliware/node-minify-transform');

/**
 * Builds files.
 * @extends {Builder}
 */
class FileBuilder extends Builder {

    /**
     * Constructor
     * @param {Object} options 
     * @param {String} options.name
     * @param {String} [options.version]
     * @param {String|String[]} options.input
     * @param {String} options.output
     * @param {Boolean} [options.empty=false]
     * @param {Boolean} [options.minify=true]
     * @param {Boolean} [options.gzip=false]
     * @param {Boolean} [options.logger=true]
     * @param {Object[]} options.modifiers
     */
    constructor(options = {}){
        super(options);
        this.modifiers = options.modifiers || [];
        this.writable = Fs.createWriteStream(this.output);
        this.options = {
            minify: options.minify || false,
            gzip: options.gzip || false
        };
        this.type = options.type || "js";
        this.minify = new MinifyTransform(this.type);
        this.transform = new DataTransform({modifiers: this.modifiers});
    }

    gzip(){

    }

    /**
     * Replace one file with another.
     * This simply deletes old_file and
     * renames new_file to old_file.
     * @param {String} old_file 
     * @param {String} new_file 
     * @returns {Promise} 
     */
    async replaceFile(old_file, new_file){
        await unlink(old_file)
        await rename(new_file, old_file)
    }

    /**
     * Add an append data modifier
     * @param {Buffer|String} match - Buffer or string to match with
     * @param {Object|Object[]} contents 
     * @param {Buffer} [contents.buffer] - Buffer of data
     * @param {String} [contents.file] - Readable file path
     * @param {String} [contents.string] - String data
     */
    append(match, contents){
        this.modifiers.push({action: 'append', match, contents});
    }

    /**
     * Add a compare data modifier
     * @param {Buffer|String} match - Buffer or string to match with
     */
    compare(match){
        this.modifiers.push({action: 'compare', match});
    }

    /**
     * Add an erase data modifier
     * @param {Buffer|String} match - Buffer or string to match with
     */
    erase(match){
        this.modifiers.push({action: 'erase', match});
    }

    /**
     * Add a prepend data modifier
     * @param {Buffer|String} match - Buffer or string to match with
     * @param {Object|Object[]} contents 
     * @param {Buffer} [contents.buffer] - Buffer of data
     * @param {String} [contents.file] - Readable file path
     * @param {String} [contents.string] - String data
     */
    prepend(match, contents){
        this.modifiers.push({action: 'prepend', match, contents});
    }

    /**
     * Add a replace data modifier
     * @param {Buffer|String} match - Buffer or string to match with
     * @param {Object|Object[]} contents 
     * @param {Buffer} [contents.buffer] - Buffer of data
     * @param {String} [contents.file] - Readable file path
     * @param {String} [contents.string] - String data
     */
    replace(match, contents){
        this.modifiers.push({action: 'replace', match, contents});
    }

    /**
     * Pipe a readable stream to a writable stream.
     * End is set to false.
     * Promise is resolved on unpipe.
     * @param {Stream} readable 
     * @param {Transform} transform 
     * @param {Stream} writable 
     * @returns {Promise}
     */
    pipe(readable, writable){
        return new Promise((resolve, reject) => {
            readable = readable.pipe(writable, {end: false})
            readable.setMaxListeners(1000);
            readable
                .on('unpipe', () => {
                    resolve(readable);
                })
                .on('error', (error) => {
                    console.error(error)
                    reject(error);
                });
        });
    }

    /**
     * Build the file
     * @returns {Promise}
     */
    build(){
        return new Promise(async (resolve, reject) => {

            // Concatenate all files first
            let concat = new DataTransform();
            for(let i = 0; i < this.input.length; i++){
                let readable = Fs.createReadStream(this.input[i]);
                let res = await this.pipe(readable, concat);
                if(i === this.input.length - 1){
                    res.end();
                }
            }

            // pipe data  transform
            let res = concat.pipe(this.transform)

            // minify
            if(this.options.minify){
                res = res.pipe(this.minify)
            }

            // gzip
            if(this.options.gzip){
                //res = res.pipe(this.gzip());
            }

            // Write to output file
            res.pipe(this.writable)
                .on('finish', () => {
                    resolve();
                })
                .on('error', (error) => {
                    console.error(error)
                    reject(error);
                });
        });
    }
}

module.exports = FileBuilder;