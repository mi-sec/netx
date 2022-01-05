/** ****************************************************************************************************
 * File: ip.test.js
 * Project: @mi-sec/ip
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	chai       = require( 'chai' ),
	{ expect } = chai;

const ip = require( '../lib/ip' );

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function () {
	it( 'validIPv4 should verify ipv4 strings', () => {
		expect( ip.validIPv4( '255.255.255.255' ) ).to.equal( true );
		expect( ip.validIPv4( '192.168.1.1' ) ).to.equal( true );
		expect( ip.validIPv4( '0.0.0.0' ) ).to.equal( true );
		expect( ip.validIPv4( 'localhost' ) ).to.equal( true );
		expect( ip.validIPv4( '0.0.0' ) ).to.equal( false );
		expect( ip.validIPv4( '256.255.255.255' ) ).to.equal( false );
		expect( ip.validIPv4( '1.1.1.-1' ) ).to.equal( false );
		expect( ip.validIPv4( 'A.B.C.D' ) ).to.equal( false );
	} );

	it( 'longToIp should convert long to ip string', () => {
		expect( ip.longToIp( 4294967295 ) )
			.to.be.a( 'string' )
			.to.equal( '255.255.255.255' );

		expect( ip.longToIp( 3232235777 ) )
			.to.be.a( 'string' )
			.to.equal( '192.168.1.1' );

		expect( ip.longToIp( 0 ) )
			.to.be.a( 'string' )
			.to.equal( '0.0.0.0' );

		expect( () => ip.longToIp( -1 ) )
			.to.throw( 'invalid long: -1' );
	} );

	it( 'ipToLong should convert ip to long number', () => {
		expect( ip.ipToLong( '255.255.255.255' ) )
			.to.be.a( 'number' )
			.to.equal( 4294967295 );

		expect( ip.ipToLong( '192.168.1.1' ) )
			.to.be.a( 'number' )
			.to.equal( 3232235777 );

		expect( ip.ipToLong( '0.0.0.0' ) )
			.to.be.a( 'number' )
			.to.equal( 0 );

		expect( ip.ipToLong( 'localhost' ) )
			.to.be.a( 'number' )
			.to.equal( 0x7F000001 );

		expect( () => ip.ipToLong( '0.0.0.0.0' ) )
			.to.throw( 'invalid ip' );

		expect( () => ip.ipToLong( 'A.A.A.A' ) )
			.to.throw( 'invalid byte: NaN' );
	} );
} );
