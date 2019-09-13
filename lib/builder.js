const Fs = require('fs');
const EOL = require('os').EOL;

/**
 * Base class to output file building information.
 */
class Builder {

    /**
     * Constructor
     * @param {object} options 
     * @param {string} options.name
     * @param {string} [options.version]
     * @param {string|string[]} options.input
     * @param {string} options.output
     * @param {boolean} [options.logger=true]
     * @return {Builder}
     */
    constructor(options){
        this.name = options.name;
        this.version = options.version || null;
        this.input = options.input;
        this.output = options.output;
        this.logger = typeof options.logger === "undefined" 
            ? true : options.logger;

        this.status = "OK";
        this.start = 0;
        this.end = 0;
        return this;
    }

    /**
     * Concat an array of files.
     * @param {string|string[]} files 
     * @return {string} 
     */
    concat(files){
        if(!Array.isArray(files)){
            files = [files];
        }
        let code = "";
        for(let i = 0; i < files.length; i++){
            code += Fs.readFileSync(files[i])
            if(!code){
                console.error("Failed to read file");
            }
        }
        return code;
    }

    /**
     * Format an array of file paths
     * into something that is printable.
     * @param {string|string[]} files 
     * @return {string}
     */
    formatFilePaths(files){
        if(!Array.isArray(files)){
            files = [files];
        }
        let text = "";
        for(let i = 0; i < files.length; i++){
            text += `  ${files[i]}`
            if(i + 1 !== files.length){
                text += "\n";
            }
        }
        return text;
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
     * Log the name, and if specified,
     * the version of the project.
     */
    logName(){
        let name = this.name;
        if(this.version){
            name += ` - V${this.version}`;
        }
        this.log(name);
    }

    /**
     * Log a line break
     */
    logLineBreak(){
        this.log(EOL);
    }

    /**
     * Log the input file names
     */
    logInput(){
        this.log('- INPUT');
        this.log(`${this.formatFilePaths(this.input)}`);
    }

    /**
     * Log the ouput file name
     */
    logOutput(){
        this.log('- OUTPUT');
        this.log(`  ${this.output}`);
    }

    /**
     * Log the build status
     */
    logStatus(){
        let time = new Date(this.end - this.start).toISOString().slice(11, -1);
        this.log('- STATUS');
        this.log(`  ${this.status} [${time}]`);
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
     * Concat, minify, and write the output file.
     */
    minify(){
        throw new Error("Must be implemented in child class");
    }

    /**
     * Run the minifying process
     */
    run(){
        this.recordStart();
        this.logName();
        this.logInput();
        this.logOutput();
        this.minify();
        this.recordEnd();
        this.logStatus();
    }
}

module.exports = Builder;