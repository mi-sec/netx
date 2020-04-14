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
	
	it( 'should scan target address and port', () => {
		expect( scanner.portState( '192.168.1.81', 3000 ) ).to.eq( true );
	} );
} );
