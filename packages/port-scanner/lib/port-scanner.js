/** ****************************************************************************************************
 * File: port-scanner.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	net              = require( 'net' ),
	{ EventEmitter } = require( 'events' ),
	LightMap         = require( '@mi-sec/lightmap' ),
	NetworkCidr      = require( '@mi-sec/network-cidr' );

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

function deepCopy( n ) {
	return JSON.parse( JSON.stringify( n ) );
}

/**
 * TCPConnect
 * @description
 * make a socket connection to a single host/port
 * @param {object} opts - socket options
 * @param {string} opts.host - ip address
 * @param {number} opts.port - port to connect to
 * @param {number} [opts.timeout=1000] - socket timeout
 * @param {number} [opts.bannerlen=512] - maximum banner length to gather
 * @param {object} [opts.connectionOpts={}] - connection options
 *     [ref](https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener)
 *
 * @example
 * new TCPConnect( {
 * 	host: '192.168.1.30',
 * 	port: 22
 * } ).scan();
 *
 * {
 * 	host: '192.168.1.30',
 * 	port: 22,
 * 	status: 'open',
 * 	banner: 'SSH-2.0-OpenSSH_7.9\r\n',
 * 	time: 6.081522,
 * 	service: 'ssh'
 * }
 */
class TCPConnect
{
	constructor( opts = {} )
	{
		if ( !opts.hasOwnProperty( 'host' ) ) {
			throw new Error( 'TCPConnect opts.host is required' );
		}
		else if ( !opts.hasOwnProperty( 'port' ) ) {
			throw new Error( 'TCPConnect opts.port is required' );
		}

		this.opts = deepCopy( opts );
		this.debug( 'preparing' );

		this.opts.timeout        = this.opts.timeout || 2000;
		this.opts.bannerlen      = this.opts.bannerlen || 512;
		this.opts.connectionOpts = this.opts.connectionOpts || {};

		this.data = {
			host: this.opts.host,
			port: this.opts.port,
			banner: '',
			error: false,
			status: null,
			opened: false,
			time: 0
		};
	}

	startTime()
	{
		this.timeStopped = false;
		this.data.time   = process.hrtime();
	}

	stopTime()
	{
		if ( !this.timeStopped ) {
			const end      = process.hrtime( this.data.time );
			this.data.time = convertHighResolutionTime( end );
		}

		this.timeStopped = true;
	}

	onConnect()
	{
		this.stopTime();
		this.data.opened = true;

		this.debug( `connected in ${ this.data.time }ms` );
	}

	onData( buf )
	{
		if ( this.opts.bannerGrab ) {
			// ref if IAC negotiation is needed
			// Ref: http://www.iana.org/assignments/telnet-options/telnet-options.xhtml
			if ( this.data.banner.length < this.opts.bannerlen ) {
				return this.data.banner += buf.toString( 'ascii' );
			}
		}

		this.socket && this.socket.destroy();
	}

	onTimeout()
	{
		this.debug( `socket timeout (opened ${ this.data.opened })` );

		if ( !this.data.opened ) {
			this.data.status = 'closed (timeout)';
		}
		else {
			this.data.status = 'open';
		}

		this.socket && this.socket.destroy();
	}

	onError( e )
	{
		this.data.error  = true;
		this.data.status = /ECONNREFUSED/.test( e.message ) ? 'closed (refused)' :
			/EHOSTUNREACH/.test( e.message ) ? 'closed (unreachable)' :
				e.message;
	}

	scan()
	{
		this.debug( 'scanning' );

		this.startTime();

		return new Promise(
			( res, rej ) => {
				this.socket = net.createConnection( {
					host: this.opts.host,
					port: this.opts.port,
					...this.opts.connectionOpts
				} );
				this.socket.removeAllListeners( 'timeout' );
				this.socket.setTimeout( this.opts.timeout );

				this.socket.on( 'connect', this.onConnect.bind( this ) );
				this.socket.on( 'data', this.onData.bind( this ) );
				this.socket.on( 'timeout', this.onTimeout.bind( this ) );
				this.socket.on( 'error', this.onError.bind( this ) );
				this.socket.on( 'close', () => {
					// if ( !this.data.banner ) {
					// 	this.data.opened = false;
					// }
					this.stopTime();
					this.debug( 'scan complete' );

					if ( !this.data.status ) {
						this.data.status = this.data.opened ? 'open' : 'closed';
					}

					if ( this.opts.identifyService ) {
						this.data.service = commonPorts.get( this.opts.port ) || 'unknown';
					}

					if ( this.socket ) {
						this.socket.destroy();
						delete this.socket;
					}

					if ( this.data.error ) {
						rej( this.data );
					}
					else {
						res( this.data );
					}
				} );
			}
		);
	}

	debug( ...msg )
	{
		if ( this.opts.debug ) {
			console.log( `[TCPConnect] ${ this.opts.host }:${ this.opts.port }`, ...msg );
		}
	}
}

class PortScanner extends EventEmitter
{
	constructor( opts = {} )
	{
		super();

		this.opts      = opts;
		this.opts.cidr = new NetworkCidr( this.opts.host || '127.0.0.1' );

		if ( this.opts.ports ) {
			if ( !Array.isArray( this.opts.ports ) ) {
				this.opts.ports = [ this.opts.ports ];
			}
		}
		else {
			this.opts.ports = [ ...commonPorts.keys() ];
		}

		this.opts.timeout = this.opts.timeout || 1000;

		this.opts.debug           = this.opts.hasOwnProperty( 'debug' ) ? this.opts.debug : false;
		this.opts.onlyReportOpen  = this.opts.hasOwnProperty( 'onlyReportOpen' ) ? this.opts.onlyReportOpen : true;
		this.opts.bannerGrab      = this.opts.hasOwnProperty( 'bannerGrab' ) ? this.opts.bannerGrab : true;
		this.opts.identifyService = this.opts.hasOwnProperty( 'identifyService' ) ? this.opts.identifyService : true;

		this.debug( 'starting scan with options' );
		this.debug( `  host: ${ this.opts.host }` );
		this.debug( `  cidr: ${ this.opts.cidr }` );
		this.debug( `  ports: ${ this.opts.ports }` );
		this.debug( `  timeout: ${ this.opts.timeout }` );
		this.debug( `  debug: ${ this.opts.debug }` );
		this.debug( `  onlyReportOpen: ${ this.opts.onlyReportOpen }` );
		this.debug( `  bannerGrab: ${ this.opts.bannerGrab }` );
		this.debug( `  identifyService: ${ this.opts.identifyService }` );

		this.result = new LightMap();

		setImmediate( () => this.emit( 'ready', this.opts ) );
	}

	static isRange( n )
	{
		return !!n && n === '' + n && /\d+-\d+/.test( n );
	}

	static * portRangeIterator( ports )
	{
		for ( let i = 0; i < ports.length; i++ ) {
			const p = ports[ i ];

			if ( PortScanner.isRange( p ) ) {
				let [ x, y ] = p.split( '-' );
				x            = +x;
				y            = +y;
				while ( x <= y ) {
					yield x++;
				}
			}
			else {
				yield p;
			}
		}
	}

	async scan()
	{
		const
			hosts = this.opts.cidr.hosts(),
			total = this.opts.cidr.size * this.opts.ports.length;

		let progress = 0;

		for ( const host of hosts ) {
			for ( const port of PortScanner.portRangeIterator( this.opts.ports ) ) {
				const
					key     = `${ host }:${ port }`,
					connect = new TCPConnect( { ...this.opts, host, port } );

				await connect.scan()
					.then( ( d ) => {
						if ( !d.opened && this.opts.onlyReportOpen ) {
							return;
						}

						this.result.set( key, d );
						this.emit( 'data', d );
					} )
					.catch( ( d ) => {
						if ( !d.opened && this.opts.onlyReportOpen ) {
							return;
						}

						this.result.set( `${ host }:${ port }`, d );
						this.emit( 'data', d );
					} )
					.finally( () => {
						this.emit( 'progress', ++progress / total );
					} );
			}
		}

		// await Promise.all( data );

		if ( this.opts.onlyReportOpen ) {
			this.result = this.result.filter( ( v ) => v && v.status === 'open' );
		}

		this.emit( 'done', this.result );
	}

	debug( ...msg )
	{
		if ( this.opts.debug ) {
			console.log( ...msg );
		}
	}
}

module.exports                           = PortScanner;
module.exports.PortScanner               = PortScanner;
module.exports.TCPConnect                = TCPConnect;
module.exports.commonPorts               = commonPorts;
module.exports.convertHighResolutionTime = convertHighResolutionTime;
