const Fs = require('fs');
const Assert = require('assert');
const Builder = require('./../index');

const jsfile1 = "./test/js/in1.js";
const jsfile2 = "./test/js/in2.js";
const jsfileout = "./test/js/out.min.js";
const jsoutput = "const a=1,b=2;";
const jsconfig = {
    name: 'JS Test',
    version: '1.0.0',
    input: [jsfile1, jsfile2],
    output: jsfileout,
    logger: false
};

const cssfile1 = "./test/css/in1.css";
const cssfile2 = "./test/css/in2.css";
const cssfileout = "./test/css/out.min.css";
const cssoutput = "html{color:red}body{color:#000}";
const cssconfig = {
    name: 'CSS Test',
    version: '1.0.0',
    input: [cssfile1, cssfile2],
    output: cssfileout,
    logger: false
};

const htmlfilebase = "./test/html/base.html"
const htmlfile1 = "./test/html/in1.html";
const htmlfile2 = "./test/html/in2.html";
const htmlfileout = "./test/html/out.html"
const htmloutput = '<!doctype html><html lang="en"><div id="inject_1"></div><div id="inject_2"></div></html>';
const htmlconfig = {
    name: 'HTML Test',
    version: '1.0.0',
    base: htmlfilebase,
    input: [
        {filepath: htmlfile1, tag: 'inject1'},
        {filepath: htmlfile2, tag: 'inject2'}
    ],
    output: htmlfileout,
    logger: false
};

function deleteFiles(){
    try {
        Fs.accessSync(jsfileout);
        Fs.unlinkSync(jsfileout);
        Fs.accessSync(cssfileout);
        Fs.unlinkSync(cssfileout);
        Fs.accessSync(htmlout);
        Fs.unlinkSync(htmlout);
    }
    catch(e){
        
    }
}

deleteFiles();

it('minifies JS files', () => {
    let builder = new Builder.JsBuilder(jsconfig);
    builder.run();
    let result = Fs.readFileSync(jsfileout).toString();
    Assert.strictEqual(result, jsoutput);
});

it('minifies CSS files', () => {
    let builder = new Builder.CssBuilder(cssconfig);
    builder.run();
    let result = Fs.readFileSync(cssfileout).toString();
    Assert.strictEqual(result, cssoutput);
});

it('injects HTML files', async () => {
    let builder = new Builder.HtmlBuilder(htmlconfig);
    await builder.run();
    let result = Fs.readFileSync(htmlfileout).toString();
    Assert.strictEqual(result, htmloutput);
});

it('minifies JS and CSS and injects HTML from a config', async () => { 
    deleteFiles();
    let configs = [jsconfig, cssconfig, htmlconfig];
    let build = new Builder.Build(configs, false);
    await build.run();

    let jsresult = Fs.readFileSync(jsfileout).toString();
    Assert.strictEqual(jsresult, jsoutput);
    let cssresult = Fs.readFileSync(cssfileout).toString();
    Assert.strictEqual(cssresult, cssoutput);
    let result = Fs.readFileSync(htmlfileout).toString();
    Assert.strictEqual(result, htmloutput);
});