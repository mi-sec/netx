# `@mi-sec/mac-address`

> MAC Address utility

[![npm version](https://img.shields.io/npm/v/@mi-sec/mac-address.svg)](https://www.npmjs.com/package/@mi-sec/mac-address)

## Usage

```
import macAddress from '@mi-sec/mac-address';

macAddress( '12:34:56:78:90:AB' ) -> <Buffer 12 34 56 78 90 ab>
macAddress( '12-34-56-78-90-AB' ) -> <Buffer 12 34 56 78 90 ab>
macAddress( '1234567890AB' ) -> <Buffer 12 34 56 78 90 ab>
macAddress( 0x1234567890AB ) -> <Buffer 12 34 56 78 90 ab>
macAddress( 20015998341291 ) -> <Buffer 12 34 56 78 90 ab>


import { isValidMACAddress } from '@mi-sec/mac-address';

isValidMACAddress( '1234567890ZZ' ) -> false
```
