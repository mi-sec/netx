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

			const x = await scan( {} );

			const end = process.hrtime( start );
			console.log( convertHighResolutionTime( end ) );

			console.log( x );
		}
		catch ( e ) {
			console.error( 'error\n', e );
		}
	} );
} );
