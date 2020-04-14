{
	"targets": [
		{
			"target_name": "scanner",
			"sources": [
				"./src/scanner.cpp",
				"./src/index.cpp",
				"<!(node -p \"require('path').join(process.cwd(),'deps','SFML','include','SFML','Network.hpp')\")"
			],
			"dependencies": [
				"<!(node -p \"require('node-addon-api').gyp\")"
			],
			"include_dirs": [
				"<!@(node -p \"require('node-addon-api').include\")"
			],
			"defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
			"cflags!": [ "-fno-exceptions" ],
			"cflags_cc!": [ "-fno-exceptions" ]
		}
	]
}
