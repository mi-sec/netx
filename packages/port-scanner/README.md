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

*`connectionOpts` is a direct pass in to
[`net.createConnection(<opts>)`](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener)

```
import PortScanner from '@mi-sec/port-scanner';

const scan = new PortScanner( {
	host: '192.168.1.0/24',
	ports: [ 22 ],
	timeout: 1000,           // optional
    debug: false,            // optional
    onlyReportOpen: true,    // optional
    bannerGrab: true,        // optional
    identifyService: true,   // optional
	attemptToIdentify: true, // optional
    connectionOpts: {}       // optional*
} );

const data   = [];
let progress = 0;

result
	.on( 'ready', async () => {
		await result.scan();
	} )
	.on( 'data', ( d ) => {
		data.push( d );
	} )
	.on( 'progress', ( d ) => {
		console.log( 'progress', d );
	} )
	.on( 'done', ( d ) => {
		console.log( d );
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
