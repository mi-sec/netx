/** ****************************************************************************************************
 * File: port-scanner.test.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import chai from 'chai';

const { expect } = chai;

import scanner from '../lib/port-scanner.js';

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function() {
	it( 'should build basic ping-pong test', () => {
		expect( scanner.ping() ).to.eq( 'pong' );
	} );
	
	it( 'should scan target address and port', async () => {
		console.log( scanner );
		
		try {
			const x = await scanner.portScan(
				[ '192.168.1.81' ],
				[ 22, 80 ]
			)
			
			console.log( x );
		} catch( e ) {
			console.error( 'error\n', e );
		}
		expect( scanner.portState( '192.168.1.81', 22 ) ).to.eq( true );
		expect( scanner.portState( '192.168.1.81', 23 ) ).to.eq( false );
		expect( scanner.portState( '192.168.1.81', 3000 ) ).to.eq( true );
		expect( scanner.portState( '192.168.1.81', 3001 ) ).to.eq( false );
	} );
} );
