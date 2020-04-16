#include "scanner.h"
#include "ScanAsyncWorker.h"

Napi::String ping( const Napi::CallbackInfo &info ) {
	Napi::Env env = info.Env();
	std::string result = "pong";
	return Napi::String::New( env, result );
}

Napi::Value scan( const Napi::CallbackInfo &info ) {
	Napi::Env env = info.Env();
	
	auto deferred = Napi::Promise::Deferred::New( env );
	
	if( info.Length() < 1 || ( !info[ 0 ].IsObject() ) ) {
		deferred.Reject(
			Napi::TypeError::New( env, "Argument Error - expected object for parameter[ 0 ]" )
				.Value()
		);
		
		return deferred.Promise();
	}
	
	Napi::Object opts = info[ 0 ].ToObject();
	
	if( opts.Has( "target" ) ) {
		if( !opts.Get( "target" ).IsString() ) {
			deferred.Reject(
				Napi::TypeError::New( env, "Argument Error - opts.target expected to be a string" )
					.Value()
			);
			
			return deferred.Promise();
		}
	} else {
		deferred.Reject(
			Napi::TypeError::New( env, "Argument Error - options expected to have property 'target'" )
				.Value()
		);
		
		return deferred.Promise();
	}
	
	if( opts.Has( "ports" ) ) {
		if( !opts.Get( "ports" ).IsArray() ) {
			deferred.Reject(
				Napi::TypeError::New( env, "Argument Error - opts.ports expected to be an array" )
					.Value()
			);
			
			return deferred.Promise();
		}
	} else {
		deferred.Reject(
			Napi::TypeError::New( env, "Argument Error - options expected to have property 'ports'" )
				.Value()
		);
		
		return deferred.Promise();
	}
	
	return ScanAsyncWorker::Scan( env, deferred, opts );
}
