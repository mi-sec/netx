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

	const buf = Buffer.alloc( ( 1 + MAGIC_PACKET_MAC_COPIES ) * MAC_BYTES );

	buf.fill( 0xFF, 0, MAC_BYTES );

	for ( let i = 0; i < MAGIC_PACKET_MAC_COPIES; i++ ) {
		mac.copy( buf, ( i + 1 ) * MAC_BYTES, 0, mac.length );
	}

	return buf;
}

export default async function wakeOnLan( mac, opts = {} ) {
	opts.address  = opts.address || '255.255.255.255';
	opts.packets  = opts.packets || 3;
	opts.interval = opts.interval || 100;
	opts.port     = opts.port || 9;

	const
		magicPacket = createMagicPacket( mac ),
		udpType     = net.isIPv6( opts.address ) ? 'udp6' : 'udp4',
		socket      = dgram.createSocket( udpType );

	function wait( t ) {
		return new Promise(
			res => setTimeout( () => res(), t )
		);
	}

	function sendPacket() {
		return new Promise(
			( res, rej ) => socket.send(
				magicPacket, 0,
				magicPacket.length,
				opts.port,
				opts.address,
				err => err ? rej( err ) : res()
			)
		);
	}

	socket.on( 'error', sendPacket );
	socket.once( 'listening', () => socket.setBroadcast( true ) );

	for ( let i = 0; i < opts.packets; i++ ) {
		await sendPacket( i === opts.packets );
		await wait( opts.interval );
	}

	socket.close();

	return {
		status: 'sent',
		mac,
		...opts
	};
}
