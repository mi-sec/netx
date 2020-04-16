#include <napi.h>
#include <string>
#include "scanner.h"

Napi::Object Init( Napi::Env env, Napi::Object exports ) {
	exports.Set(
		Napi::String::New( env, "ping" ),
		Napi::Function::New( env, ping )
	);
	
	exports.Set(
		Napi::String::New( env, "scan" ),
		Napi::Function::New( env, scan )
	);
	
	return exports;
}

// register `scanner` module which calls `Init` method
NODE_API_MODULE(
	scanner,
	Init
)
