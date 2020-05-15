/** ****************************************************************************************************
 * File: network-cidr.js
 * Project: @mi-sec/network-cidr
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const { ipToLong, longToIp } = require( '@mi-sec/ip' );

class NetworkCidr
{
	constructor( net, mask )
	{
		if ( !net || typeof net !== 'string' ) {
			throw new Error( 'invalid "net" parameter' );
		}
		else if ( /localhost/.test( net ) ) {
			net  = '127.0.0.1';
			mask = 32;
		}
		else if ( !mask ) {
			[ net, mask ] = this.maskFromNetwork( net );
		}

		if ( typeof mask === 'string' && mask.indexOf( '.' ) > -1 ) {
			this.maskLong = ipToLong( mask );

			for ( let i = 32; i >= 0; i-- ) {
				if ( this.maskLong === ( 0xFFFFFFFF << ( 32 - i ) ) >>> 0 ) {
					this.bitmask = i;
					break;
				}
			}
		}
		else {
			this.bitmask = parseInt( mask, 10 );
			if ( this.bitmask > 0 ) {
				this.maskLong = ( 0xFFFFFFFF << ( 32 - this.bitmask ) ) >>> 0;
			}
		}

		this.netLong = ( ipToLong( net ) & this.maskLong ) >>> 0;

		this.validBitmask( this.bitmask, mask );

		this.size     = Math.pow( 2, 32 - this.bitmask );
		this.base     = longToIp( this.netLong );
		this.mask     = longToIp( this.maskLong );
		this.hostmask = longToIp( ~this.maskLong );

		this.firstd    = this.netLong;
		this.first     = longToIp( this.firstd );
		this.lastd     = this.firstd + this.size - 1;
		this.last      = longToIp( this.lastd );
		this.broadcast = this.last;
	}

	validBitmask( n, mask = n )
	{
		if ( !( n >= 1 && n <= 32 ) ) {
			throw new Error( `invalid mask: ${ mask }` );
		}
	}

	maskFromNetwork( net )
	{
		const ref = net.split( '/', 2 );
		let mask  = ref[ 1 ];
		net       = ref[ 0 ];

		if ( !mask ) {
			mask = net.split( '.' ).filter( ( i ) => !!+i ).length * 8;

			if ( !mask || mask > 32 ) {
				throw new Error( `invalid network address: ${ net }` );
			}
		}

		return [ net, mask ];
	}

	contains( ip )
	{
		if ( typeof ip === 'string' && ( ip.indexOf( '/' ) > 0 || ip.split( '.' ).length !== 4 ) ) {
			ip = new NetworkCidr( ip );
		}

		if ( ip instanceof NetworkCidr ) {
			return this.contains( ip.base ) && this.contains( ip.broadcast || ip.last );
		}
		else {
			return ( ipToLong( ip ) & this.maskLong ) >>> 0 === ( this.netLong & this.maskLong ) >>> 0;
		}
	}

	forEach( fn )
	{
		let long = ipToLong( this.first ), i = 0;
		for ( ; long <= ipToLong( this.last ); long++, i++ ) {
			fn( longToIp( long ), i, this );
		}
	}

	toString()
	{
		return this.base + '/' + this.bitmask;
	}

	toJSON()
	{
		return { ...this };
	}

	hosts()
	{
		if ( this.firstd === this.lastd ) {
			const value = longToIp( this.firstd );

			return {
				[ Symbol.iterator ]() {
					return {
						_done: true,
						next() {
							return this._done ? {
								value,
								done: ( this._done = false )
							} : { done: true };
						}
					};
				}
			};
		}

		const iteration = this[ Symbol.iterator ]( this.firstd + 1, this.lastd );

		return {
			[ Symbol.iterator ]() {
				return iteration;
			}
		};
	}

	[ Symbol.iterator ]( first, last )
	{
		first = first || this.netLong;
		last  = last || ipToLong( this.last ) + 1;

		return {
			index: first,
			value: longToIp( first ),
			get done() {
				return !( this.index <= last );
			},
			next() {
				this.value = longToIp( this.index );
				this.index++;
				return this;
			}
		};
	}

	[ Symbol.toPrimitive ]( n )
	{
		if ( n === 'number' ) {
			return +this.size;
		}
		else {
			return this.toString();
		}
	}

	get [ Symbol.toStringTag ]()
	{
		return this.constructor.name;
	}

	static [ Symbol.hasInstance ]( instance )
	{
		return instance.constructor.name === 'NetworkCidr';
	}
}

module.exports = NetworkCidr;
