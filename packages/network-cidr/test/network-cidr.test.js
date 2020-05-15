/** ****************************************************************************************************
 * File: network-cidr.test.js
 * Project: @mi-sec/network-cidr
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	chai       = require( 'chai' ),
	{ expect } = chai;

const NetworkCidr = require( '../lib/network-cidr' );

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function () {
	it( 'should create a NetworkCidr instance', () => {
		const
			net  = new NetworkCidr( '192.168.1.0' ),
			host = new NetworkCidr( '192.168.1.1' );

		expect( net.constructor.name ).to.eq( 'NetworkCidr' );
		expect( net.bitmask ).to.eq( 24 );

		expect( host.constructor.name ).to.eq( 'NetworkCidr' );
		expect( host.bitmask ).to.eq( 32 );
	} );

	it( 'should convert localhost to 0x7F000001', () => {
		const localhost = new NetworkCidr( 'localhost' );
		expect( localhost.netLong ).to.eq( 0x7F000001 );
		expect( localhost.bitmask ).to.eq( 32 );
	} );

	describe( 'expected errors', () => {
		it( 'missing net parameter', () => {
			expect( () => new NetworkCidr() ).to.throw( 'invalid "net" parameter' );
		} );

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

		it( 'NetworkCidr.forEach (/32 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.1/32' );
			const data = [];

			cidr.forEach( ( ip, i, c ) => data.push( { ip, i, c } ) );

			expect( data ).to.be.an( 'array' ).with.length( 1 );
			expect( data[ 0 ] ).to.deep.eq( { ip: '192.168.1.1', i: 0, c: cidr } );
		} );

		it( 'NetworkCidr.forEach (/24 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/24' );
			const data = [];

			cidr.forEach( ( ip, i, c ) => data.push( { ip, i, c } ) );

			expect( data ).to.be.an( 'array' ).with.length( 256 );
			expect( data[ 0 ] ).to.deep.eq( { ip: '192.168.1.0', i: 0, c: cidr } );
			expect( data[ 255 ] ).to.deep.eq( { ip: '192.168.1.255', i: 255, c: cidr } );
		} );

		it( 'NetworkCidr.forEach (/20 network)', () => {
			const cidr = new NetworkCidr( '192.168.0.0/20' );
			const data = [];

			cidr.forEach( ( ip, i ) => data.push( { ip, i } ) );

			expect( data ).to.be.an( 'array' ).with.length( 4096 );
			expect( data[ 0 ] ).to.deep.eq( { ip: '192.168.0.0', i: 0 } );
			expect( data[ 256 ] ).to.deep.eq( { ip: '192.168.1.0', i: 256 } );
			expect( data[ 2048 ] ).to.deep.eq( { ip: '192.168.8.0', i: 2048 } );
			expect( data[ 4094 ] ).to.deep.eq( { ip: '192.168.15.254', i: 4094 } );
		} );

		it( 'NetworkCidr[Symbol.iterator]() (/32 network)', () => {
			const cidr = new NetworkCidr( '127.0.0.1/32' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 1 );
			expect( data[ 0 ] ).to.eq( '127.0.0.1' );
		} );

		it( 'NetworkCidr[Symbol.iterator]() (/30 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/30' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 4 );
			expect( data[ 0 ] ).to.eq( '192.168.1.0' );
			expect( data[ 3 ] ).to.eq( '192.168.1.3' );
		} );

		it( 'NetworkCidr[Symbol.iterator]() (/24 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/24' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 256 );
			expect( data[ 0 ] ).to.eq( '192.168.1.0' );
			expect( data[ 255 ] ).to.eq( '192.168.1.255' );
		} );

		it( 'NetworkCidr[Symbol.iterator]() (/20 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/20' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 4096 );
			expect( data[ 0 ] ).to.eq( '192.168.0.0' );
			expect( data[ 4095 ] ).to.eq( '192.168.15.255' );
		} );

		it( 'NetworkCidr.hosts() (/32 network)', () => {
			const cidr = new NetworkCidr( '127.0.0.1/32' );
			const data = [];

			for ( const ip of cidr.hosts() ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 1 );
			expect( data[ 0 ] ).to.eq( '127.0.0.1' );
		} );

		it( 'NetworkCidr.hosts() (/30 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/30' );
			const data = [];

			for ( const ip of cidr.hosts() ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 2 );
			expect( data[ 0 ] ).to.eq( '192.168.1.1' );
			expect( data[ 1 ] ).to.eq( '192.168.1.2' );
		} );

		it( 'NetworkCidr.hosts() (/24 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/24' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 256 );
			expect( data[ 0 ] ).to.eq( '192.168.1.0' );
			expect( data[ 255 ] ).to.eq( '192.168.1.255' );
		} );

		it( 'NetworkCidr.hosts() (/20 network)', () => {
			const cidr = new NetworkCidr( '192.168.1.0/20' );
			const data = [];

			for ( const ip of cidr ) {
				data.push( ip );
			}

			expect( data ).to.be.an( 'array' ).with.length( 4096 );
			expect( data[ 0 ] ).to.eq( '192.168.0.0' );
			expect( data[ 4095 ] ).to.eq( '192.168.15.255' );
		} );

		it( 'NetworkCidr.toJSON', () => {
			const cidr24 = new NetworkCidr( '192.168.1.0/24' );
			expect( JSON.stringify( cidr24 ) )
				.to.eq( JSON.stringify( {
				bitmask: 24,
				maskLong: 4294967040,
				netLong: 3232235776,
				size: 256,
				base: '192.168.1.0',
				mask: '255.255.255.0',
				hostmask: '0.0.0.255',
				firstd: 3232235776,
				first: '192.168.1.0',
				lastd: 3232236031,
				last: '192.168.1.255',
				broadcast: '192.168.1.255'
			} ) );
		} );

		it( 'NetworkCidr[Symbol.toPrimitive]()', () => {
			const cidr24 = new NetworkCidr( '192.168.1.0/24' );
			const cidr20 = new NetworkCidr( '192.168.1.0/20' );

			expect( +cidr24 ).to.be.a( 'number' ).and.eq( 256 );
			expect( +cidr20 ).to.be.a( 'number' ).and.eq( 4096 );

			expect( '' + cidr24 ).to.be.a( 'string' ).and.eq( '192.168.1.0/24' );
			expect( '' + cidr20 ).to.be.a( 'string' ).and.eq( '192.168.0.0/20' );
		} );

		it( 'NetworkCidr[Symbol.toStringTag]()', () => {
			expect( Object.prototype.toString.call( new NetworkCidr( '192.168.1.0/24' ) ) )
				.to.be.a( 'string' )
				.and.eq( '[object NetworkCidr]' );
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
			expect( cidr.base ).to.be.a( 'string' ).and.eq( '10.0.0.0' );
			expect( cidr.mask ).to.be.a( 'string' ).and.eq( '255.0.0.0' );
			expect( cidr.hostmask ).to.be.a( 'string' ).and.eq( '0.255.255.255' );
			expect( cidr.first ).to.be.a( 'string' ).and.eq( '10.0.0.0' );
			expect( cidr.last ).to.be.a( 'string' ).and.eq( '10.255.255.255' );
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
			expect( cidr.base ).to.be.a( 'string' ).and.eq( '172.16.0.0' );
			expect( cidr.mask ).to.be.a( 'string' ).and.eq( '255.240.0.0' );
			expect( cidr.hostmask ).to.be.a( 'string' ).and.eq( '0.15.255.255' );
			expect( cidr.first ).to.be.a( 'string' ).and.eq( '172.16.0.0' );
			expect( cidr.last ).to.be.a( 'string' ).and.eq( '172.31.255.255' );
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
			expect( cidr.base ).to.be.a( 'string' ).and.eq( '192.168.0.0' );
			expect( cidr.mask ).to.be.a( 'string' ).and.eq( '255.255.0.0' );
			expect( cidr.hostmask ).to.be.a( 'string' ).and.eq( '0.0.255.255' );
			expect( cidr.first ).to.be.a( 'string' ).and.eq( '192.168.0.0' );
			expect( cidr.last ).to.be.a( 'string' ).and.eq( '192.168.255.255' );
			expect( cidr.broadcast ).to.be.a( 'string' ).and.eq( '192.168.255.255' );
		} );
	} );

} );
