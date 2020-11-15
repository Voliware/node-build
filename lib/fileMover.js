const Fs = require('fs');
const Path = require('path');
const Builder = require('./builder');

/**
 * Moves files from the input to the output location
 * @extends {Builder}
 */
class FileMover extends Builder {

    /**
     * Constructor
     * @param {Object} options 
     */
    constructor(options={}){
        super(options);
    }

    /**
     * Copy all input files to the output location
     */
    build(){
        return new Promise(async (resolve, reject) => {
            for(let i = 0; i < this.input.length; i++){
                let file = this.input[i];
                let filename = Path.basename(file);
                let destination = Path.join(this.output, filename);
                try {
                    Fs.unlinkSync(destination);
                }
                catch(error){
                    // File didn't exist.
                }
                try{
                    Fs.renameSync(file, destination);
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

module.exports = FileMover;