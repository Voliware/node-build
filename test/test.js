const Fs = require('fs');
const Assert = require('assert');
const Builder = require('./../index');

const jsfile1 = "./test/in1.js";
const jsfile2 = "./test/in2.js";
const jsfileout = "./test/out.min.js";

const cssfile1 = "./test/in1.css";
const cssfile2 = "./test/in2.css";
const cssfileout = "./test/out.min.css";

function deleteFiles(){
    try {
        Fs.accessSync(jsfileout);
        Fs.unlinkSync(jsfileout);
        Fs.accessSync(cssfileout);
        Fs.unlinkSync(cssfileout);
    }
    catch(e){
        
    }
}

deleteFiles();

it('minifies JS files', () => {
    let builder = new Builder.JsBuilder({
        name: 'JS Test',
        version: '1.0.0',
        input: [jsfile1, jsfile2],
        output: jsfileout,
        logger: false
    });
    builder.run();
    let result = Fs.readFileSync(jsfileout).toString();
    Assert.strictEqual(result, "const a=1,b=2;");
});

it('minifies CSS files', () => {
    let builder = new Builder.CssBuilder({
        name: 'CSS Test',
        version: '1.0.0',
        input: [cssfile1, cssfile2],
        output: cssfileout,
        logger: false
    });
    builder.run();
    let result = Fs.readFileSync(cssfileout).toString();
    Assert.strictEqual(result, "html{color:red}body{color:#000}");
});

it('minifies JS and CSS files from a config', () => { 
    deleteFiles();
    let jsconfig = {
        name: 'JS Test',
        version: '1.0.0',
        input: [jsfile1, jsfile2],
        output: jsfileout,
        logger: false
    };
    let cssconfig = {
        name: 'CSS Test',
        version: '1.0.0',
        input: [cssfile1, cssfile2],
        output: cssfileout,
        logger: false
    };
    let configs = [jsconfig, cssconfig];
    let build = new Builder.Build(configs, false);
    build.run();

    let jsresult = Fs.readFileSync(jsfileout).toString();
    Assert.strictEqual(jsresult, "const a=1,b=2;");
    let cssresult = Fs.readFileSync(cssfileout).toString();
    Assert.strictEqual(cssresult, "html{color:red}body{color:#000}");
});