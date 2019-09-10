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
        this.log(EOL);
    }

    /**
     * Log the current date and time
     */
    logDate(){
        this.log(`- ${(new Date()).toLocaleString()}`);
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
     * Run all configs
     * @return {Build}
     */
    run(){
        this.logVoliware();
        this.logDate();
        for(let i = 0; i < this.configs.length; i++){
            this.createBuilder(this.configs[i]).run();
            this.log(EOL);
        }
        return this;
    }
}

module.exports = Build;