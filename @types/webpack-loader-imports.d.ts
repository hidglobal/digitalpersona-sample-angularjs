// Webpack uses a tecnhique when you can import any other resource (e.g. HTML or CSS file)
// and let a specific Webpack loader to handle the import during the bundling.
// But naive `import template from "./template.html"` will produce an error because
// `template.html` is not a valid module (it has no imports/exports, only text content).
// By default, Typescript allows to import only Typescript and Javascript modules.
//
// To resolve this we use wildcard module declarations below for all imports handled
// by Webpack loaders. This ambient definition file must be added to the `typeRoots`
// in the `tsconfig.json` file.
//
// If you add any additional loader into Webpack configuration,
// consider adding the declaration here to make Typescript and VSCode happy.

declare module '*.html' {
    const content: string;
    export default content;
}

declare module '*.scss' {
    const content: string;
    export default content;
}
declare module '*.css' {
    const content: string;
    export default content;
}
declare module '*.jpg' {
    const content: string;
    export default content;
}
declare module '*.png' {
    const content: string;
    export default content;
}

