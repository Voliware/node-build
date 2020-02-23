const EOL = require('os').EOL;
const CssBuilder = require('./cssBuilder');
const JsBuilder = require('./jsBuilder');
const FileBuilder = require('./fileBuilder');
const HtmlBuilder = require('./htmlBuilder');

/**
 * Build one or multiple configs.
 */
class Build {

    /**
     * Constructor
     * @param {Object|Object[]} configs 
     * @param {Boolean} [logger=true]
     * @returns {Build}
     */
    constructor(configs, logger = true){
        if(!Array.isArray(configs)){
            configs = [configs];
        }
        this.configs = configs;
        this.logger = logger;
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
     * Create the appropriate builder
     * based on the config output option.
     * @param {Object} config 
     */
    createBuilder(config){
        let reg = /(?:\.([^.]+))?$/;
        let ext = reg.exec(config.output)[1].toLowerCase();
        if(ext.toLowerCase() === "js"){
            return new JsBuilder(config);
        }
        else if(ext.toLowerCase() === "css"){
            return new CssBuilder(config);
        }
        else if(ext.toLowerCase() === "html"){
            return new HtmlBuilder(config);
        }
        else {
            return new FileBuilder(config);
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
            let builder = this.createBuilder(config);
            await builder.run();
            this.log(EOL);
        }
        this.recordEnd();
        this.logEnd();
        return this;
    }
}

module.exports = Build;