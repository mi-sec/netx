# `@mi-sec/mac-address`

MAC Address utility for parsing and validating MAC Addresses

- Cross-platform - Support for:
    - CommonJS, ECMAScript Modules and UMD builds
    - Node 8, 10, 12

[![npm version](https://img.shields.io/npm/v/@mi-sec/mac-address.svg)](https://www.npmjs.com/package/@mi-sec/mac-address)
[![Build Status](https://github.com/mi-sec/netx/workflows/CI/badge.svg)](https://github.com/mi-sec/netx/actions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

### Usage

```
import macAddress from '@mi-sec/mac-address';

macAddress( '12:34:56:78:90:AB' ) -> <Buffer 12 34 56 78 90 ab>
macAddress( '12-34-56-78-90-AB' ) -> <Buffer 12 34 56 78 90 ab>
macAddress( '1234567890AB' ) -> <Buffer 12 34 56 78 90 ab>
macAddress( 0x1234567890AB ) -> <Buffer 12 34 56 78 90 ab>
macAddress( 20015998341291 ) -> <Buffer 12 34 56 78 90 ab>

import { isValidMACAddress } from '@mi-sec/mac-address';

isValidMACAddress( '12:34:56:78:90:AB' ) -> true
isValidMACAddress( '1234567890ZZ' ) -> false
```
