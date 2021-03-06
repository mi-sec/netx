/** ****************************************************************************************************
 * File: port-scanner.test.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	chai       = require( 'chai' ),
	net        = require( 'net' ),
	{ expect } = chai;

const
	PortScanner = require( '../lib/port-scanner' ),
	{
		commonPorts,
		TCPConnect,
		convertHighResolutionTime
	}           = PortScanner;

const
	host   = '127.0.0.1/32',
	banner = 'hello\r\n';

// TODO: these tests are a bit flaky and rely on assumed compute drift timeouts. circle back sometime
describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version } localhost`, function () {
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
		const result = new PortScanner( { host } );

		result.on( 'ready', ( d ) => {
			expect( d ).to.be.an( 'object' );
			expect( d ).to.have.property( 'cidr' );
			expect( d.cidr ).to.have.property( 'base' ).and.eq( '127.0.0.1' );
			expect( d.cidr ).to.have.property( 'bitmask' ).and.eq( 32 );

			expect( d.ports ).to.deep.eq( [ ...commonPorts.keys() ] );
			done();
		} );
	} );

	it( '[TCPConnect] should throw error if missing options', () => {
		expect( () => new TCPConnect( {} ) ).to.throw( 'TCPConnect opts.host is required' );
		expect( () => new TCPConnect( { host } ) ).to.throw( 'TCPConnect opts.port is required' );
	} );

	it( 'static.isRange', () => {
		expect( PortScanner.isRange() ).to.eq( false );
		expect( PortScanner.isRange( 1 ) ).to.eq( false );
		expect( PortScanner.isRange( [] ) ).to.eq( false );
		expect( PortScanner.isRange( '' ) ).to.eq( false );
		expect( PortScanner.isRange( '-' ) ).to.eq( false );
		expect( PortScanner.isRange( 'a-b' ) ).to.eq( false );
		expect( PortScanner.isRange( '1A-2B' ) ).to.eq( false );
		expect( PortScanner.isRange( '1' ) ).to.eq( false );
		expect( PortScanner.isRange( '1-' ) ).to.eq( false );
		expect( PortScanner.isRange( '1-2' ) ).to.eq( true );
		expect( PortScanner.isRange( '11-22' ) ).to.eq( true );
		expect( PortScanner.isRange( '111-222' ) ).to.eq( true );
	} );

	it( 'static.portRangeIterator', () => {
		const p  = [ 1, 2, '3-5', 6, '7-10' ];
		const _p = [];
		for ( const port of PortScanner.portRangeIterator( p ) ) {
			_p.push( port );
		}

		expect( _p ).to.have.length( 10 )
			.and.to.deep.eq( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
	} );

	it( 'should iterate and parse range of ports', ( done ) => {
		const
			portList = [ 22, '50-60', 70, '70-110', 501, 502, '503-504' ],
			result   = new PortScanner( {
				host,
				ports: portList,
				onlyReportOpen: false
			} );

		result
			.on( 'ready', async ( d ) => {
				await result.scan();
				expect( d.ports ).to.deep.eq( portList );
			} )
			.on( 'done', ( d ) => {
				expect( d.size ).to.eq( 57 );
				done();
			} );
	} );

	it( `should scan target ${ host } and determine "open" with banner "hello\\r\\n"`, async () => {
		const result = new PortScanner( {
			host,
			ports,
			attemptToIdentify: true
		} );

		let
			data     = [],
			progress = 0,
			done     = null;

		result
			.on( 'data', ( d ) => data = d )
			.on( 'progress', ( d ) => progress = d )
			.on( 'done', ( d ) => done = d );

		await result.scan();

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

	it( `should scan target ${ host } and determine "open" without banner`, async () => {
		const result = new PortScanner( {
			host,
			ports,
			bannerGrab: false,
			attemptToIdentify: true
		} );

		let
			data     = [],
			progress = 0,
			done     = null;

		result
			.on( 'data', ( d ) => data = d )
			.on( 'progress', ( d ) => progress = d )
			.on( 'done', ( d ) => done = d );

		await result.scan();

		expect( data ).to.be.an( 'object' );
		expect( data ).to.have.property( 'host' ).and.be.a( 'string' ).and.eq( host.split( '/' )[ 0 ] );
		expect( data ).to.have.property( 'port' ).and.be.a( 'number' ).and.eq( ports[ 0 ] );
		expect( data ).to.have.property( 'banner' ).and.be.a( 'string' ).and.eq( '' );
		expect( data ).to.have.property( 'error' ).and.be.a( 'boolean' ).and.eq( false );
		expect( data ).to.have.property( 'status' ).and.be.a( 'string' ).and.eq( 'open' );
		expect( data ).to.have.property( 'opened' ).and.be.a( 'boolean' ).and.eq( true );
		expect( data ).to.have.property( 'time' ).and.be.a( 'number' ).and.be.lte( 5.0 );
		expect( data ).to.have.property( 'service' ).and.be.a( 'string' ).and.eq( 'unknown' );

		expect( progress ).to.be.a( 'number' ).and.eq( 1 );

		const key = `${ data.host }:${ data.port }`;
		expect( done.has( key ) ).to.eq( true );
		expect( done.get( key ) ).to.deep.eq( data );
	} );

	it( `should scan target ${ host } and determine "timeout"`, async () => {
		const port = ports[ 0 ];
		const scan = await new TCPConnect( {
			host,
			port,
			timeout: 1,
			debug: true,
			onlyReportOpen: true
		} ).scan();

		expect( scan ).to.be.an( 'object' );
		expect( scan ).to.have.property( 'host' ).and.eq( host );
		expect( scan ).to.have.property( 'port' ).and.eq( port );
		expect( scan ).to.have.property( 'banner' ).and.eq( '' );
		expect( scan ).to.have.property( 'error' ).and.eq( false );
		expect( scan ).to.have.property( 'status' ).and.eq( 'closed (timeout)' );
		expect( scan ).to.have.property( 'opened' ).and.eq( false );
	} );

	it( `should scan target ${ host } and determine "close"`, async () => {
		server.close();

		const start  = process.hrtime();
		const result = new PortScanner( {
			host,
			// throw this in to cover "to array" in constructor
			ports: ports[ 0 ],
			debug: true,
			onlyReportOpen: false
		} );

		let
			data     = [],
			progress = 0,
			done     = null;

		result
			.on( 'data', ( d ) => data = d )
			.on( 'progress', ( d ) => progress = d )
			.on( 'done', ( d ) => done = d );

		await result.scan();
		const end = convertHighResolutionTime( process.hrtime( start ) );

		expect( end ).to.be.lte( 10.0 );

		expect( data ).to.be.an( 'object' );
		expect( data ).to.have.property( 'host' ).and.be.a( 'string' ).and.eq( host.split( '/' )[ 0 ] );
		expect( data ).to.have.property( 'port' ).and.be.a( 'number' ).and.eq( ports[ 0 ] );
		expect( data ).to.have.property( 'banner' ).and.be.a( 'string' ).and.eq( '' );
		expect( data ).to.have.property( 'error' ).and.be.a( 'boolean' ).and.eq( true );
		expect( data ).to.have.property( 'status' ).and.be.a( 'string' ).and.eq( 'closed (refused)' );
		expect( data ).to.have.property( 'opened' ).and.be.a( 'boolean' ).and.eq( false );
		expect( data ).to.have.property( 'time' ).and.be.a( 'number' );
		expect( data ).to.have.property( 'service' ).and.be.a( 'string' ).and.eq( 'unknown' );

		expect( progress ).to.be.a( 'number' ).and.eq( 1 );

		const key = `${ data.host }:${ data.port }`;
		expect( done.has( key ) ).to.eq( true );
		expect( done.get( key ) ).to.deep.eq( data );
	} );

	it( `should scan target ${ host } and determine "close" and not report it`, async () => {
		server.close();

		const result = new PortScanner( {
			host,
			ports,
			onlyReportOpen: true
		} );

		let
			data     = [],
			progress = 0,
			done     = null;

		result
			.on( 'data', ( d ) => data = d )
			.on( 'progress', ( d ) => progress = d )
			.on( 'done', ( d ) => done = d );

		await result.scan();

		expect( data ).to.be.an( 'array' );
		expect( data ).to.deep.eq( [] );
		expect( progress ).to.be.a( 'number' ).and.eq( 1 );

		const key = `127.0.0.1:${ ports[ 0 ] }`;
		expect( done.has( key ) ).to.eq( false );
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
		ports = [ 22, 5900, 9000 ];

	it( 'should emit "ready" with options and scan common ports', ( done ) => {
		const result = new PortScanner( { host } );

		result.on( 'ready', ( d ) => {
			expect( d ).to.be.an( 'object' );
			expect( d ).to.have.property( 'cidr' );
			const t = host.split( '/' );
			expect( d.cidr ).to.have.property( 'base' ).and.eq( t[ 0 ] );
			expect( d.cidr ).to.have.property( 'bitmask' ).and.eq( +t[ 1 ] );

			expect( d.ports ).to.deep.eq( [ ...commonPorts.keys() ] );
			done();
		} );
	} );

	it( `should scan target ${ host } for SSH (22), VNC (5900), AUX (9000)`, ( done ) => {
		const result = new PortScanner( {
			host,
			ports,
			timeout: 500,
			attemptToIdentify: true
		} );

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

				expect( d.size ).to.eq( 3 );
				expect( d.has( '127.0.0.1:22' ) ).to.eq( true );

				delete d.get( '127.0.0.1:22' ).time;
				expect( d.get( '127.0.0.1:22' ) ).to.deep.eq( {
					host: '127.0.0.1',
					port: 22,
					banner: 'SSH-2.0-OpenSSH_7.9\r\n',
					error: false,
					status: 'open',
					opened: true,
					service: 'ssh'
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
