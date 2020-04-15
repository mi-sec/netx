#include "scanner.h"

// native C++ function that is assigned to `hello` property on `exports` object
Napi::String ping( const Napi::CallbackInfo &info ) {
	Napi::Env env = info.Env();
	
	// call `helloUser` function from `scanner.cpp` file
	//	std::string user = ( std::string ) info[ 0 ].ToString();
	std::string result = "pong";
	
	// return new `Napi::String` value
	return Napi::String::New( env, result );
}

static bool isPortOpen( const std::string &address, int port ) {
	return ( sf::TcpSocket().connect( address, port ) == sf::Socket::Done );
}

Napi::Boolean portState( const Napi::CallbackInfo &info ) {
	Napi::Env env = info.Env();
	
	std::string target = info[ 0 ].As< Napi::String >().Utf8Value();
	int port = ( int ) info[ 1 ].As< Napi::Number >().Uint32Value();
	
	bool result = isPortOpen( target, port );
	
	return Napi::Boolean::New( env, result );
}

Napi::Promise portScan( const Napi::CallbackInfo &info ) {
	Napi::Env env = info.Env();
	
	auto deferred = Napi::Promise::Deferred::New( env );
	
	if( info.Length() < 1 || ( !info[ 0 ].IsArray() && !info[ 0 ].IsString() ) ) {
		deferred.Reject(
			Napi::TypeError::New( env, "Argument Error - expected string or array<string> parameter [ 0 ]" )
				.Value()
		);
		
		return deferred.Promise();
	} else if( info.Length() < 2 || ( !info[ 1 ].IsArray() && !info[ 1 ].IsNumber() ) ) {
		deferred.Reject(
			Napi::TypeError::New( env, "Argument Error - expected number or array<numbers> for parameter [ 1 ]" )
				.Value()
		);
		
		return deferred.Promise();
	}
	
	Napi::Array targets = info[ 0 ].As< Napi::Array >();
	Napi::Array ports = info[ 1 ].As< Napi::Array >();
	//	int port = ( int ) info[ 1 ].As< Napi::Number >().Uint32Value();
	//
	//	bool result = isPortOpen( target, port );
	Napi::Array result = Napi::Array::New( env );
	uint32_t idx = 0;
	result.Set( idx++, targets );
	result.Set( idx++, ports );
	
	deferred.Resolve( result );
	//	return Napi::Array::New( env, targets );
	return deferred.Promise();
}
