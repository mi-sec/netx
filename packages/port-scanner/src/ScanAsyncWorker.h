#pragma once

#include <napi.h>
#include <SFML/Network.hpp>
#include <pcap.h>

#ifndef SCANNER_SCANASYNCWORKER_H
#define SCANNER_SCANASYNCWORKER_H

class ScanAsyncWorker : public Napi::AsyncWorker {
public:
	static Napi::Value Scan( Napi::Env &env, Napi::Promise::Deferred &def, Napi::Object &opts ) {
		ScanAsyncWorker *worker = new ScanAsyncWorker( env, def );
		worker->SetTarget( opts.Get( "target" ).ToString() );
		
		Napi::Array narr = opts.Get( "ports" ).As< Napi::Array >();
		int len = narr.Length();
		for( unsigned int i = 0; i < len; i++ ) {
			worker->AddPort( i, narr.Get( i ).ToNumber().Uint32Value() );
		}
		
		if( opts.Has( "onlyReportOpen" ) ) {
			worker->SetOnlyReportOpen( opts.Get( "onlyReportOpen" ).ToBoolean() );
		} else {
			worker->SetOnlyReportOpen( true );
		}
		
		if( opts.Has( "timeout" ) ) {
			worker->SetTimeout( opts.Get( "timeout" ).ToNumber().DoubleValue() );
		} else {
			worker->SetTimeout( 1000 );
		}
		
		worker->Queue();
		return worker->deferred.Promise();
	}

protected:
	// TODO: make UDP connection wrapper
	// https://www.sfml-dev.org/documentation/2.5.1/classsf_1_1UdpSocket.php
	void Execute() override {
		for( int port : ports ) {
			sf::TcpSocket socket;
			//			sf::Time t = sf::milliseconds( timeout );
			sf::Time t = sf::milliseconds( 1000 );
			sf::Socket::Status status = socket.connect( target, port, t );
			
			std::cout << "Scanning: " << target << ":" << port << std::endl;
			if( status == sf::Socket::Done ) {
				if( status == sf::Socket::Disconnected ) {
					result.insert( std::pair< int, bool >( port, true ) );
				}
				
				std::cout << "Status: " << std::to_string( status ) << std::endl;
				
				char buffer[1024];
				std::size_t received = 0;
				socket.receive( buffer, sizeof( buffer ), received );
				std::cout << "The server said: " << buffer << std::endl;
			} else if( !onlyReportOpen ) {
				result.insert( std::pair< int, bool >( port, false ) );
			}
		}
	}
	
	virtual void OnOK() override {
		Napi::Array arr = Napi::Array::New( Env(), result.size() );
		
		uint32_t i = 0;
		for( std::pair< int, bool > item : result ) {
			uint32_t idx = i++;
			uint32_t k = 0;
			uint32_t v = 1;
			Napi::Array marr = Napi::Array::New( Env(), 2 );
			marr.Set( k, item.first );
			marr.Set( v, item.second );
			arr.Set( idx, marr );
		}
		
		// deferred.Resolve( Napi::String::New( Env(), result ) );
		deferred.Resolve( arr );
	}
	
	virtual void OnError( const Napi::Error &error ) override {
		deferred.Reject( error.Value() );
	}
	
	virtual void SetTarget( std::string str ) {
		target = str;
	}
	
	virtual void AddPort( int idx, int port ) {
		ports.push_back( port );
	}
	
	virtual void SetOnlyReportOpen( bool b ) {
		onlyReportOpen = b;
	}
	
	virtual void SetTimeout( double d ) {
		timeout = d;
	}

private:
	ScanAsyncWorker( Napi::Env &env, Napi::Promise::Deferred &def )
		: Napi::AsyncWorker( env ),
		  deferred( def ) {
	}
	
	Napi::Promise::Deferred deferred;
	std::map< int, bool > result;
	std::string target;
	std::vector< int > ports;
	double timeout;
	bool onlyReportOpen;
};

#endif //SCANNER_SCANASYNCWORKER_H
