const EOL = require('os').EOL;
const CssBuilder = require('./cssBuilder');
const JsBuilder = require('./jsBuilder');

/**
 * Build one or multiple configs.
 */
class Build {

    /**
     * Constructor
     * @param {object|object[]} configs 
     * @param {boolean} [log=true]
     * @return {Build}
     */
    constructor(configs, logger = true){
        if(!Array.isArray(configs)){
            configs = [configs];
        }
        this.configs = configs;
        this.logger = logger === "undefined" ? true : logger;
        this.start = 0;
        this.end = 0;
        return this;
    }

    /**
     * Log something to the console
     * if the logger option is true.
     * @param {string} text 
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
        this.log(`${EOL}\\\\     \/\/ \/\/\/\/\/\/ \/\/     \/\/ \\\\           \/\/ \/\/\\ \\\\\\\\\\\\ \\\\\\\\\\\\\\${EOL} \\\\   \/\/ \/\/  \/\/ \/\/     \/\/   \\\\   \/\/\\   \/\/ \/\/ \\\\ \\\\  \\\\ \\\\___${EOL}  \\\\ \/\/ \/\/  \/\/ \/\/     \/\/     \\\\ \/\/ \\\\ \/\/ \/\/   \\\\ \\\\\\\\\\  \\\\${EOL}   \\\\\/ \/\/\/\/\/\/ \/\/\/\/\/\/ \/\/       \\\\\/   \\\\\/ \/\/     \\\\ \\\\  \\\\ \\\\\\\\\\\\`);
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
     * Create the appropriate builder (CSS or JS)
     * based on the config output option.
     * @param {object} config 
     */
    createBuilder(config){
        let reg = /(?:\.([^.]+))?$/;
        let ext = reg.exec(config.output)[1];
        if(ext.toLowerCase() === "js"){
            return new JsBuilder(config);
        }
        else {
            return new CssBuilder(config);
        }
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
     * @return {Build}
     */
    run(){
        this.recordStart();
        this.logVoliware();
        this.log(EOL);
        this.logStart();
        this.log(EOL);
        for(let i = 0; i < this.configs.length; i++){
            this.createBuilder(this.configs[i]).run();
            this.log(EOL);
        }
        this.recordEnd();
        this.logEnd();
        return this;
    }
}

module.exports = Build;