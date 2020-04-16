/** ****************************************************************************************************
 * File: port-scanner.test.js
 * Project: @mi-sec/port-scanner
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import chai from 'chai';

const { expect } = chai;

import { scan } from '../lib/port-scanner.js';

function convertHighResolutionTime( hrtime ) {
	const
		nano    = ( hrtime[ 0 ] * 1e9 ) + hrtime[ 1 ],
		seconds = nano / 1e9;

	return seconds + 's';
}


describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function() {
	this.timeout( 10000 );

	it( 'should scan target address and port', async () => {
		try {
			const start = process.hrtime();

			const x = await scan( {
				host: '192.168.1.7',
				onlyReportOpen: true,
			} );

			const end = process.hrtime( start );
			console.log( convertHighResolutionTime( end ) );

			console.log( x );
		} catch( e ) {
			console.error( 'error\n', e );
		}
		// expect( scanner.portState( '192.168.1.81', 22 ) ).to.eq( true );
		// expect( scanner.portState( '192.168.1.81', 23 ) ).to.eq( false );
		// expect( scanner.portState( '192.168.1.81', 3000 ) ).to.eq( true );
		// expect( scanner.portState( '192.168.1.81', 3001 ) ).to.eq( false );
	} );
} );
