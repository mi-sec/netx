/** ****************************************************************************************************
 * File: port-scanner.test.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	net        = require( 'net' ),
	chai       = require( 'chai' ),
	{ expect } = chai;

const
	PortScanner                   = require( '../lib/port-scanner' ),
	{ convertHighResolutionTime } = PortScanner;

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version } localhost`, function () {
	const
		host   = '127.0.0.1/32',
		banner = 'hello\r\n';

	let server, ports;

	beforeEach( ( done ) => {
		server = net.createServer( ( socket ) => {
			socket.write( banner );
			socket.pipe( socket );
		} );

		server.listen( () => {
			ports = [ server.address().port ];
			done();
		} );
	} );

	afterEach( ( done ) => {
		server.close( () => done() );
	} );

	it( 'should emit "ready" with options', ( done ) => {
		const result = new PortScanner( { host, ports } );

		result.on( 'ready', ( d ) => {
			expect( d ).to.be.an( 'object' );
			expect( d ).to.have.property( 'cidr' );
			expect( d.cidr ).to.have.property( 'base' ).and.eq( '127.0.0.1' );
			expect( d.cidr ).to.have.property( 'bitmask' ).and.eq( 32 );
			done();
		} );
	} );

	it( `should scan target ${ host } and determine it "open" with banner "hello\\r\\n"`, async () => {
		const start  = process.hrtime();
		const result = new PortScanner( { host, ports, attemptToIdentify: true } );

		let data, progress, done;

		result
			.on( 'data', ( d ) => data = d )
			.on( 'progress', ( d ) => progress = d )
			.on( 'done', ( d ) => done = d );

		await result.scan();

		const end = convertHighResolutionTime( process.hrtime( start ) );

		expect( end ).to.be.lte( 5.0 );

		expect( data ).to.be.an( 'object' );
		expect( data ).to.have.property( 'host' ).and.be.a( 'string' ).and.eq( host.split( '/' )[ 0 ] );
		expect( data ).to.have.property( 'port' ).and.be.a( 'number' ).and.eq( ports[ 0 ] );
		expect( data ).to.have.property( 'status' ).and.be.a( 'string' ).and.eq( 'open' );
		expect( data ).to.have.property( 'banner' ).and.be.a( 'string' ).and.eq( banner );
		expect( data ).to.have.property( 'time' ).and.be.a( 'number' ).and.be.lte( 5.0 );
		expect( data ).to.have.property( 'service' ).and.be.a( 'string' ).and.eq( 'unknown' );

		expect( progress ).to.be.a( 'number' ).and.eq( 1 );

		const key = `${ data.host }:${ data.port }`;
		expect( done.has( key ) ).to.eq( true );
		expect( done.get( key ) ).to.deep.eq( data );
	} );

	it( `should scan target ${ host } and determine it "close"`, async () => {
		server.close();

		const start  = process.hrtime();
		const result = new PortScanner( { host, ports, onlyReportOpen: false } );

		let data, progress, done;

		result
			.on( 'data', ( d ) => data = d )
			.on( 'progress', ( d ) => progress = d )
			.on( 'done', ( d ) => done = d );

		await result.scan();
		const end = convertHighResolutionTime( process.hrtime( start ) );

		expect( end ).to.be.lte( 5.0 );

		expect( data ).to.be.an( 'object' );
		expect( data ).to.have.property( 'host' ).and.be.a( 'string' ).and.eq( host.split( '/' )[ 0 ] );
		expect( data ).to.have.property( 'port' ).and.be.a( 'number' ).and.eq( ports[ 0 ] );
		expect( data ).to.have.property( 'status' ).and.be.a( 'string' ).and.eq( 'closed' );
		expect( data ).to.not.have.property( 'banner' );
		expect( data ).to.not.have.property( 'time' );
		expect( data ).to.not.have.property( 'service' );

		expect( progress ).to.be.a( 'number' ).and.eq( 1 );

		const key = `${ data.host }:${ data.port }`;
		expect( done.has( key ) ).to.eq( true );
		expect( done.get( key ) ).to.deep.eq( data );
	} );

	after( ( done ) => {
		server.close( () => {
			server = null;
			done();
		} );
	} );
} );

describe( [
	`${ process.env.npm_package_name } v${ process.env.npm_package_version } external network`,
	'\t<WARNING - THESE TESTS WILL ONLY WORK ON SPECIFIC NETWORK CONFIGURATION>',
	'\tbecause it is impractical to run tests on specific network setups,',
	'\tthese tests are skipped by default because they require services running on reserved ports',
	'\tspecify `npm run testing` to execute the following tests'
].join( '\n' ), function () {

	before( function () {
		if ( process.env.NODE_ENV !== 'TESTING' ) {
			this.skip();
		}
	} );

	this.timeout( 10000 );

	const
		host  = '127.0.0.1/32',
		ports = [ 22, 80, 5900, 9000 ];

	it( 'should emit "ready" with options', ( done ) => {
		const result = new PortScanner( { host, ports } );

		result.on( 'ready', ( d ) => {
			expect( d ).to.be.an( 'object' );
			expect( d ).to.have.property( 'cidr' );
			const t = host.split( '/' );
			expect( d.cidr ).to.have.property( 'base' ).and.eq( t[ 0 ] );
			expect( d.cidr ).to.have.property( 'bitmask' ).and.eq( +t[ 1 ] );
			done();
		} );
	} );

	it( `should scan target ${ host } for SSH (22), HTTP (80), VNC (5900), AUX (9000)`, ( done ) => {
		const result = new PortScanner( { host, ports, timeout: 100, attemptToIdentify: true } );
		const data   = [];
		let progress = 0;

		result
			.on( 'ready', async () => {
				await result.scan();
			} )
			.on( 'data', ( d ) => data.push( d ) )
			.on( 'progress', ( d ) => progress = d )
			.on( 'done', ( d ) => {
				expect( progress ).to.be.a( 'number' ).and.eq( 1 );
				y;

				expect( d.size ).to.eq( 4 );
				expect( d.has( '127.0.0.1:80' ) ).to.eq( true );
				expect( d.get( '127.0.0.1:80' ) ).to.deep.eq( {
					host: '127.0.0.1',
					port: 80,
					status: 'closed'
				} );

				const
					ssh = data.find( i => i ? i.port === 22 : false ),
					vnc = data.find( i => i ? i.port === 5900 : false );

				expect( ssh ).to.be.an( 'object' );
				expect( ssh ).and.have.property( 'status' ).and.eq( 'open' );
				expect( ssh ).and.have.property( 'banner' ).and.satisfy( ( msg ) => msg.startsWith( 'SSH-2.0' ) );
				expect( ssh ).and.have.property( 'service' ).and.eq( 'ssh' );

				expect( vnc ).to.be.an( 'object' );
				expect( vnc ).and.have.property( 'status' ).and.eq( 'open' );
				expect( vnc ).and.have.property( 'banner' ).and.satisfy( ( msg ) => msg.startsWith( 'RFB' ) );
				expect( vnc ).and.have.property( 'service' ).and.eq( 'vnc' );

				done();
			} );
	} );
} );
