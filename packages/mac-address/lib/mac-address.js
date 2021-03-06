/** ****************************************************************************************************
 * File: mac-address.js
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
const MAC_BYTES = 6;

/**
 * MAC_MAX_LENGTH
 * @description
 * excluding the delimiter, a mac address is 12 characters long
 * @type {number}
 */
const MAC_MAX_LENGTH = 12;

function isValidMACAddress( mac ) {
	if ( !mac ) {
		throw new Error( 'mac address is required' );
	}
	else if ( typeof mac !== 'string' ) {
		throw new Error( 'mac address must be a string' );
	}

	return mac && (
		// xx:xx:xx:xx:xx:xx (canonical)
		/^(?:[\da-f]{1,2}:){5}[\da-f]{1,2}$/i.test( mac ) ||
		// xx-xx-xx-xx-xx-xx (Windows)
		/^(?:[\da-f]{1,2}-){5}[\da-f]{1,2}$/i.test( mac ) ||
		// xxxxxx-xxxxxx (Hewlett-Packard switches)
		/^[\da-f]{6}-[\da-f]{6}$/i.test( mac ) ||
		// xxxxxxxxxxxx (Intel Landesk)
		/^[\da-f]{12}$/i.test( mac )
	);
}

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
		throw new Error( `malformed IEEE 802 MAC-48 address "${ mac }"` );
	}

	for ( let i = 0; i < MAC_BYTES; i++ ) {
		macBuf[ i ] = parseInt( macHex.substr( 2 * i, 2 ), 16 );
	}

	return macBuf;
}

module.exports                   = macAddress;
module.exports.MAC_BYTES         = MAC_BYTES;
module.exports.MAC_MAX_LENGTH    = MAC_MAX_LENGTH;
module.exports.isValidMACAddress = isValidMACAddress;
