#Minified JSX library for Bun.js

To use exports from package.json have to add itself as a dependency
```
	"dependencies": {
		"jsxlib": "github:woxxo/jsxlib"
	}
```

```
	"exports": {
		".": "./default/index.js",
		"./jsx": "./jsx/jsx-runtime.js",
		"./jsx-runtime": "./jsx/jsx-runtime.js",
		"./jsx-dev-runtime": "./jsx/jsx-runtime.js"
	}
```