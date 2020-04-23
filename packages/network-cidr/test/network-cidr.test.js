/** ****************************************************************************************************
 * File: network-cidr.test.js
 * Project: @mi-sec/network-cidr
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import chai from 'chai';

const { expect } = chai;

import NetworkCidr from '../lib/network-cidr.js';

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function() {
	it( 'longToIp should convert long to ip string', () => {
		// FF.FF.FF.FF
		expect( NetworkCidr.longToIp( 4294967295 ) )
			.to.be.a( 'string' )
			.to.equal( '255.255.255.255' );

		// C0.A8.01.01
		expect( NetworkCidr.longToIp( 3232235777 ) )
			.to.be.a( 'string' )
			.to.equal( '192.168.1.1' );
	} );

	it( 'ipToLong should convert ip to long number', () => {
		// FF.FF.FF.FF
		expect( NetworkCidr.ipToLong( '255.255.255.255' ) )
			.to.be.a( 'number' )
			.to.equal( 4294967295 );

		// C0.A8.01.01
		expect( NetworkCidr.ipToLong( '192.168.1.1' ) )
			.to.be.a( 'number' )
			.to.equal( 3232235777 );
	} );

	describe( 'expected errors', () => {
		it( 'should report invalid net parameter', () => {
			expect( () => new NetworkCidr( 4278190080 ) ).to.throw( 'invalid "net" parameter' );
		} );

		it( 'should report invalid network address (address too short)', () => {
			expect( () => new NetworkCidr( '0.0.0.0' ) )
				.to.throw( 'invalid network address: 0.0.0.0' );
		} );

		it( 'should report invalid network address (address too long)', () => {
			expect( () => new NetworkCidr( '1.1.1.1.1' ) )
				.to.throw( 'invalid network address: 1.1.1.1.1' );
		} );

		it( 'should report invalid network address (invalid address)', () => {
			expect( () => new NetworkCidr( 'badstring' ) )
				.to.throw( 'invalid network address: badstring' );
		} );

		it( 'should report invalid network address (invalid byte)', () => {
			expect( () => new NetworkCidr( '100.260.80' ) )
				.to.throw( 'invalid byte: 260' );
		} );

		it( 'should report invalid network address (address out of range /mask)', () => {
			expect( () => new NetworkCidr( '10.256.0.0/8' ) )
				.to.throw( 'invalid byte: 256' );
		} );

		it( 'should report invalid network address (address out of range /net)', () => {
			expect( () => new NetworkCidr( '10.256.0.0/10.0.0.0' ) )
				.to.throw( 'invalid byte: 256' );
		} );

		it( 'should report invalid mask (valid numeric range but out of mask range /net)', () => {
			expect( () => new NetworkCidr( '10.255.0.0/221.255.255.255' ) )
				.to.throw( 'invalid mask: 221.255.255.255' );
		} );

		it( 'should report invalid mask (valid numeric range but out of mask range /net)', () => {
			expect( () => new NetworkCidr( '218.0.0.4/218.0.0.12' ) )
				.to.throw( 'invalid mask: 218.0.0.12' );
		} );

		it( 'should report invalid mask (mask out of range /mask)', () => {
			expect( () => new NetworkCidr( '10.255.0.0/33' ) )
				.to.throw( 'invalid mask: 33' );
		} );

		it( 'should report invalid mask (mask out of range /net)', () => {
			expect( () => new NetworkCidr( '10.255.0.0/10.256.0.0' ) )
				.to.throw( 'invalid byte: 256' );
		} );
	} );

	describe( 'NetworkCidr methods', () => {
		it( 'NetworkCidr.contains', () => {
			const cidr = new NetworkCidr( '192.168.1.1/24' );

			expect( cidr.contains( '192.168.1.0' ) ).to.eq( true );
			expect( cidr.contains( '192.168.1.255' ) ).to.eq( true );

			expect( cidr.contains( '10.10.10.0' ) ).to.eq( false );
			expect( cidr.contains( '10.10.10.255' ) ).to.eq( false );

			expect( cidr.contains( '192.168.0.0' ) ).to.eq( false );
			expect( cidr.contains( '192.168.0.255' ) ).to.eq( false );

			expect( cidr.contains( '192.168.2.0' ) ).to.eq( false );
			expect( cidr.contains( '192.168.2.255' ) ).to.eq( false );

			expect( cidr.contains( '192.168.1.2' ) ).to.eq( true );
			expect( cidr.contains( '192.168.1.2/32' ) ).to.eq( true );

			expect( cidr.contains( '192.168.1.254' ) ).to.eq( true );
			expect( cidr.contains( '192.168.1.254/32' ) ).to.eq( true );

			expect( cidr.contains( '192.168.1.2/18' ) ).to.eq( false );
			expect( cidr.contains( '192.168.1.254/18' ) ).to.eq( false );

			expect( cidr.contains( '192.168.1.0/24' ) ).to.eq( true );
			expect( cidr.contains( '192.168.2.0/24' ) ).to.eq( false );
			expect( cidr.contains( '192.168.1' ) ).to.eq( true );
			expect( cidr.contains( '192.168.1.128/25' ) ).to.eq( true );
			expect( cidr.contains( '192.168.1.0/23' ) ).to.eq( false );
			expect( cidr.contains( '192.168.1.250/255.255.0.0' ) ).to.eq( false );
		} );

		it( 'NetworkCidr.forEach (/24 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/24' );
			const data = [];

			cidr.forEach( ( ip, i, c ) => data.push( { ip, i, c } ) );

			expect( data ).to.be.an( 'array' ).with.length( 254 );
			expect( data[ 0 ] ).to.deep.eq( { ip: '192.168.1.1', i: 0, c: cidr } );
			expect( data[ 253 ] ).to.deep.eq( { ip: '192.168.1.254', i: 253, c: cidr } );
		} );

		it( 'NetworkCidr.forEach (/20 network)', () => {
			const cidr = new NetworkCidr( '192.168.0.0/20' );
			const data = [];

			cidr.forEach( ( ip, i ) => data.push( { ip, i } ) );

			expect( data ).to.be.an( 'array' ).with.length( 4094 );
			expect( data[ 0 ] ).to.deep.eq( { ip: '192.168.0.1', i: 0 } );
			expect( data[ 255 ] ).to.deep.eq( { ip: '192.168.1.0', i: 255 } );
			expect( data[ 2047 ] ).to.deep.eq( { ip: '192.168.8.0', i: 2047 } );
			expect( data[ 4093 ] ).to.deep.eq( { ip: '192.168.15.254', i: 4093 } );
		} );

		it( 'NetworkCidr[Symbol.iterator]() (/24 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/24' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 254 );
			expect( data[ 0 ] ).to.eq( '192.168.1.1' );
			expect( data[ 253 ] ).to.eq( '192.168.1.254' );
		} );

		it( 'NetworkCidr[Symbol.iterator]() (/20 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/20' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 4094 );
			expect( data[ 0 ] ).to.eq( '192.168.0.1' );
			expect( data[ 4093 ] ).to.eq( '192.168.15.254' );
		} );

		it( 'NetworkCidr[Symbol.toPrimitive]()', () => {
			const cidr24 = new NetworkCidr( '192.168.1.0/24' );
			expect( +cidr24 ).to.be.a( 'number' ).and.eq( 254 );
			const cidr20 = new NetworkCidr( '192.168.1.0/20' );
			expect( +cidr20 ).to.be.a( 'number' ).and.eq( 4094 );
		} );
	} );

	describe( 'class a network', () => {
		it( '10.0.0.0/8', () => {
			const cidr = new NetworkCidr( '10.0.0.0/8' );
			expect( cidr ).to.be.instanceof( NetworkCidr );
			expect( cidr.bitmask ).to.be.a( 'number' ).and.eq( 8 );
			expect( cidr.maskLong ).to.be.a( 'number' ).and.eq( 4278190080 );
			expect( cidr.netLong ).to.be.a( 'number' ).and.eq( 167772160 );
			expect( cidr.size ).to.be.a( 'number' ).and.eq( 16777216 );
			expect( cidr.hosts ).to.be.a( 'number' ).and.eq( 16777214 );
			expect( cidr.base ).to.be.a( 'string' ).and.eq( '10.0.0.0' );
			expect( cidr.mask ).to.be.a( 'string' ).and.eq( '255.0.0.0' );
			expect( cidr.hostmask ).to.be.a( 'string' ).and.eq( '0.255.255.255' );
			expect( cidr.first ).to.be.a( 'string' ).and.eq( '10.0.0.1' );
			expect( cidr.last ).to.be.a( 'string' ).and.eq( '10.255.255.254' );
			expect( cidr.broadcast ).to.be.a( 'string' ).and.eq( '10.255.255.255' );
		} );
	} );

	describe( 'class b network', () => {
		it( '172.16.0.0/12', () => {
			const cidr = new NetworkCidr( '172.16.0.0/12' );
			expect( cidr ).to.be.instanceof( NetworkCidr );
			expect( cidr.bitmask ).to.be.a( 'number' ).and.eq( 12 );
			expect( cidr.maskLong ).to.be.a( 'number' ).and.eq( 4293918720 );
			expect( cidr.netLong ).to.be.a( 'number' ).and.eq( 2886729728 );
			expect( cidr.size ).to.be.a( 'number' ).and.eq( 1048576 );
			expect( cidr.hosts ).to.be.a( 'number' ).and.eq( 1048574 );
			expect( cidr.base ).to.be.a( 'string' ).and.eq( '172.16.0.0' );
			expect( cidr.mask ).to.be.a( 'string' ).and.eq( '255.240.0.0' );
			expect( cidr.hostmask ).to.be.a( 'string' ).and.eq( '0.15.255.255' );
			expect( cidr.first ).to.be.a( 'string' ).and.eq( '172.16.0.1' );
			expect( cidr.last ).to.be.a( 'string' ).and.eq( '172.31.255.254' );
			expect( cidr.broadcast ).to.be.a( 'string' ).and.eq( '172.31.255.255' );
		} );
	} );

	describe( 'class c network', () => {
		it( '192.168.0.0/16', () => {
			const cidr = new NetworkCidr( '192.168.0.0/16' );
			expect( cidr ).to.be.instanceof( NetworkCidr );
			expect( cidr.bitmask ).to.be.a( 'number' ).and.eq( 16 );
			expect( cidr.maskLong ).to.be.a( 'number' ).and.eq( 4294901760 );
			expect( cidr.netLong ).to.be.a( 'number' ).and.eq( 3232235520 );
			expect( cidr.size ).to.be.a( 'number' ).and.eq( 65536 );
			expect( cidr.hosts ).to.be.a( 'number' ).and.eq( 65534 );
			expect( cidr.base ).to.be.a( 'string' ).and.eq( '192.168.0.0' );
			expect( cidr.mask ).to.be.a( 'string' ).and.eq( '255.255.0.0' );
			expect( cidr.hostmask ).to.be.a( 'string' ).and.eq( '0.0.255.255' );
			expect( cidr.first ).to.be.a( 'string' ).and.eq( '192.168.0.1' );
			expect( cidr.last ).to.be.a( 'string' ).and.eq( '192.168.255.254' );
			expect( cidr.broadcast ).to.be.a( 'string' ).and.eq( '192.168.255.255' );
		} );
	} );

} );
