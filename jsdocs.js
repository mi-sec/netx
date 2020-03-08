/** ****************************************************************************************************
 * File: index.js
 * Project: netx
 * @author MI-SEC
 *******************************************************************************************************/
'use strict';

/**
 * @global
 * @typedef {number} milliseconds
 * @description
 * A number assumed to be in milliseconds.<br/>
 * Number is likely to be calculated against a Unix Epoch based timestamp or milliseconds since Jan 01 1970.<br/>
 * When multiplied by <code>1e-3</code>, number should convert to seconds
 * @mixin
 */

/**
 * @global
 * @typedef {number[]} hrtime
 * @description
 * A "tuple" assumed to be a result of calling for high resolution time <code>process.hrtime</code><br/>
 * typically, a resulting <code>hrtime</code> should be the returned value of
 * <code>process.hrtime( process.hrtime() );</code> where the inner <code>hrtime</code>
 * is likely called before a function is run to calculate the time it took to run a process.
 * tuple is assumed to be in nanoseconds
 * @example
 * [ 22727, 841838045 ]
 * @mixin
 */

/**
 * @global
 * @typedef {number|string} radix
 * @property {number} binary - specify 2 to return binary radix value
 * @property {number} octal - specify 8 to return octal radix value
 * @property {number} base10 - specify 10 to return base10 radix value
 * @property {number} hexadecimal - specify 16 to return hexadecimal radix value
 * @mixin
 */

/**
 * @global
 * @typedef {number|string} bytes
 * @description
 * The byte is a unit of digital information that most commonly consists of eight bits.
 * Pertains to this application as a number or string expected to be a digital information measurement of "bytes"
 *
 * Recognized conversion units:
 * <table class="params">
 *     <thead><tr><th>(Unit)</th><th>[Standard Base 10]</th><th>[Digital Storage Unit 2ⁿ]</th></tr></thead>
 *     <tbody>
 *         <tr><td>(B)</td><td>Bytes</td><td>Bytes</td></tr>
 *         <tr><td>(kB|KiB)</td><td>Kilobytes</td><td>Kibibytes</td></tr>
 *         <tr><td>(mB|MiB)</td><td>Megabytes</td><td>Megibytes</td></tr>
 *         <tr><td>(gB|GiB)</td><td>Gigabytes</td><td>Gigibytes</td></tr>
 *         <tr><td>(tB|TiB)</td><td>Terabytes</td><td>Teribytes</td></tr>
 *     </tbody>
 * </table>
 *
 * @example
 * 1 KB <-> 1000
 * 1 KiB <-> 1024
 * 1 Kilobytes <-> 1000
 * 1 Kibibytes <-> 1024
 * @mixin
 */

/**
 * @global
 * @typedef {string} uuid
 * @description
 * UUIDs (Universally Unique IDentifier), also known as GUIDs (Globally Unique IDentifier).
 * A UUID is 128 bits long, and can guarantee uniqueness across space and time.
 * <a href="https://tools.ietf.org/html/rfc4122">RFC-4122</a>
 *
 * Assumed to be a hexadecimal string compliant with one of the following:
 * <ul>
 * <li><a href="https://tools.ietf.org/html/rfc4122#section-4.1.5">Time-Based UUID Version 1</a></li>
 * <li><a href="https://tools.ietf.org/html/rfc4122#section-4.3">Name-Based UUID Version 3 & 5</a></li>
 * <li><a href="https://tools.ietf.org/html/rfc4122#section-4.4">Truly-Random or Pseudo-Random Version 4</a></li>
 * </ul>
 * @example
 * a0ac3f6e-510e-45d8-b199-07d63f23a011
 * @mixin
 */

module.exports = {
	plugins: [
		'plugins/markdown'
	],
	markdown: {
		idInHeadings: true
	},
	recurseDepth: 20,
	source: {
		include: [
			'README.md',
			'./'
		],
		exclude: [
			'node_modules',
			'test',
			'docs'
		],
		includePattern: '.+\\.js(doc|x)?$',
		excludePattern: '(^|\\/|\\\\)_'
	},
	sourceType: 'module',
	tags: {
		allowUnknownTags: true,
		dictionaries: [
			'jsdoc',
			'closure'
		]
	},
	templates: {
		cleverLinks: true,
		monospaceLinks: true
	},
	opts: {
		encoding: 'utf8',
		destination: 'documentation',
		recurse: true,
		template: './node_modules/postman-jsdoc-theme',
		tutorials: './'
	}
};
