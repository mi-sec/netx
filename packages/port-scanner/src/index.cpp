#include <napi.h>
#include <string>
#include "scanner.h"

// callback method when module is registered with Node.js
Napi::Object Init( Napi::Env env, Napi::Object exports ) {
	exports.Set(
		Napi::String::New( env, "ping" ),
		Napi::Function::New( env, ping )
	);
	
	exports.Set(
		Napi::String::New( env, "portState" ),
		Napi::Function::New( env, portState )
	);
	
	exports.Set(
		Napi::String::New( env, "portScan" ),
		Napi::Function::New( env, portScan )
	);
	
	// return `exports` object (always)
	return exports;
}

// register `scanner` module which calls `Init` method
NODE_API_MODULE(
	scanner,
	Init
)
