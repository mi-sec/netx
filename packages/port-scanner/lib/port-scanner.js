/** ****************************************************************************************************
 * File: port-scanner.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	{ createConnection } = require( 'net' ),
	{ EventEmitter }     = require( 'events' ),
	LightMap             = require( '@mi-sec/lightmap' ),
	NetworkCidr          = require( '@mi-sec/network-cidr' );

const commonPorts = new LightMap( [
	[ 7, 'echo' ],
	[ 9, 'discard' ],
	[ 13, 'daytime' ],
	[ 21, 'ftp' ],
	[ 22, 'ssh' ],
	[ 23, 'telnet' ],
	[ 25, 'smtp' ],
	[ 26, 'rsftp' ],
	[ 37, 'time' ],
	[ 53, 'domain' ],
	[ 79, 'finger' ],
	[ 80, 'http' ],
	[ 81, 'hosts2-ns' ],
	[ 88, 'kerberos-sec' ],
	[ 106, 'pop3pw' ],
	[ 110, 'pop3' ],
	[ 111, 'rpcbind' ],
	[ 113, 'ident' ],
	[ 119, 'nntp' ],
	[ 135, 'msrpc' ],
	[ 139, 'netbios-ssn' ],
	[ 143, 'imap' ],
	[ 144, 'news' ],
	[ 179, 'bgp' ],
	[ 199, 'smux' ],
	[ 389, 'ldap' ],
	[ 427, 'svrloc' ],
	[ 443, 'https' ],
	[ 444, 'snpp' ],
	[ 445, 'microsoft-ds' ],
	[ 465, 'smtps' ],
	[ 513, 'login' ],
	[ 514, 'shell' ],
	[ 515, 'printer' ],
	[ 543, 'klogin' ],
	[ 544, 'kshell' ],
	[ 548, 'afp' ],
	[ 554, 'rtsp' ],
	[ 587, 'submission' ],
	[ 631, 'ipp' ],
	[ 646, 'ldp' ],
	[ 873, 'rsync' ],
	[ 990, 'ftps' ],
	[ 993, 'imaps' ],
	[ 995, 'pop3s' ],
	[ 1025, 'NFS-or-IIS' ],
	[ 1026, 'LSA-or-nterm' ],
	[ 1027, 'IIS' ],
	[ 1028, 'unknown' ],
	[ 1029, 'ms-lsa' ],
	[ 1110, 'nfsd-status' ],
	[ 1433, 'ms-sql-s' ],
	[ 1720, 'h323q931' ],
	[ 1723, 'pptp' ],
	[ 1755, 'wms' ],
	[ 1900, 'upnp' ],
	[ 2000, 'cisco-sccp' ],
	[ 2001, 'dc' ],
	[ 2049, 'nfs' ],
	[ 2121, 'ccproxy-ftp' ],
	[ 2717, 'pn-requester' ],
	[ 3000, 'ppp' ],
	[ 3128, 'squid-http' ],
	[ 3306, 'mysql' ],
	[ 3389, 'ms-wbt-server' ],
	[ 3986, 'unknown' ],
	[ 4899, 'radmin' ],
	[ 5000, 'upnp' ],
	[ 5009, 'airport-admin' ],
	[ 5051, 'ida-agent' ],
	[ 5060, 'sip' ],
	[ 5101, 'admdog' ],
	[ 5190, 'aol' ],
	[ 5357, 'wsdapi' ],
	[ 5432, 'postgresql' ],
	[ 5631, 'unknown' ],
	[ 5666, 'nrpe' ],
	[ 5800, 'vnc-http' ],
	[ 5900, 'vnc' ],
	[ 6000, 'X11' ],
	[ 6001, 'X11:1' ],
	[ 6646, 'unknown' ],
	[ 7070, 'realserver' ],
	[ 8000, 'http-alt' ],
	[ 8008, 'http' ],
	[ 8009, 'ajp13' ],
	[ 8080, 'http-proxy' ],
	[ 8081, 'blackice-icecap' ],
	[ 8443, 'https-alt' ],
	[ 8888, 'unknown' ],
	[ 9100, 'jetdirect' ],
	[ 9999, 'abyss' ],
	[ 10000, 'unknown' ],
	[ 32768, 'filenet-tms' ],
	[ 49152, 'unknown' ],
	[ 49153, 'unknown' ],
	[ 49154, 'unknown' ],
	[ 49155, 'unknown' ],
	[ 49156, 'unknown' ],
	[ 49157, 'unknown' ]
] );

function convertHighResolutionTime( t ) {
	return ( ( t[ 0 ] * 1e9 ) + t[ 1 ] ) / 1e6;
}

/**
 * connect
 * @description
 * make a socket connection to a single host/port
 * @param {string} host - ip address
 * @param {number} port - port to connect to
 * @param {object} opts - socket options
 * @param {number} [opts.timeout=1000] - socket timeout
 * @param {object} [opts.connectionOpts={}] - connection options
 *     [ref](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener)
 *
 * @return {Promise<object|null>}
 * information about connection, null if the host is not open
 * @example
 * await connect( '192.168.1.30', 22, {} );
 *
 * {
 * 	host: '192.168.1.30',
 * 	port: 22,
 * 	status: 'open',
 * 	banner: 'SSH-2.0-OpenSSH_7.9\r\n',
 * 	time: 23.081522,
 * 	service: 'ssh'
 * }
 */
function connect( host, port, opts = {} ) {
	!opts.debug || console.log( `scanning ${ host }:${ port }` );

	return new Promise(
		( res, rej ) => {
			opts.timeout             = opts.timeout || 1000;
			opts.connectionOpts      = opts.connectionOpts || {};
			opts.connectionOpts.host = host;
			opts.connectionOpts.port = port;

			let
				banner            = '',
				status            = null,
				error             = null,
				connectionRefused = false,
				time              = process.hrtime();

			// TODO:::
			// ~~port~~
			// ~~host~~
			// localAddress
			// localPort
			// family
			// hints
			// lookup
			const socket = createConnection( opts.connectionOpts );

			socket.on( 'connect', () => {
				const end = process.hrtime( time );
				time      = convertHighResolutionTime( end );

				!opts.debug || console.log( `${ host }:${ port } connected in ${ time }ms` );

				status = 'open';
				socket.end();
			} );

			socket.on( 'data', ( data ) => {
				if ( opts.bannerGrab ) {
					banner = data.toString();
				}

				socket.end();
			} );

			socket.setTimeout( opts.timeout );
			socket.on( 'timeout', () => {
				!opts.debug || console.log( `${ host }:${ port } timeout` );
				socket.destroy();
			} );

			socket.on( 'error', ( e ) => {
				!opts.debug || console.log( `${ host }:${ port } error` );

				if ( !status ) {
					status = 'closed';
				}

				if ( e.code !== 'ECONNREFUSED' ) {
					error = e;
				}
				else {
					connectionRefused = true;
				}
			} );

			socket.on( 'close', ( e ) => {
				if ( !status && opts.onlyReportOpen ) {
					return res();
				}

				const data = {
					host,
					port,
					status
				};

				if ( status === 'open' ) {
					data.banner = banner;
					data.time   = time;

					if ( opts.attemptToIdentify ) {
						data.service = commonPorts.get( port ) || 'unknown';
					}
				}

				error = e && !connectionRefused ? error || e : null;

				if ( error ) {
					!opts.debug || console.log( `${ host }:${ port } error` );

					data.error = error;
					rej( data );
				}
				else {
					res( data );
				}
			} );
		}
	);
}

class PortScanner extends EventEmitter
{
	constructor( opts = {} )
	{
		super();

		this.opts = opts;

		this.opts.cidr  = new NetworkCidr( this.opts.host || '127.0.0.1' );
		this.opts.ports = this.opts.ports ?
			Array.isArray( this.opts.ports ) ? this.opts.ports : [ this.opts.ports ] :
			[ ...commonPorts.keys() ];

		this.opts.timeout = this.opts.timeout || 500;

		this.opts.debug           = this.opts.hasOwnProperty( 'debug' ) ? this.opts.debug : false;
		this.opts.onlyReportOpen  = this.opts.hasOwnProperty( 'onlyReportOpen' ) ? this.opts.onlyReportOpen : true;
		this.opts.bannerGrab      = this.opts.hasOwnProperty( 'bannerGrab' ) ? this.opts.bannerGrab : true;
		this.opts.identifyService = this.opts.hasOwnProperty( 'identifyService' ) ? this.opts.identifyService : true;

		!this.opts.debug || console.log( 'starting scan with options' );
		!this.opts.debug || console.log( `  host: ${ this.opts.host }` );
		!this.opts.debug || console.log( `  cidr: ${ this.opts.cidr }` );
		!this.opts.debug || console.log( `  ports: ${ this.opts.ports }` );
		!this.opts.debug || console.log( `  timeout: ${ this.opts.timeout }` );
		!this.opts.debug || console.log( `  debug: ${ this.opts.debug }` );
		!this.opts.debug || console.log( `  onlyReportOpen: ${ this.opts.onlyReportOpen }` );
		!this.opts.debug || console.log( `  bannerGrab: ${ this.opts.bannerGrab }` );
		!this.opts.debug || console.log( `  attemptToIdentify: ${ this.opts.attemptToIdentify }` );

		this.result = new LightMap();

		setImmediate( () => this.emit( 'ready', this.opts ) );
	}

	async scan()
	{
		const data = [];

		let
			progress = 0,
			total    = 0;

		for ( const host of this.opts.cidr.hosts() ) {
			total += this.opts.ports.length;

			for ( let i = 0; i < this.opts.ports.length; i++ ) {
				const
					port = this.opts.ports[ i ],
					req  = connect( host, port, this.opts )
						.then( ( d ) => {
							this.result.set( `${ host }:${ port }`, d );

							if ( d ) {
								this.emit( 'data', d );
							}
						} )
						.finally( () => {
							this.emit( 'progress', ++progress / total );
						} );

				data.push( req );
			}
		}

		await Promise.all( data );
		this.emit( 'done', this.result );
	}
}

module.exports                           = PortScanner;
module.exports.commonPorts               = commonPorts;
module.exports.convertHighResolutionTime = convertHighResolutionTime;
module.exports.connect                   = connect;
