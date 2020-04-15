//
// Created by codebuddha on 4/15/20.
//

#include "SimpleAsyncWorker.h"
#include <chrono>
#include <thread>

SimpleAsyncWorker::SimpleAsyncWorker( Napi::Function &callback, int runTime )
	: AsyncWorker( callback ), runTime( runTime ) {
};

void SimpleAsyncWorker::Execute() {
	std::this_thread::sleep_for( std::chrono::seconds( runTime ) );
	if( runTime == 4 ) {
		SetError( "timeout" );
	}
};

void SimpleAsyncWorker::OnOK() {
	std::string msg = "SimpleAsyncWorker returning after 'working' " + std::to_string( runTime ) + " seconds.";
	Callback().Call( { Env().Null(), Napi::String::New( Env(), msg ) } );
};
