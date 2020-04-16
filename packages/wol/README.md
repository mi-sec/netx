# `@mi-sec/wol`

> Wake-On-LAN utility

[![npm version](https://img.shields.io/npm/v/@mi-sec/wol.svg)](https://www.npmjs.com/package/@mi-sec/wol)

## Usage

```
import wakeOnLan from '@mi-sec/wol';

await wakeOnLan( '12:34:56:78:90:AB', {
    address: '255.255.255.255',
    packets: 3,
    interval: 100,
    port: 9
} );
```
