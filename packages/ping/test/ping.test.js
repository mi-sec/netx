/** ****************************************************************************************************
 * File: ping.test.js
 * Project: @mi-sec/ping
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import chai from 'chai';

const { expect } = chai;

import ICMPSession, { createICMPSession } from '../lib/ping.js';

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function() {
	let session = null;

	afterEach( () => {
		session.close();
		session = null;
	} );

	it( 'createICMPSession should return instance of ICMPSession', () => {
		session = createICMPSession( {} );
		expect( session ).to.be.instanceOf( ICMPSession );
	} );
	
	it( 'ICMPSession should bind to socket messages and send ping to "127.0.0.1"', ( done ) => {
		session = createICMPSession( {} );
	
		session.on( 'message', ( msg ) => {
			expect( msg ).to.be.an( 'object' );
			done();
		} );
	
		session.pingHost( '127.0.0.1' );
	} );
	
	it( 'ICMPSession should increment icmp sequence id', ( done ) => {
		session = createICMPSession( {} );
	
		let id = 0;
		session.on( 'message', ( msg ) => {
			expect( msg ).to.have.property( 'id' ).and.eq( ++id );
			if ( id === 2 ) {
				done();
			}
		} );
	
		session.pingHost( '127.0.0.1' );
		session.pingHost( '127.0.0.1' );
	} );
	
	it( 'ICMPSession should respond with target', ( done ) => {
		session = createICMPSession( {} );
	
		session.on( 'message', ( msg ) => {
			expect( msg ).to.have.property( 'target' ).and.eq( '127.0.0.1' );
			done();
		} );
	
		session.pingHost( '127.0.0.1' );
	} );
	
	it( 'ICMPSession should set defaults', ( done ) => {
		session = createICMPSession( {} );
	
		session.on( 'message', ( msg ) => {
			expect( msg ).to.have.property( 'retries' ).and.eq( 1 );
			expect( msg ).to.have.property( 'timeout' ).and.eq( 2000 );
			done();
		} );
	
		session.pingHost( '127.0.0.1' );
	} );
	
	it( 'ICMPSession should create buffer beginning with header byte 0x8 "IPv4 ICMP ECHO REQUEST"', ( done ) => {
		session = createICMPSession( {} );
	
		session.on( 'message', ( msg ) => {
			expect( msg ).to.have.property( 'buffer' ).and.be.instanceOf( Buffer );
			expect( msg.buffer.slice( 0, 2 ) ).and.deep.eq( Buffer.from( [ 0x08, 0x00 ] ) );
			done();
		} );
	
		session.pingHost( '127.0.0.1' );
	} );

	it( 'ICMPSession should create buffer beginning with header byte 0x80 "IPv6 ICMP6 ECHO REQUEST"', ( done ) => {
		session = createICMPSession( {
			protocol: 'IPv6'
		} );

		session.on( 'message', ( msg ) => {
			console.log( msg );
			expect( msg ).to.have.property( 'buffer' ).and.be.instanceOf( Buffer );
			expect( msg.buffer.slice( 0, 2 ) ).and.deep.eq( Buffer.from( [ 0x80, 0x00 ] ) );
			done();
		} );

		session.pingHost( '2001:4860:4860::8888' );
	} );

	// expect( msg ).to.have.property( 'sent' ).and.be.instanceOf( Array ).with.length( 2 );
	// expect( msg ).to.have.property( 'time' ).and.be.instanceOf( Array ).with.length( 2 );
	// expect( msg.time[ 1 ] ).to.be.lte( 2000000 );
	// expect( msg ).to.have.property( 'type' ).and.eq( 0 );
	// expect( msg ).to.have.property( 'code' ).and.eq( 0 );
	// expect( msg ).to.have.property( 'readableTime' ).and.eq( `${ session.convertHRTime( msg.time ) } ms` );
} );
