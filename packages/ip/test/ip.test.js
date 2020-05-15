/** ****************************************************************************************************
 * File: mac-address.test.js
 * Project: @mi-sec/ip
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	chai       = require( 'chai' ),
	{ expect } = chai;

const ip = require( '../lib/ip' );

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function () {
	it( 'NetworkCidr.longToIp should convert long to ip string', () => {
		// FF.FF.FF.FF
		expect( ip.longToIp( 4294967295 ) )
			.to.be.a( 'string' )
			.to.equal( '255.255.255.255' );

		// C0.A8.01.01
		expect( ip.longToIp( 3232235777 ) )
			.to.be.a( 'string' )
			.to.equal( '192.168.1.1' );
	} );

	it( 'NetworkCidr.ipToLong should convert ip to long number', () => {
		// FF.FF.FF.FF
		expect( ip.ipToLong( '255.255.255.255' ) )
			.to.be.a( 'number' )
			.to.equal( 4294967295 );

		// C0.A8.01.01
		expect( ip.ipToLong( '192.168.1.1' ) )
			.to.be.a( 'number' )
			.to.equal( 3232235777 );
	} );
} );
