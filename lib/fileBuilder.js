const Stream = require('stream');
const Fs = require('fs');
const {promisify} = require('util');
const unlink = promisify(Fs.unlink);
const rename = promisify(Fs.rename);
const Builder = require('./builder');
const DataTransform = require('@voliware/node-data-transform');
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
     * @param {Boolean} [options.minify=true]
     * @param {Boolean} [options.gzip=false]
     * @param {Boolean} [options.logger=true]
     * @param {Object[]} options.modifiers
     * @returns {FileBuilder}
     */
    constructor(options = {}){
        super(options);
        this.modifiers = options.modifiers || {};
        this.writable = Fs.createWriteStream(this.output);
        this.options = {
            minify: options.minify || false,
            gzip: options.gzip || false
        };
        this.type = options.type || "js";
        this.minify = new MinifyTransform(this.type);
        this.transform = new DataTransform();
        this.createTransformModifiers(this.transform, this.modifiers);
        return this;
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
     * Create modifiers from a collection of configs.
     * @param {DataTransform} transform
     * @param {Object} configs 
     * @param {Object} configs.append
     * @param {Object} configs.prepend
     * @param {Object} configs.erase
     * @param {Object} configs.replace
     * @returns {FileBuilder}
     */
    createTransformModifiers(transform, configs){
        for(let k in configs){
            let modifiers = configs[k];
            for(let i = 0; i < modifiers.length; i++){
                let modifier = modifiers[i];
                switch(k){
                    case "append":
                        transform.append(modifier.match, modifier.contents);
                        break;
                    case "replace":
                        transform.replace(modifier.match, modifier.contents);
                        break;
                    case "prepend":
                        transform.prepend(modifier.match, modifier.contents);
                        break;
                    case "erase":
                        transform.erase(modifier.match);
                        break;
                    case "compare":
                        transform.compare(modifier.match);
                        break;
                }
            }
        }
        return this;
    }

    /**
     * Reset all modifiers
     * @returns {FileBuilder}
     */
    resetModifiers(){
        this.modifiers = {
            append: [],
            compare: [],
            erease: [],
            prepend: [],
            replace: []
        };
        return this;
    }

    /**
     * Add an append data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @param {Object} contents 
     * @param {Buffer} [contents.buffer] - a buffer of data
     * @param {String} [contents.file] - a readable file path
     * @param {String} [contents.string] - string data
     * @returns {FileBuilder}
     */
    append(match, contents){
        this.modifiers.append.push({match, contents});
        return this;
    }

    /**
     * Add a compare data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @returns {FileBuilder}
     */
    compare(match){
        this.modifiers.compare.push({match});
        return this;
    }

    /**
     * Add an erase data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @returns {FileBuilder}
     */
    erase(match){
        this.modifiers.erase.push({match});
        return this;
    }

    /**
     * Add a prepend data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @param {Object} contents 
     * @param {Buffer} [contents.buffer] - a buffer of data
     * @param {String} [contents.file] - a readable file path
     * @param {String} [contents.string] - string data
     * @returns {FileBuilder}
     */
    prepend(match, contents){
        this.modifiers.prepend.push({match, contents});
        return this;
    }

    /**
     * Add a replace data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @param {Object} contents 
     * @param {Buffer} [contents.buffer] - a buffer of data
     * @param {String} [contents.file] - a readable file path
     * @param {String} [contents.string] - string data
     * @returns {FileBuilder}
     */
    replace(match, contents){
        this.modifiers.replace.push({match, contents});
        return this;
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
     * @returns {FileBuilder}
     */
    build(){
        return new Promise(async (resolve, reject) => {

            // concatenate all files first
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

            // write to output file
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