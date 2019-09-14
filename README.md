# node-build
 JS and CSS minfier for @voliware/node-based projects. Uses `clean-css` and `uglify-es`. 

## Install
Install with node package manager
```js
npm install @voliware/node-build
```
Include in a file
```js
const NodeBuild = require('@voliware/node-build');
```

## Usage
`node-build` automatically detects JS vs CSS.
```js
const NodeBuild = require('@voliware/node-build');

new NodeBuild.Build({
   name: "Library",
   version: "1.2.3",
   input: ["./src/js/library.js", "./src/js/plugins.js"],
   output: "./dist/library.min.js"
}).run();
```

## Mulitple Config Example
Minify a JS/CSS library, which has a base file and optional plugin files, to produce multiple builds.

```js
const NodeBuild = require('@voliware/node-build');
const version = "1.0.3";

// library base
const jsBaseInput = './src/js/library.js';
const jsBaseOutput = './dist/library.min.js';
const jsBaseConfig = {
    name: "Library JS [base]",
    version: version,
    input: jsBaseInput,
    output: jsBaseOutput
};

// library bundle
const jsBundleInput = [
    './src/js/library.js',
    './src/js/plugin1.js',
    './src/js/plugin2.js'
];
const jsBundleOutput = './dist/library-bundle.min.js';
const jsBundleConfig = {
    name: "Library JS [bundle]",
    version: version,
    input: jsBundleInput,
    output: jsBundleOutput
};

// css
const cssInput = './src/css/library.css';
const cssOutput = './dist/library.min.css';
const cssConfig = {
    name: "Library CSS",
    version: version,
    input: cssInput,
    output: cssOutput
};

// build
let configs = [jsBaseConfig, jsBundleConfig, cssConfig];
new NodeBuild.Build(configs).run();
```
