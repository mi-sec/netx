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

static bool port_is_open( const std::string &address, int port ) {
	return ( sf::TcpSocket().connect( address, port ) == sf::Socket::Done );
}

Napi::Boolean portState( const Napi::CallbackInfo &info ) {
	Napi::Env env = info.Env();
	
	std::string target = info[ 0 ].As< Napi::String >().Utf8Value();
	int port = ( int ) info[ 1 ].As< Napi::Number >().Uint32Value();
	target = "192.168.1.81";
	
	bool result = sf::TcpSocket().connect( target, port ) == sf::Socket::Done;
	//	bool result = port == 3000;
	
	return Napi::Boolean::New( env, result );
}
