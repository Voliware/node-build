const Fs = require('fs');
const Path = require('path');
const Assert = require('assert');
const {Build, FileCopier, FileMover, Modifier} = require('./../index');

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

/******************************************************************************
 * JS
 *****************************************************************************/

const jsfile1 = "./test/js/in1.js";
const jsfile2 = "./test/js/in2.js";
const jsfileout = "./test/js/out.min.js";
const jsoutput = `async function bar(a){await foo(a)}class Foo{bar(){let a={a:1,b:{}};return a.b.a=1,a}}`;
const jsconfig = {
    name: 'JS Test',
    version: '1.0.0',
    logger: false,
    input: [jsfile1, jsfile2],
    output: jsfileout,
    minify: true,
    gzip: true
};

it('minifies JS files', async () => {
    let builder = new Build(jsconfig, {logger: false});
    await builder.run();
    let result = Fs.readFileSync(jsfileout).toString();
    Assert.strictEqual(result, jsoutput);
});

/******************************************************************************
 * CSS
 *****************************************************************************/

const cssfile1 = "./test/css/in1.css";
const cssfile2 = "./test/css/in2.css";
const cssfileout = "./test/css/out.min.css";
const cssoutput = "html{color:red}body{color:#000}";
const cssconfig = {
    name: 'CSS Test',
    version: '1.0.0',
    logger: false,
    input: [cssfile1, cssfile2],
    output: cssfileout,
    minify: true,
    gzip: true
};

it('minifies CSS files', async () => {
    let builder = new Build(cssconfig, {logger: false});
    await builder.run();
    let result = Fs.readFileSync(cssfileout).toString();
    Assert.strictEqual(result, cssoutput);
});

/******************************************************************************
 * HTML
 *****************************************************************************/

const htmlstart = Path.join(__dirname, "/html/start.html");
const htmlcontent = Path.join(__dirname, "/html/content.html");
const htmlend = Path.join(__dirname, "/html/end.html");
const htmlfileout = Path.join(__dirname, "/html/out.html");
const htmlfileappend = Path.join(__dirname, "/html/append.html");
const htmlfileprepend = Path.join(__dirname, "/html/prepend.html");
const htmloutput = `<!doctype html><html lang=en><div id=templates></div><footer></footer><script src=app.min.js></script>`;
const htmlconfig = {
    name: 'HTML Test',
    version: '1.0.0',
    logger: false,
    input: [htmlstart, htmlcontent, htmlend],
    output: htmlfileout,
    minify: true,
    gzip: true,
    modifiers: [
        new Modifier('replace', 'div', {string: 'span'}),
        new Modifier('append', '<!-- templates -->', {file: htmlfileappend}),
        new Modifier('erase', '<head></head>'),
        new Modifier('prepend', '<!-- scripts -->', {file: htmlfileprepend}),
    ]
};

it('builds HTML files', async () => {
    let builder = new Build(htmlconfig, {logger: false});
    await builder.run();
    let result = Fs.readFileSync(htmlfileout).toString();
    Assert.strictEqual(result, htmloutput);
});

/******************************************************************************
 * JS, CSS, HTML
 *****************************************************************************/

it('minifies JS and CSS and builds HTML from a config', async () => { 
    deleteFiles();
    let configs = [jsconfig, cssconfig, htmlconfig];
    let build = new Build(configs, {logger: false});
    await build.run();

    let jsresult = Fs.readFileSync(jsfileout).toString();
    Assert.strictEqual(jsresult, jsoutput);
    let cssresult = Fs.readFileSync(cssfileout).toString();
    Assert.strictEqual(cssresult, cssoutput);
    let result = Fs.readFileSync(htmlfileout).toString();
    Assert.strictEqual(result, htmloutput);
});

/******************************************************************************
 * Move file
 *****************************************************************************/

it('move a file', async () => {
    // Delete old test file
    try {
        Fs.unlinkSync('./test/moved/movefile1.txt');
    }
    catch(error){
        // No file
    }
    // Create a new file
    let input = Path.join(__dirname, 'movefile1.txt');
    Fs.writeFileSync(input, 'Some data');
    let output = Path.join(__dirname, './moved');
    let builder = new FileMover({input, output, logger: false});
    await builder.run();
    let newpath = Path.join(output, 'movefile1.txt');
    let result = Fs.readFileSync(newpath).toString();
    Assert.strictEqual(result, 'Some data');
});

/******************************************************************************
 * Move files
 *****************************************************************************/

it('moves files', async () => {
    // Delete old test files
    try {
        Fs.unlinkSync('./test/moved/movefile1.txt');
        Fs.unlinkSync('./test/moved/movefile2.txt');
        Fs.unlinkSync('./test/moved/movefile3.rtf');
        Fs.unlinkSync('./test/moved/movefile4.rtf');
    }
    catch(error){
        // No files
    }
    // Create a new files
    let input1 = Path.join(__dirname, 'movefile1.txt');
    let input2 = Path.join(__dirname, 'movefile2.txt');
    let input3 = Path.join(__dirname, 'movefile3.rtf');
    let input4 = Path.join(__dirname, 'movefile4.rtf');
    Fs.writeFileSync(input1, 'Some data');
    Fs.writeFileSync(input2, 'More data');
    Fs.writeFileSync(input3, 'abc');
    Fs.writeFileSync(input4, '123');
    let output = Path.join(__dirname, './moved');
    let rtf_files = Path.join(__dirname, "*.rtf");
    let builder = new FileMover({input: [input1, input2, rtf_files], output, logger: false});
    await builder.run();
    let newpath1 = Path.join(output, 'movefile1.txt');
    let newpath2 = Path.join(output, 'movefile2.txt');
    let newpath3 = Path.join(output, 'movefile3.rtf');
    let newpath4 = Path.join(output, 'movefile4.rtf');
    let result = Fs.readFileSync(newpath1).toString();
    result += Fs.readFileSync(newpath2).toString();
    result += Fs.readFileSync(newpath3).toString();
    result += Fs.readFileSync(newpath4).toString();
    Assert.strictEqual(result, 'Some dataMore dataabc123');
});

/******************************************************************************
 * Cyop file
 *****************************************************************************/

it('copy a file', async () => {
    // Delete old test file
    try {
        Fs.unlinkSync('./test/copied/copiedfile1.txt');
    }
    catch(error){
        // No file
    }
    // Create a new file
    let input = Path.join(__dirname, 'copiedfile1.txt');
    Fs.writeFileSync(input, 'Some data');
    let output = Path.join(__dirname, './copied');
    let builder = new FileCopier({input, output, logger: false});
    await builder.run();
    let newpath = Path.join(output, 'copiedfile1.txt');
    let result = Fs.readFileSync(newpath).toString();
    Assert.strictEqual(result, 'Some data');
    // Delete test file
    try {
        Fs.unlinkSync('./test/copiedfile1.txt');
    }
    catch(error){
        // No file
    }
});

/******************************************************************************
 * Copy files
 *****************************************************************************/

it('copy files', async () => {
    // Delete old test files
    try {
        Fs.unlinkSync('./test/copied/copiedfile1.txt');
        Fs.unlinkSync('./test/copied/copiedfile2.txt');
        Fs.unlinkSync('./test/copied/copiedfile3.rtf');
        Fs.unlinkSync('./test/copied/copiedfile4.rtf');
    }
    catch(error){
        // No file
    }
    // Create new files
    let input1 = Path.join(__dirname, 'copiedfile1.txt');
    let input2 = Path.join(__dirname, 'copiedfile2.txt');
    let input3 = Path.join(__dirname, 'copiedfile3.rtf');
    let input4 = Path.join(__dirname, 'copiedfile4.rtf');
    Fs.writeFileSync(input1, 'Some data');
    Fs.writeFileSync(input2, 'More data');
    Fs.writeFileSync(input3, 'abc');
    Fs.writeFileSync(input4, '123');
    let output = Path.join(__dirname, './copied');
    let rtf_files = Path.join(__dirname, "*.rtf");
    let builder = new FileCopier({input: [input1, input2, rtf_files], output, logger: false});
    await builder.run();
    let newpath1 = Path.join(output, 'copiedfile1.txt');
    let newpath2 = Path.join(output, 'copiedfile2.txt');
    let newpath3 = Path.join(output, 'copiedfile3.rtf');
    let newpath4 = Path.join(output, 'copiedfile4.rtf');
    let result = Fs.readFileSync(newpath1).toString();
    result += Fs.readFileSync(newpath2).toString();
    result += Fs.readFileSync(newpath3).toString();
    result += Fs.readFileSync(newpath4).toString();
    Assert.strictEqual(result, 'Some dataMore dataabc123');
    // Delete test files
    try {
        Fs.unlinkSync('./test/copiedfile1.txt');
        Fs.unlinkSync('./test/copiedfile2.txt');
        Fs.unlinkSync('./test/copiedfile3.rtf');
        Fs.unlinkSync('./test/copiedfile4.rtf');
    }
    catch(error){
        // No file
    }
});