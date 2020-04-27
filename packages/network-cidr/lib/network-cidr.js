/** ****************************************************************************************************
 * File: network-cidr.js
 * Project: @mi-sec/network-cidr
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

class NetworkCidr
{
	constructor( net, mask )
	{
		if ( !net || typeof net !== 'string' ) {
			throw new Error( 'invalid "net" parameter' );
		}
		else if ( !mask ) {
			const ref = net.split( '/', 2 );
			net       = ref[ 0 ];
			mask      = ref[ 1 ];

			if ( !mask ) {
				mask = net.split( '.' ).filter( ( i ) => !!+i ).length * 8;

				if ( !mask || mask > 32 ) {
					throw new Error( `invalid network address: ${ net }` );
				}
			}
		}

		if ( typeof mask === 'string' && mask.indexOf( '.' ) > -1 ) {
			this.maskLong = NetworkCidr.ipToLong( mask );

			for ( let i = 32; i >= 0; i-- ) {
				if ( this.maskLong === ( 0xFFFFFFFF << ( 32 - i ) ) >>> 0 ) {
					this.bitmask = i;
					break;
				}
			}
		}
		else if ( mask ) {
			this.bitmask = parseInt( mask, 10 );
			if ( this.bitmask > 0 ) {
				this.maskLong = ( 0xFFFFFFFF << ( 32 - this.bitmask ) ) >>> 0;
			}
		}

		this.netLong = ( NetworkCidr.ipToLong( net ) & this.maskLong ) >>> 0;

		if ( !( this.bitmask >= 1 && this.bitmask <= 32 ) ) {
			throw new Error( `invalid mask: ${ mask }` );
		}

		this.size     = Math.pow( 2, 32 - this.bitmask );
		this.hosts    = this.size >= 2 ? this.size - 2 : 1;
		this.base     = NetworkCidr.longToIp( this.netLong );
		this.mask     = NetworkCidr.longToIp( this.maskLong );
		this.hostmask = NetworkCidr.longToIp( ~this.maskLong );

		this.first = this.bitmask <= 30 ?
			NetworkCidr.longToIp( this.netLong + 1 ) :
			this.base;

		this.last = this.bitmask <= 30 ?
			NetworkCidr.longToIp( this.netLong + this.size - 2 ) :
			NetworkCidr.longToIp( this.netLong + this.size - 1 );

		this.broadcast = NetworkCidr.longToIp( this.netLong + this.size - 1 );
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
			return ( NetworkCidr.ipToLong( ip ) & this.maskLong ) >>> 0 === ( this.netLong & this.maskLong ) >>> 0;
		}
	}

	forEach( fn )
	{
		let long = NetworkCidr.ipToLong( this.first ), i = 0;
		for ( ; long <= NetworkCidr.ipToLong( this.last ); long++, i++ ) {
			fn( NetworkCidr.longToIp( long ), i, this );
		}
	}

	static longToIp( long )
	{
		return [
			( long & ( 0xFF << 24 ) ) >>> 24,
			( long & ( 0xFF << 16 ) ) >>> 16,
			( long & ( 0xFF << 8 ) ) >>> 8,
			long & 0xFF
		].join( '.' );
	}

	static ipToLong( ip )
	{
		const b = ( ip + '' ).split( '.' );

		if ( b.length === 0 || b.length > 4 ) {
			throw new Error( 'invalid ip' );
		}

		for ( let i = 0; i < b.length; i++ ) {
			const byte = +b[ i ];

			if ( byte !== byte || byte < 0 || byte > 255 ) {
				throw new Error( `invalid byte: ${ byte }` );
			}
		}

		return (
			( b[ 0 ] || 0 ) << 24 |
			( b[ 1 ] || 0 ) << 16 |
			( b[ 2 ] || 0 ) << 8 |
			( b[ 3 ] || 0 )
		) >>> 0;
	}

	toString()
	{
		return this.base + '/' + this.bitmask;
	}

	toJSON()
	{
		return { ...this };
	}

	[ Symbol.iterator ]()
	{
		const
			long     = this.netLong,
			lastLong = NetworkCidr.ipToLong( this.last );

		return {
			index: long,
			value: NetworkCidr.longToIp( long ),
			get done() {
				return !( this.index <= lastLong );
			},
			next() {
				this.index++;
				this.value = NetworkCidr.longToIp( this.index );
				return this;
			}
		};
	}

	[ Symbol.toPrimitive ]( n )
	{
		if ( n === 'string' ) {
			return this.toString();
		}
		else if ( n === 'number' ) {
			return +this.hosts;
		}
		else if ( n === 'boolean' ) {
			return !!this;
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

export default NetworkCidr;
