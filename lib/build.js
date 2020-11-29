const EOL = require('os').EOL;
const Builder = require('./builder');
const FileBuilder = require('./fileBuilder');
const FileCopier = require('./fileCopier');
const FileMover = require('./fileMover');

/**
 * Build one or multiple configs.
 */
class Build {

    /**
     * Constructor
     * @param {Object|Object[]} configs 
     * @param {Object} [options={}]
     * @param {Boolean} [options.logger=true] - whether to print build logs
     * @param {Boolean} [options.logo=true] - whether to print the Voliware logo
     * @returns {Build}
     */
    constructor(configs, options = {}){
        if(!Array.isArray(configs)){
            configs = [configs];
        }
        this.configs = configs;
        this.logger = (typeof options.logger === "undefined") ? true : options.logger;
        this.logo = (typeof options.logo === "undefined") ? true : options.logo;
        this.start = 0;
        this.end = 0;
        return this;
    }

    /**
     * Log something to the console
     * if the logger option is true.
     * @param {String} text 
     */
    log(text){
        if(this.logger){
            console.log(text);
        }
    }

    /**
     * Log the VOLIWARE header
     */
    logVoliware(){
        if(this.logo){
            this.log(`${EOL}\\\\     \/\/ \/\/\/\/\/\/ \/\/     \/\/ \\\\           \/\/ \/\/\\ \\\\\\\\\\\\ \\\\\\\\\\\\\\${EOL} \\\\   \/\/ \/\/  \/\/ \/\/     \/\/   \\\\   \/\/\\   \/\/ \/\/ \\\\ \\\\  \\\\ \\\\___${EOL}  \\\\ \/\/ \/\/  \/\/ \/\/     \/\/     \\\\ \/\/ \\\\ \/\/ \/\/   \\\\ \\\\\\\\\\  \\\\${EOL}   \\\\\/ \/\/\/\/\/\/ \/\/\/\/\/\/ \/\/       \\\\\/   \\\\\/ \/\/     \\\\ \\\\  \\\\ \\\\\\\\\\\\`);
        }
    }

    /**
     * Log the start time of the build
     */
    logStart(){
        this.log(`Build started: ${(new Date()).toLocaleString()}`);
    }

    /**
     * Log the end time of the build
     */
    logEnd(){        
        let time = new Date(this.end - this.start).toISOString().slice(11, -1);
        this.log(`Build finished: ${(new Date()).toLocaleString()} [${time}]`);
    }

    /**
     * Create the appropriate builder based on the config output option.
     * @param {Object} config 
     */
    createBuilder(config){
        if(config.type === "copy"){
            return new FileCopier(config);
        }
        else if(config.type === "move"){
            return new FileMover(config);
        }
        // Get the file extension from the output file name if type is not
        // provided
        else if(!config.type){
            let reg = /(?:\.([^.]+))?$/;
            config.type = reg.exec(config.output)[1].toLowerCase();
        }
        return new FileBuilder(config);
    }

    /**
     * Set the start time of the build
     */
    recordStart(){
        this.start = Date.now();
    }

    /**
     * Set the end time of the build
     */
    recordEnd(){
        this.end = Date.now();
    }

    /**
     * Run all configs
     * @returns {Build}
     */
    async run(){
        this.recordStart();
        this.logVoliware();
        this.log(EOL);
        this.logStart();
        this.log(EOL);
        for(let i = 0; i < this.configs.length; i++){
            let config = this.configs[i];
            let builder = config instanceof Builder ? config : this.createBuilder(config);
            await builder.run();
            this.log(EOL);
        }
        this.recordEnd();
        this.logEnd();
        return this;
    }
}

module.exports = Build;