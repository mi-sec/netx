/** ****************************************************************************************************
 * File: port-scanner.test.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import net  from 'net';
import chai from 'chai';

const { expect } = chai;

import scan, { convertHighResolutionTime } from '../lib/port-scanner.js';

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function() {
	const
		host   = '127.0.0.1',
		banner = 'hello\r\n';

	let server, port;

	beforeEach( ( done ) => {
		server = net.createServer( ( socket ) => {
			socket.write( banner );
			socket.pipe( socket );
		} );

		server.listen( () => {
			port = server.address().port;
			done();
		} );
	} );

	afterEach( ( done ) => {
		server.close( () => done() );
	} );

	it( `should scan target ${ host } and determine it "open" with banner "hello\\r\\n"`, async () => {
		const start  = process.hrtime();
		const result = await scan( { host, port } );
		const end    = convertHighResolutionTime( process.hrtime( start ) );

		expect( end ).to.be.lte( 5.0 );

		expect( result ).to.be.an( 'array' ).and.have.length( 1 );
		expect( result[ 0 ] ).to.be.an( 'object' );

		expect( result[ 0 ] ).to.have.property( 'host' ).and.be.a( 'string' ).and.eq( host );
		expect( result[ 0 ] ).to.have.property( 'port' ).and.be.a( 'number' ).and.eq( port );
		expect( result[ 0 ] ).to.have.property( 'status' ).and.be.a( 'string' ).and.eq( 'open' );
		expect( result[ 0 ] ).to.have.property( 'banner' ).and.be.a( 'string' ).and.eq( banner );
		expect( result[ 0 ] ).to.have.property( 'time' ).and.be.a( 'number' ).and.be.lte( 5.0 );
		expect( result[ 0 ] ).to.have.property( 'service' ).and.be.a( 'string' ).and.eq( 'unknown' );
	} );

	it( `should scan target ${ host } and determine it "close"`, async () => {
		server.close();

		const start  = process.hrtime();
		const result = await scan( { host, port, onlyReportOpen: false } );
		const end    = convertHighResolutionTime( process.hrtime( start ) );

		expect( end ).to.be.lte( 5.0 );

		expect( result ).to.be.an( 'array' ).and.have.length( 1 );
		expect( result[ 0 ] ).to.be.an( 'object' );

		expect( result[ 0 ] ).to.have.property( 'host' ).and.be.a( 'string' ).and.eq( host );
		expect( result[ 0 ] ).to.have.property( 'port' ).and.be.a( 'number' ).and.eq( port );
		expect( result[ 0 ] ).to.have.property( 'status' ).and.be.a( 'string' ).and.eq( 'closed' );
		expect( result[ 0 ] ).to.not.have.property( 'banner' );
		expect( result[ 0 ] ).to.not.have.property( 'time' );
		expect( result[ 0 ] ).to.not.have.property( 'service' );
	} );

	after( ( done ) => {
		server.close( () => {
			server = null;
			done();
		} );
	} );
} );
