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
        return this;
    }

    minify(){
        throw new Error("Must be implemented in child class");
    }

    gzip(){

    }

    transform(){

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
     * Create modifiers from a collection
     * of configs.
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
        this.modifiers = {};
        return this;
    }

    /**
     * Add an append data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @param {Buffer|String} contents - a buffer or a file path to add to the stream
     * @returns {FileBuilder}
     */
    append(match, contents){
        if(!Array.isArray(this.modifiers.append)){
            this.modifiers.append = [];
        }
        this.modifiers.append.push({match, contents});
        return this;
    }

    /**
     * Add a compare data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @returns {FileBuilder}
     */
    compare(match){
        if(!Array.isArray(this.modifiers.compare)){
            this.modifiers.compare = [];
        }
        this.modifiers.compare.push({match});
        return this;
    }

    /**
     * Add an erase data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @returns {FileBuilder}
     */
    erase(match){
        if(!Array.isArray(this.modifiers.erase)){
            this.modifiers.erase = [];
        }
        this.modifiers.erase.push({match});
        return this;
    }

    /**
     * Add a prepend data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @param {Buffer|String} contents - a buffer or a file path to add to the stream
     * @returns {FileBuilder}
     */
    prepend(match, contents){
        if(!Array.isArray(this.modifiers.prepend)){
            this.modifiers.prepend = [];
        }
        this.modifiers.prepend.push({match, contents});
        return this;
    }

    /**
     * Add a replace data modifier
     * @param {Buffer|String} match - a buffer or string to match with
     * @param {Buffer|String} contents - a buffer or a file path to add to the stream
     * @returns {FileBuilder}
     */
    replace(match, contents){
        if(!Array.isArray(this.modifiers.replace)){
            this.modifiers.replace = [];
        }
        this.modifiers.replace.push({match, contents});
        return this;
    }

    /**
     * Pipe a readable stream through a
     * transform and to a writable stream.
     * Created so it can return a Promise.
     * @param {Stream} readable 
     * @param {Transform} transform 
     * @param {Stream} writable 
     * @returns {Promise}
     */
    pipe(readable, transform, writable){
        return new Promise((resolve, reject) => {
            readable = readable.pipe(transform);
            if(this.options.minify){
                readable = readable.pipe(this.minify());
            }
            if(this.options.gzip){
                // readable = readable.pipe(this.gzip());
            }
            readable.pipe(writable, {end:false})
                .on('unpipe', () => {
                    resolve();
                })
                .on('error', (error) => {
                    console.error(error)
                    reject(error);
                });
        });
    }

    /**
     * Build the file
     */
    async build(){
        let inputs = Array.isArray(this.input) ? this.input : [this.input];
        for(let i = 0; i < inputs.length; i++){
            let input = inputs[i];
            let readable = Fs.createReadStream(input, {highWaterMark:1});
            let transform = new DataTransform();
            this.createTransformModifiers(transform, this.modifiers);
            await this.pipe(readable, transform, this.writable);
        }
        this.writable.end();
        return this;
    }
}

module.exports = FileBuilder;