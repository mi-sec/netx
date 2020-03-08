/** ****************************************************************************************************
 * File: index.js
 * Project: @mi-sec/mac-address
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

/**
 * MAC_BYTES
 * @description
 * a mac address is a 6 byte combination of hex characters typically delineated by `:`
 * @type {number}
 */
export const MAC_BYTES      = 6;

/**
 * MAC_MAX_LENGTH
 * @description
 * excluding the delimiter, a mac address is 12 characters long
 * @type {number}
 */
export const MAC_MAX_LENGTH = 12;

/**
 * macAddress
 * @description
 * takes a number or string and converts to 6-byte buffer
 * @param {number|string} mac - MAC address in hex-number or string format
 * @return {Buffer} - returns MAC address as buffer
 */
function macAddress( mac ) {
	if ( !mac ) {
		throw new Error( 'mac address is required' );
	}
	else if ( typeof mac === 'number' ) {
		return macAddress( mac.toString( 16 ) );
	}
	else if ( typeof mac !== 'string' ) {
		throw new Error( 'mac address must be a number or string' );
	}

	const
		macBuf = Buffer.alloc( MAC_BYTES ),
		macHex = mac.match( /([a-f0-9]+)/ig ).join( '' );

	if ( macHex.length !== MAC_MAX_LENGTH ) {
		throw new Error( `malformed MAC address "${ mac }"` );
	}

	for ( let i = 0; i < MAC_BYTES; i++ ) {
		macBuf[ i ] = parseInt( macHex.substr( 2 * i, 2 ), 16 );
	}

	return macBuf;
}

export default macAddress;
