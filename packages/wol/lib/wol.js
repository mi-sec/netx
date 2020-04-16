/** ****************************************************************************************************
 * File: wol.js
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

/**
 * wakeOnLan
 * @description
 * send wake on lan magic packet to MAC Address of the NIC and broadcast IP
 * @param {string} mac - MAC Address of the network interface card
 *
 * @param {object} [opts={}]
 * wake on lan options
 *
 * @param {string} [opts.address='255.255.255.255']
 * Broadcast address. For a NIC on your local subnet, use the broadcast-address of this subnet.
 * Ex: subnet 192.168.1.0 with netmask 255.255.255.0, use 192.168.1.255)
 *
 * @param {number} [opts.packets=3]
 * number of magic packets to send to host
 *
 * @param {number} [opts.interval=100]
 * amount of time to wait between packets
 *
 * @param {number} [opts.port=9]
 * port to send wake on lan request to (default to port 9)
 * "officially" Stream Control Transmission Protocol or "Discard port" but unofficially used for Wake On LAN
 *
 * @return {Promise<{mac: *, status: string}>}
 * returns status "sent" but because this sends over UDP.
 * But there is no way to verify the host received it because the host is expected to be shut off and the nature of UDP
 * is to not expect a response
 */
async function wakeOnLan( mac, opts = {} ) {
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
			( res ) => setTimeout( () => res(), t )
		);
	}

	function sendPacket() {
		return new Promise(
			( res, rej ) => socket.send(
				magicPacket, 0,
				magicPacket.length,
				opts.port,
				opts.address,
				( err ) => err ? rej( err ) : res()
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

export default wakeOnLan;
