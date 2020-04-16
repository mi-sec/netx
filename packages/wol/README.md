# `@mi-sec/wol`

Wake-On-LAN utility

- Cross-platform - Support for:
    - CommonJS, ECMAScript Modules and UMD builds
    - Node >= 13.2.x (8, 10, 12 in progress)

[![npm version](https://img.shields.io/npm/v/@mi-sec/wol.svg)](https://www.npmjs.com/package/@mi-sec/wol)
[![Build Status](https://github.com/mi-sec/netx/workflows/CI/badge.svg)](https://github.com/mi-sec/netx/actions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

### Usage

```
import wakeOnLan from '@mi-sec/wol';

await wakeOnLan( '12:34:56:78:90:AB', {
    address: '255.255.255.255',
    packets: 3,
    interval: 100,
    port: 9
} );
```
