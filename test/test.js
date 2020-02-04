const Fs = require('fs');
const Path = require('path');
const Assert = require('assert');
const Builder = require('./../index');

const jsfile1 = "./test/js/in1.js";
const jsfile2 = "./test/js/in2.js";
const jsfileout = "./test/js/out.min.js";
const jsoutput = "async function bar(a){await foo(a)}class Foo{bar(){let a={a:1,b:{}};return a.b.a=1,a}}";
const jsconfig = {
    name: 'JS Test',
    version: '1.0.0',
    input: [jsfile1, jsfile2],
    output: jsfileout,
    minify: true,
    gzip: true,
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
    minify: true,
    gzip: true,
    logger: false
};

const htmlstart = Path.join(__dirname, "/html/start.html");
const htmlcontent = Path.join(__dirname, "/html/content.html");
const htmlend = Path.join(__dirname, "/html/end.html");
const htmlfileout = Path.join(__dirname, "/html/out.html");
const htmlfileappend = Path.join(__dirname, "/html/append.html");
const htmlfileprepend = Path.join(__dirname, "/html/prepend.html");
const htmloutput = `<!doctype html><html lang="en"><body><!-- templates --><div id="templates"></div></body><script src="app.min.js"></script><!-- scripts --><footer></footer>`;
const htmlconfig = {
    name: 'HTML Test',
    version: '1.0.0',
    input: [htmlstart, htmlcontent, htmlend],
    output: htmlfileout,
    minify: true,
    gzip: true,
    modifiers: {
        // replace matches with contents
        replace: [{match: 'div', contents: 'span'}],
        // append contents after match
        append: [{match: '<!-- templates -->', contents: htmlfileappend}],
        // erase all matches (spaces, new lines)
        erase: [
            {match: '<head></head>'}
        ],
        // prepend contents before match
        prepend: [{match: '<!-- scripts -->', contents: htmlfileprepend}],
    },
    logger: false
};

/**
 * Delete all test files
 */
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

it('minifies JS files', async () => {
    let builder = new Builder.JsBuilder(jsconfig);
    await builder.run();
    let result = Fs.readFileSync(jsfileout).toString();
    Assert.strictEqual(result, jsoutput);
});

// it('minifies CSS files', () => {
//     let builder = new Builder.CssBuilder(cssconfig);
//     builder.run();
//     let result = Fs.readFileSync(cssfileout).toString();
//     Assert.strictEqual(result, cssoutput);
// });

it('builds HTML files', async () => {
    let builder = new Builder.HtmlBuilder(htmlconfig);
    await builder.run();
    let result = Fs.readFileSync(htmlfileout).toString();
    Assert.strictEqual(result, htmloutput);
});

// it('minifies JS and CSS and builds HTML from a config', async () => { 
//     deleteFiles();
//     let configs = [jsconfig, cssconfig, htmlconfig];
//     let build = new Builder.Build(configs, false);
//     await build.run();

//     let jsresult = Fs.readFileSync(jsfileout).toString();
//     Assert.strictEqual(jsresult, jsoutput);
//     let cssresult = Fs.readFileSync(cssfileout).toString();
//     Assert.strictEqual(cssresult, cssoutput);
//     let result = Fs.readFileSync(htmlfileout).toString();
//     Assert.strictEqual(result, htmloutput);
// });