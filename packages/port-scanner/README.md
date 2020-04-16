# `@mi-sec/port-scanner`

port scanner utility

- Cross-platform - Support for:
    - CommonJS, ECMAScript Modules and UMD builds
    - Node >= 13.2.x (8, 10, 12 in progress)

[![port-scanner unit test](https://github.com/mi-sec/netx/workflows/port-scanner%20unit%20test/badge.svg)](https://github.com/mi-sec/netx/actions?query=workflow:"port-scanner+unit+test")
[![port-scanner lint test](https://github.com/mi-sec/netx/workflows/port-scanner%20lint%20test/badge.svg)](https://github.com/mi-sec/netx/actions?query=workflow:"port-scanner+lint+test")

[![npm version](https://img.shields.io/npm/v/@mi-sec/port-scanner.svg)](https://www.npmjs.com/package/@mi-sec/port-scanner)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

### Usage

```
import scan from '@mi-sec/port-scanner';

await scan( {
    host: '127.0.0.1',
    port: [ 22 ],
    timeout: 500,
    onlyReportOpen: true,
    bannerGrab: true,
    attemptToIdentify: true
} );
```

Result:
```
[
  {
    host: '127.0.0.1',
    port: 22,
    status: 'open',
    banner: 'SSH-2.0-OpenSSH_7.9\r\n',
    time: 4.238488,
    service: 'ssh'
  }
]
```
