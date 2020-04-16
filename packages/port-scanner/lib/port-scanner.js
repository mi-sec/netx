/** ****************************************************************************************************
 * File: port-scanner.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import { createConnection } from 'net';
import LightMap             from '@mi-sec/lightmap';

export const commonPorts = new LightMap( [
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

export function convertHighResolutionTime( t ) {
	return ( ( t[ 0 ] * 1e9 ) + t[ 1 ] ) / 1e6;
}

export function connect( host, port, opts = {} ) {
	!opts.debug || console.log( `scanning ${ host }:${ port }` );

	return new Promise(
		( res, rej ) => {
			const
				timeout = opts.timeout || 1000;

			let
				banner            = '',
				status            = '',
				error             = null,
				connectionRefused = false,
				time              = process.hrtime();

			const socket = createConnection( { port, host } );

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

			socket.setTimeout( timeout );
			socket.on( 'timeout', () => {
				!opts.debug || console.log( `${ host }:${ port } timeout` );

				status = 'closed';
				error  = new Error( 'timeout' );
				socket.end();
			} );

			socket.on( 'error', ( e ) => {
				!opts.debug || console.log( `${ host }:${ port } error` );

				status = 'closed';

				if ( e.code !== 'ECONNREFUSED' ) {
					error = e;
				}
				else {
					connectionRefused = true;
				}
			} );

			socket.on( 'close', ( e ) => {
				if ( opts.onlyReportOpen && status !== 'open' ) {
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

export async function scan( opts = {} ) {
	opts.host    = opts.host || '127.0.0.1';
	opts.port    = opts.port ?
		Array.isArray( opts.port ) ? opts.port : [ opts.port ] :
		[ ...commonPorts.keys() ];
	opts.timeout = opts.timeout || 500;

	opts.debug             = opts.hasOwnProperty( 'debug' ) ? opts.debug : false;
	opts.onlyReportOpen    = opts.hasOwnProperty( 'onlyReportOpen' ) ? opts.onlyReportOpen : true;
	opts.bannerGrab        = opts.hasOwnProperty( 'bannerGrab' ) ? opts.bannerGrab : true;
	opts.attemptToIdentify = opts.hasOwnProperty( 'attemptToIdentify' ) ? opts.attemptToIdentify : true;

	!opts.debug || console.log( 'starting scan with options' );
	!opts.debug || console.log( `  host: ${ opts.host }` );
	!opts.debug || console.log( `  ports: ${ opts.port }` );
	!opts.debug || console.log( `  timeout: ${ opts.timeout }` );
	!opts.debug || console.log( `  debug: ${ opts.debug }` );
	!opts.debug || console.log( `  onlyReportOpen: ${ opts.onlyReportOpen }` );
	!opts.debug || console.log( `  bannerGrab: ${ opts.bannerGrab }` );
	!opts.debug || console.log( `  attemptToIdentify: ${ opts.attemptToIdentify }` );

	let result = [];
	for ( let i = 0; i < opts.port.length; i++ ) {
		result.push( connect( opts.host, opts.port[ i ], opts ) );
	}

	result = await Promise.all( result );
	result = result.filter( ( i ) => !!i );

	return result;
}

export default scan;
