# `@mi-sec/ip`

IP Address utility for parsing and validating IP Addresses

- Cross-platform - Support for:
    - CommonJS, ECMAScript Modules and UMD builds
    - Node >= 10, 12, 14

[![npm version](https://img.shields.io/npm/v/@mi-sec/ip.svg)](https://www.npmjs.com/package/@mi-sec/ip)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

### Usage

```
import ip from '@mi-sec/ip';

ip.validIPv4( '192.168.1.1' ) -> true
ip.longToIp( 3232235777 ) -> 192.168.1.1
ip.ipToLong( '192.168.1.1' ) -> 3232235777
```
