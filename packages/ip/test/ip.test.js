/** ****************************************************************************************************
 * File: mac-address.test.js
 * Project: @mi-sec/mac-address
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

const
	chai       = require( 'chai' ),
	{ expect } = chai;

const ip = require( '../lib/ip' );

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function () {
	it( 'should sum numbers', () => {
		expect( ip.sum( 1, 2 ) ).to.eq( 3 );
		expect( ip.subtract( 4, 1 ) ).to.eq( 3 );
	} );
} );
