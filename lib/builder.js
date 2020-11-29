const EOL = require('os').EOL;
const Glob = require('glob');

/**
 * Base class to output building information.
 */
class Builder {

    /**
     * Constructor
     * @param {Object} options 
     * @param {String} options.name
     * @param {String} [options.version]
     * @param {String|String[]} options.input
     * @param {Boolean} [contents.glob_options] - Options for glob search when
     * passing glob type strings for inputs. 
     * @param {String} options.output
     * @param {Boolean} [options.minify=true]
     * @param {Boolean} [options.gzip=false]
     * @param {Boolean} [options.logger=true]
     */
    constructor(options){
        this.name = options.name;
        this.version = options.version || null;
        this.input = (typeof options.input === "string") ? [options.input] : options.input;
        this.glob_options = options.glob_options || {};
        this.output = options.output;
        this.logger = (options.logger === false) ? false : true;
        this.status = "OK";
        this.start = 0;
        this.end = 0;
                
        // Convert any globs into input files, such as "*.js"
        let new_input = [];
        for(let i = 0; i < this.input.length; i++){
            let input = this.input[i];
            // If the input was passed as a input path, such as 
            // path/to/files or path/to/files/, add a final slash if 
            // necessary and a *.*. IE /path/to/files/*.*
            try {
                const dir = Fs.opendirSync(input);
                if(input[input.length - 1] !== "/"){
                    input += "/";
                }
                input += "*.*";
                dir.closeSync()
            }
            catch(error){
                // Not a dir
            }

            // If glob fails to find any files, then "result" = input
            let result = Glob.sync(input, this.glob_options);
            for(let i = 0; i < result.length; i++){
                new_input.push(result[i]);
            }
        }

        this.input = new_input;
    }

    /**
     * Format an array of file paths into something that is printable.
     * @param {String|String[]} files 
     * @returns {String}
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

    /**************************************************************************
     * Logging
     *************************************************************************/

    /**
     * Log something to the console if the logger option is true.
     * @param {String} text 
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

    /**************************************************************************
     * Recording
     *************************************************************************/

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
     * Build the file
     */
    build(){
        throw new Error("Must be implemented in child class");
    }

    /**
     * Run the build process
     */
    async run(){
        this.recordStart();
        this.logName();
        this.logInput();
        this.logOutput();
        await this.build();
        this.recordEnd();
        this.logStatus();
    }
}

module.exports = Builder;