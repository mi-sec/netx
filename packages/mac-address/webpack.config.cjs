const
	{
		resolve,
		dirname,
		basename,
		extname
	} = require( 'path' ),
	{
		main: output,
		module: input,
		dependencies
	} = require( './package' );

module.exports = {
	mode: 'production',
	target: 'node',
	entry: resolve( input ),
	output: {
		path: dirname( resolve( output ) ),
		filename: basename( output ),
		library: basename( output, extname( output ) ),
		libraryTarget: 'umd'
	},
	externals: Object.keys( dependencies || {} )
};
