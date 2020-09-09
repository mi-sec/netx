# netx

netx is a collection of modules for network interactions

![CodeQL](https://github.com/mi-sec/netx/workflows/CodeQL/badge.svg)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

- [1.0 - getting started](#getting-started)

<hr/>

### [getting started](#top)

```
npm i netx
```

### Release

```
lerna clean
lerna exec -- rm -rf ./esm
lerna exec -- rm -rf ./node_models
lerna exec -- rm -rf ./.nyc_output
lerna exec -- rm -rf ./coverage
lerna exec -- rm -rf ./package-lock.json
lerna bootstrap
lerna run lint
lerna run test
lerna run build
# push any file changes
lerna publish
lerna publish --registry https://npm.pkg.github.com
```
