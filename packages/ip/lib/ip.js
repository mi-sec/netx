/** ****************************************************************************************************
 * File: ip.js
 * Project: @mi-sec/ip
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

function validIPv4( ip ) {
	if ( ip === 'localhost' ) {
		return true;
	}

	return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
		.test( ip );
}

function longToIp( long ) {
	if ( long < 0 ) {
		throw new Error( `invalid long: ${ long }` );
	}

	return [
		( long & ( 0xFF << 24 ) ) >>> 24,
		( long & ( 0xFF << 16 ) ) >>> 16,
		( long & ( 0xFF << 8 ) ) >>> 8,
		long & 0xFF
	].join( '.' );
}

function ipToLong( ip ) {
	if ( ip === 'localhost' ) {
		return 0x7F000001;
	}

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

module.exports = {
	validIPv4,
	longToIp,
	ipToLong
};
