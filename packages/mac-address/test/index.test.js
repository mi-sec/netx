/** ****************************************************************************************************
 * File: index.test.js
 * Project: mi-sec-net
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

import chai from 'chai';

const { expect } = chai;

import macAddress, { MAC_BYTES } from '../index.js';

describe( `${ process.env.npm_package_name } v${ process.env.npm_package_version }`, function() {
	it( 'convert 0x0 MAC Address with any delimiter to buffer', () => {
		expect( macAddress( '00:00:00:00:00:00' ) )
			.to.have.length( MAC_BYTES )
			.to.deep.equal( Buffer.alloc( MAC_BYTES, 0x0 ) );
	} );

	it( 'convert hex MAC Address with any delimiter to buffer', () => {
		expect( macAddress( '12-34-56-78-90-AB' ) )
			.to.have.length( MAC_BYTES )
			.to.deep.equal( Buffer.from( [ 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB ] ) );
	} );

	it( 'convert hex MAC Address with no delimiter to buffer', () => {
		expect( macAddress( '1234567890AB' ) )
			.to.have.length( MAC_BYTES )
			.to.deep.equal( Buffer.from( [ 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB ] ) );
	} );

	it( 'convert hex number MAC Address to buffer', () => {
		expect( macAddress( 0x1234567890AB ) )
			.to.have.length( MAC_BYTES )
			.to.deep.equal( Buffer.from( [ 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB ] ) );
	} );

	it( 'convert number MAC Address to buffer', () => {
		expect( macAddress( 20015998341291 ) )
			.to.have.length( MAC_BYTES )
			.to.deep.equal( Buffer.from( [ 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB ] ) );
	} );

	it( 'expect malformed MAC Address to throw error', () => {
		expect( () => macAddress( '1234567890ZZ' ) )
			.to.throw( 'malformed MAC address "1234567890ZZ"' );
	} );
} );
