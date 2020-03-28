/** ****************************************************************************************************
 * File: ping.js
 * Project: @mi-sec/ping
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import { EventEmitter } from 'events';
import raw              from 'raw-socket';
import LightMap         from '@mi-sec/lightmap';

export class DestinationUnreachableError extends Error
{
	constructor( source )
	{
		super();
		this.name    = 'DestinationUnreachableError';
		this.message = `Destination unreachable (source=${ source })`;
		this.source  = source;
	}
}

export class PacketTooBigError extends Error
{
	constructor( source )
	{
		super();
		this.name    = 'PacketTooBigError';
		this.message = `Packet too big (source=${ source })`;
		this.source  = source;
	}
}

export class ParameterProblemError extends Error
{
	constructor( source )
	{
		super();
		this.name    = 'ParameterProblemError';
		this.message = `Parameter problem (source=${ source })`;
		this.source  = source;
	}
}

export class RedirectReceivedError extends Error
{
	constructor( source )
	{
		super();
		this.name    = 'RedirectReceivedError';
		this.message = `Redirect received (source=${ source })`;
		this.source  = source;
	}
}

export class RequestTimedOutError extends Error
{
	constructor()
	{
		super();
		this.name    = 'RequestTimedOutError';
		this.message = 'Request timed out';
	}
}

export class SourceQuenchError extends Error
{
	constructor( source )
	{
		super();
		this.name    = 'SourceQuenchError';
		this.message = `Source quench (source=${ source })`;
		this.source  = source;
	}
}

export class TimeExceededError extends Error
{
	constructor( source )
	{
		super();
		this.name    = 'TimeExceededError';
		this.message = `Time exceeded (source=${ source })`;
		this.source  = source;
	}
}

export class UnknownResponseType extends Error
{
	constructor( type, source )
	{
		super();
		this.name    = 'UnknownResponseType';
		this.message = `Unknown response type '${ type }' (source=${ source })`;
		this.source  = source;
	}
}

/**
 * ICMPSession
 * @description
 * create an ICMP session and fire ping requests
 * @example
 * const session = new ICMPSession( {
 * 	debug: true,
 * 	retries: 2
 * } );
 *
 * // example response:
 * // {
 * // 	id: 1,
 * // 	target: '127.0.0.1',
 * // 	retries: 2,
 * // 	timeout: 2000,
 * // 	buffer: <Buffer 08 00 e2 b0 15 4e 00 01 00 00 00 00 00 00 00 00>,
 * // 	sent: [ 69544, 825513666 ],
 * // 	type: 0,
 * // 	code: 0,
 * // 	time: [ 0, 1115168 ],
 * // 	readableTime: '1.115168 ms'
 * // }
 * session.on( 'message', ( msg ) => {
 * 	console.log( msg );
 * } );
 *
 * session.on( 'error', ( err ) => {
 * 	console.trace( err.toString() );
 * } );
 *
 * // localhost - 0 meters away
 * session.pingHost( '127.0.0.1' ); // 1.115 ms
 * // home router ~10 meters away
 * session.pingHost( '192.168.1.1' ); // 1.368 ms
 * // server ~30 kilometers away
 * session.pingHost( '34.228.0.150' ); // 6.641 ms
 * // server ~16000 kilometers away
 * session.pingHost( '54.153.234.224' ); // 209.816 ms
 */
export default class ICMPSession extends EventEmitter
{
	#pendingRequests = new LightMap();
	#debug           = false;
	#retries         = 1;
	#timeout         = 2000;
	#defaultTTL      = 64;

	#nextId        = 0;
	#sessionId     = process.pid;
	#socket        = null;
	#packetSize    = 16;
	#ttl           = null;
	#addressFamily = null;

	/**
	 * constructor
	 * @description
	 * construct ICMPSession
	 * @param {object} opts
	 * @param {boolean} [opts.debug=false]
	 * debug ICMP request and response
	 * @param {number} [opts.retries=1]
	 * how many times to attempt ICMP request before reporting timeout failure
	 * @param {number} [opts.timeout=2000]
	 * how many milliseconds to wait before timing out network request with no resolution
	 * @param {number} [opts.ttl=64]
	 * limits for the number of network hops to traverse
	 * @param {number} [opts.sessionId=process.pid]
	 * override session id, defaults to process pid
	 * @param {number} [opts.packetSize=16]
	 * packet size to create. **cannot** be less than 12, _should_ not be greater than 1472 or packet fragmentation
	 * could introduce abnormal results
	 * @param {string} [opts.protocol=IPv4]
	 * protocol to use (IPv4, IPv6)
	 */
	constructor( opts = {} )
	{
		super();

		this.#debug      = !!opts.debug;
		this.#retries    = opts.retries || this.#retries;
		this.#timeout    = opts.timeout || this.#timeout;
		this.#defaultTTL = opts.ttl || this.#defaultTTL;

		this.#sessionId  = ( opts.sessionId || this.#sessionId ) % 65535;
		this.#packetSize = opts.packetSize || this.#packetSize;

		if ( this.#packetSize < 12 ) {
			this.#packetSize = 12;
		}

		this.#addressFamily = (
			opts.protocol === raw.AddressFamily[ 2 ] || opts.protocol === raw.AddressFamily.IPv4
		) ? raw.AddressFamily.IPv6 : raw.AddressFamily.IPv4;

		this.getSocket();
	}

	/**
	 * getSocket
	 * @description
	 * create and bind socket to 'error', 'close', and 'message' listeners
	 * @return {Socket} - socket created by raw-socket
	 */
	getSocket()
	{
		if ( this.#socket ) {
			return this.#socket;
		}

		console.log( this.#addressFamily );
		console.log( this.#addressFamily === raw.AddressFamily.IPv6 );
		console.log( raw.Protocol );

		this.#socket = raw.createSocket( {
			addressFamily: this.#addressFamily,
			protocol: this.#addressFamily === raw.AddressFamily.IPv6 ?
				raw.Protocol.ICMPv6 :
				raw.Protocol.ICMP
		} );

		console.log( this.#socket );

		this.#socket.on( 'error', this.onSocketError.bind( this ) );
		this.#socket.on( 'close', this.onSocketClose.bind( this ) );
		this.#socket.on( 'message', this.onSocketMessage.bind( this ) );

		this.setTTL( this.#defaultTTL );

		return this.#socket;
	}

	/**
	 * fromBuffer
	 * @description
	 * parse ICMP echo reply
	 * @param {Buffer} buf - echo reply buffer
	 * @return {null|*} - request matching icmp_seq in buffer response or null if error
	 */
	fromBuffer( buf )
	{
		let offset, type, code;

		if ( this.#addressFamily === raw.AddressFamily.IPv6 ) {
			// IPv6 raw sockets don't pass the IPv6 header back to us
			offset = 0;

			if ( buf.length - offset < 8 ) {
				return;
			}

			// we don't believe any IPv6 options will be passed back to us so we
			// don't attempt to pass them here.

			type = buf.readUInt8( offset );
			code = buf.readUInt8( offset + 1 );
		}
		else {
			// Need at least 20 bytes for an IP header, and it should be IPv4
			if ( buf.length < 20 || ( buf[ 0 ] & 0xF0 ) !== 0x40 ) {
				return;
			}

			// The length of the IPv4 header is in mulitples of double words
			const ip_len = ( buf[ 0 ] & 0x0F ) * 4;

			// ICMP header is 8 bytes, we don't care about the data for now
			if ( buf.length - ip_len < 8 ) {
				return;
			}

			const ip_icmp_offset = ip_len;

			// ICMP message too short
			if ( buf.length - ip_icmp_offset < 8 ) {
				return;
			}

			type = buf.readUInt8( ip_icmp_offset );
			code = buf.readUInt8( ip_icmp_offset + 1 );

			// For error type responses the sequence and identifier cannot be
			// extracted in the same way as echo responses, the data part contains
			// the IP header from our request, followed with at least 8 bytes from
			// the echo request that generated the error, so we first go to the IP
			// header, then skip that to get to the ICMP packet which contains the
			// sequence and identifier.
			if ( type === 0x3 || type === 0x4 || type === 0x5 || type === 0xB ) {
				const ip_icmp_ip_offset = ip_icmp_offset + 8;

				// Need at least 20 bytes for an IP header, and it should be IPv4
				if (
					buf.length - ip_icmp_ip_offset < 20 ||
					buf[ ip_icmp_ip_offset ] & 0xF0 !== 0x40
				) {
					return;
				}

				// The length of the IPv4 header is in mulitples of double words
				const ip_icmp_ip_length = ( buf[ ip_icmp_ip_offset ] & 0x0F ) * 4;

				// ICMP message too short
				if ( buf.length - ip_icmp_ip_offset - ip_icmp_ip_length < 8 ) {
					return;
				}

				offset = ip_icmp_ip_offset + ip_icmp_ip_length;
			}
			else {
				offset = ip_icmp_offset;
			}
		}

		// Response is not for a request we generated
		if ( buf.readUInt16BE( offset + 4 ) !== this.#sessionId ) {
			return;
		}

		buf[ offset + 4 ] = 0;

		const
			id  = buf.readUInt16BE( offset + 6 ),
			req = this.#pendingRequests.get( id );

		if ( req ) {
			req.type = type;
			req.code = code;
			return req;
		}
		else {
			return null;
		}
	}

	onBeforeSocketSend( req )
	{
		this.setTTL( req.ttl || this.#defaultTTL );
	}

	onSocketClose()
	{
		this.emit( 'close' );
		this.flush( new Error( 'Socket closed' ) );
	}

	onSocketError( error )
	{
		this.emit( 'error', error );
	}

	onSocketMessage( buf, source )
	{
		this.debugResponse( source, buf );

		const req = this.fromBuffer( buf );

		if ( req ) {
			/**
			 * if we ping'd ourself (i.e. 127.0.0.1 or ::1) then we may receive the echo request in addition to any
			 * corresponding echo responses. discard the request packets here so that we don't delete the request from
			 * the request queue because we haven't received a response yet.
			 */
			if ( this.#addressFamily === raw.AddressFamily.IPv6 ) {
				// ICMP6 echo request captured
				if ( req.type === 0x80 ) {
					return;
				}
			}
			else {
				// ICMP echo request captured
				if ( req.type === 0x8 ) {
					return;
				}
			}

			this.reqRemove( req.id );

			req.time = process.hrtime( req.sent );

			if ( this.#addressFamily === raw.AddressFamily.IPv6 ) {
				if ( req.type === 0x1 ) {
					req.callback( new DestinationUnreachableError( source ), req );
				}
				else if ( req.type === 0x2 ) {
					req.callback( new PacketTooBigError( source ), req );
				}
				else if ( req.type === 0x3 ) {
					req.callback( new TimeExceededError( source ), req );
				}
				else if ( req.type === 0x4 ) {
					req.callback( new ParameterProblemError( source ), req );
				}
				else if ( req.type === 0x81 ) {
					req.callback( null, req );
				}
				else {
					req.callback( new UnknownResponseType( req.type, source ), req );
				}
			}
			else {
				if ( req.type === 0x0 ) {
					req.callback( null, req );
				}
				else if ( req.type === 0x3 ) {
					req.callback( new DestinationUnreachableError( source ), req );
				}
				else if ( req.type === 0x4 ) {
					req.callback( new SourceQuenchError( source ), req );
				}
				else if ( req.type === 0x5 ) {
					req.callback( new RedirectReceivedError( source ), req );
				}
				else if ( req.type === 0xB ) {
					req.callback( new TimeExceededError( source ), req );
				}
				else {
					req.callback( new UnknownResponseType( req.type, source ), req );
				}
			}
		}
	}


	onSocketSend( req, err )
	{
		if ( !req.sent ) {
			req.sent = process.hrtime();
		}

		if ( err ) {
			this.reqRemove( req.id );
			req.time = process.hrtime( req.sent );
			req.callback( err, req );
		}
		else {
			req.timer = setTimeout( this.onTimeout.bind( this, req ), req.timeout );
		}
	}

	onTimeout( req )
	{
		if ( req.retries > 0 ) {
			req.retries--;
			this.send( req );
		}
		else {
			this.reqRemove( req.id );
			req.time = process.hrtime( req.sent );
			req.callback( new RequestTimedOutError( 'Request timed out' ), req );
		}
	}

	generateId()
	{
		const startId = this.#nextId++;

		while ( true ) {
			if ( this.#nextId > 65535 ) {
				this.#nextId = 1;
			}

			if ( this.#pendingRequests.has( this.#nextId ) ) {
				this.#nextId++;
			}
			else {
				return this.#nextId;
			}

			// no available request IDs
			if ( this.#nextId === startId ) {
				return;
			}
		}
	}

	pingHost( target )
	{
		const id = this.generateId();
		if ( !id ) {
			throw new Error( 'Too many requests outstanding' );
		}

		const req = {
			id,
			target,
			retries: this.#retries,
			timeout: this.#timeout,
			callback: ( err, packet ) => {
				if ( err ) {
					this.emit( 'error', err );
				}
				else {
					packet.readableTime = `${ this.convertHRTime( packet.time ) } ms`;
					delete packet.callback;
					this.emit( 'message', packet );
				}
			}
		};

		this.reqQueue( req );

		return this;
	}

	reqQueue( req )
	{
		req.buffer = this.toBuffer( req );

		this.debugRequest( req.target, req );

		this.#pendingRequests.set( req.id, req );
		this.send( req );

		return this;
	}

	reqRemove( id )
	{
		const req = this.#pendingRequests.get( id );

		if ( req ) {
			clearTimeout( req.timer );
			delete req.timer;
			this.#pendingRequests.delete( req.id );
		}

		// if we have no more outstanding requests pause readable events
		if ( this.#pendingRequests.size <= 0 ) {
			if ( !this.getSocket().recvPaused ) {
				this.getSocket().pauseRecv();
			}
		}

		return req;
	}

	send( req )
	{
		const buf = req.buffer;

		// Resume readable events if the raw socket is paused
		if ( this.getSocket().recvPaused ) {
			this.getSocket().resumeRecv();
		}

		this.getSocket()
			.send(
				buf,
				0,
				buf.length,
				req.target,
				this.onBeforeSocketSend.bind( this, req ),
				this.onSocketSend.bind( this, req )
			);
	}

	setTTL( ttl )
	{
		if ( this.#ttl && this.#ttl === ttl ) {
			return;
		}

		const level = this.#addressFamily === raw.AddressFamily.IPv6 ?
			raw.SocketLevel.IPPROTO_IPV6 :
			raw.SocketLevel.IPPROTO_IP;

		this.getSocket().setOption( level, raw.SocketOption.IP_TTL, ttl );

		this.#ttl = ttl;
	}

	toBuffer( req )
	{
		const buf = Buffer.alloc( this.#packetSize );

		// Since our buffer represents real memory we should initialise it to
		// prevent its previous contents from leaking to the network.
		for ( let i = 8; i < this.#packetSize; i++ ) {
			buf[ i ] = 0;
		}

		const type = this.#addressFamily === raw.AddressFamily.IPv6 ? 0x80 : 0x8;

		buf.writeUInt8( type, 0x0 );
		buf.writeUInt8( 0x0, 0x1 );
		buf.writeUInt16BE( 0x0, 0x2 );
		buf.writeUInt16BE( this.#sessionId, 0x4 );
		buf.writeUInt16BE( req.id, 0x6 );
		raw.writeChecksum( buf, 2, raw.createChecksum( buf ) );

		return buf;
	}

	convertHRTime( hrtime )
	{
		if ( !Array.isArray( hrtime ) ) {
			throw new Error( 'expected array for hrtime' );
		}
		else if ( hrtime.length !== 2 ) {
			throw new Error( 'expected array(2) for hrtime tuple' );
		}

		return ( ( hrtime[ 0 ] * 1e9 ) + hrtime[ 1 ] ) / 1e6;
	}

	debug( ...msg )
	{
		if ( this.#debug ) {
			console.debug( ...msg );
		}
	}

	debugRequest( target, req )
	{
		this.debug(
			`request: addressFamily=${ this.#addressFamily }`,
			`target=${ req.target }`,
			`id=${ req.id }`,
			`buffer=${ req.buffer.toString( 'hex' ) }`
		);
	}

	debugResponse( source, buf )
	{
		this.debug(
			`response: addressFamily=${ this.#addressFamily }`,
			`source=${ source }`,
			`buffer=${ buf.toString( 'hex' ) }`
		);
	}

	flush( err )
	{
		for ( const [ key ] of this.#pendingRequests ) {
			const req = this.reqRemove( key );
			req.time  = process.hrtime( req.sent || [ 0, 0 ] );
			req.callback( err, req );
		}
	}

	close()
	{
		if ( this.#socket ) {
			this.#socket.close();
		}

		this.flush( new Error( 'Socket forcibly closed' ) );

		this.#socket = null;

		return this;
	};
}

export function createICMPSession( opts = {} ) {
	return new ICMPSession( opts );
}
