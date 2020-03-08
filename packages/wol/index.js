/** ****************************************************************************************************
 * File: index.js
 * Project: @mi-sec/wol
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import dgram from 'dgram';
import net   from 'net';

import macAddress, { MAC_BYTES } from '@mi-sec/mac-address';

export const MAGIC_PACKET_MAC_COPIES = 16;

export function createMagicPacket( mac ) {
	mac = macAddress( mac );

	const
		buf = Buffer.alloc( ( 1 + MAGIC_PACKET_MAC_COPIES ) * MAC_BYTES );

	buf.fill( 0xFF, 0, MAC_BYTES );

	for ( let i = 0; i < MAGIC_PACKET_MAC_COPIES; i++ ) {
		mac.copy( buf, ( i + 1 ) * MAC_BYTES, 0, mac.length );
	}

	return buf;
}
