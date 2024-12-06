await Bun.build({
    entrypoints: [/*'./index.ts', /*'./jsx-runtime.ts',*/ './jsx-dev-runtime.ts'],
    outdir: './dist',
    splitting: false,
    target: 'bun',
    format: 'esm',
    sourcemap: 'none',
    minify: {
        whitespaces: true,
        identifiers: true,
        syntax: true,
    },
    external: [],
    packages: 'bundle',
    // root: '.',
});
