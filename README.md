# Welcome to ReactION!

ReactION is a react component visualizer for VS code!

[Please visit our primary repository](https://github.com/ReactION-js/ReactION)

## Development

This is a static landing page. The interactive component-tree demo in `src/` is bundled
with [webpack](https://webpack.js.org/) and rendered with [d3](https://d3js.org/).

Requirements: Node.js 18+.

```bash
npm install     # install dependencies
npm run dev     # start the dev server at http://localhost:8080
npm run build   # produce the production bundle at build/bundle.js
npm run watch   # rebuild the bundle on file changes
```

`build/bundle.js` is committed so the page can be served directly (e.g. GitHub Pages).
