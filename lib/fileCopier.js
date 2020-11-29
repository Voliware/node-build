const Fs = require('fs');
const Path = require('path');
const {COPYFILE_EXCL} = Fs.constants;
const Builder = require('./builder');

/**
 * Copies files from the input to the output location
 * @extends {Builder}
 */
class FileCopier extends Builder {

    /**
     * Constructor
     * @param {Object} options 
     * @param {Boolean} [options.replace=false] - Whether to replace files in 
     * the output destination
     */
    constructor(options={}){
        super(options);
        this.replace = typeof options.replace !== "undefined" 
            ? options.replace : true;
    }

    /**
     * Copy all input files to the output location
     */
    build(){
        return new Promise(async (resolve, reject) => {
            for(let i = 0; i < this.input.length; i++){
                let file = this.input[i];
                let filename = Path.basename(file);
                let destination = `${this.output}/${filename}`
                let mode = this.replace ? 0 : COPYFILE_EXCL;
                try{
                    Fs.copyFileSync(file, destination, mode);
                }
                catch(error){
                    console.error(error);
                    reject(error);
                }
            }
            resolve();
        });
    }
}

module.exports = FileCopier;